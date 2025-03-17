from flask import Flask, request, jsonify, make_response, session
from pymongo import MongoClient
import requests
import re
from flask_cors import CORS
from functools import wraps
import logging 
import json 
import os
from flask_session import Session

app = Flask(__name__)
# ✅ Configure Flask Session
app.config['SECRET_KEY'] = 'YOUR_FLASK_SECRET_KEY_HERE'
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_FILE_DIR'] = os.path.join(os.getcwd(), '.flask_session')

# ✅ Set session cookie policies
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # Prevents strict blocking
app.config['SESSION_COOKIE_SECURE'] = False  # Keep False for local HTTP (set True for HTTPS)

# ✅ Apply CORS with proper settings
CORS(app, 
     resources={r"/*": {"origins": "http://localhost:3000"}}, 
     supports_credentials=True,
     expose_headers=["Content-Type", "Authorization"],
     allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
     methods=["GET", "POST", "OPTIONS"]
)


# ✅ Initialize Flask-Session
Session(app)

# MongoDB Connection 
client = MongoClient("mongodb://localhost:27017/")  # Connect to MongoDB
db = client["ecommerce_db"]  # The database name
collection = db["products"]  # The collection in that database 


# Google Gemini API Setup
api_key = "AIzaSyC7Jz_zIbn6yBgcaZCOpRoph_EC020SsRo"
endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key={api_key}"

headers = {
    "Content-Type": "application/json"
}

def validate_request(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not request.is_json:
            return make_response(jsonify({"error": "Request must be JSON"}), 400)
        return f(*args, **kwargs)
    return decorated_function

@app.errorhandler(500)
def handle_server_error(error):
    return jsonify({
        "error": "Internal server error occurred",
        "details": str(error)
    }), 500

# Add this helper function near the top of your file, after impo

# Test route to check if Flask is running
@app.route('/test', methods=['GET'])
def test():
    logging.info("Test API called")
    return jsonify({"message": "API is working!"}), 200

@app.route('/chat', methods=['OPTIONS'])
def chat_options():
    """Handle CORS Preflight Request"""
    response = jsonify({"message": "CORS preflight successful"})
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response, 200



@app.route('/products/<category>', methods=['GET'])
def get_products_by_category(category):
    """
    Fetch all products belonging to a specific category from the database.
    """
    # Search for the category in the database
    category_data = collection.find_one(
    {"category": {"$regex": f"^{re.escape(category)}s?$", "$options": "i"}},
    {"products": 1, "_id": 0}
)


    if not category_data:
        return jsonify({"reply": f"No {category}s found in the database."}), 200

    # Extract products from the category document
    product_list = [
        f"{product.get('name', 'Unknown Product')} - Price: ${product.get('price', 'N/A')}"
        for product in category_data.get("products", [])
    ]

    return jsonify({"reply": "\n".join(product_list)})

# @app.route('/debug-products', methods=['GET'])
# def debug_products():
#     try:
#         # Fetch products from MongoDB
#         structured_products = fetch_products_from_database()
        
#         # Print for debugging
#         print(f"📢 Debugging Products: {json.dumps(structured_products, indent=2)}")

#         # Return JSON response
#         return jsonify(structured_products)

#     except Exception as e:
#         return jsonify({"error": str(e)})

@app.route('/debug-gemini', methods=['GET'])
def debug_gemini():
    """Debug endpoint to test Gemini directly"""
    try:
        sample_query = {
            "category": "phone",
            "purpose": "gaming",
            "features": ["camera quality"],
            "budget": "1000-1500",
            "brand": ""
        }
        
        # Get products for testing
        structured_products = fetch_products_from_database()
        
        # Send to Gemini
        gemini_response = send_to_gemini(sample_query, structured_products)
        
        # Return full response for inspection
        return jsonify({
            "raw_response": gemini_response,
            "has_recommended_products": "recommended_products" in gemini_response,
            "product_count": len(gemini_response.get("recommended_products", [])),
            "formatted_message": gemini_response.get("message", "No message found")
        })
        
    except Exception as e:
        return jsonify({"error": str(e)})


@app.route('/chat', methods=['POST'])
@validate_request
def chat():
    try:
        user_message = request.json.get("message", "").strip().lower()
        if not user_message:
            return jsonify({"error": "No message provided"}), 400

        # Initialize gemini_response early to prevent reference errors
        gemini_response = {"response_type": "error", "message": "An error occurred while processing your request."}

        # Ensure the session has all required keys
        if "new_chat" not in session or session["new_chat"]:
            session.clear()
            session["new_chat"] = False
            session["chat_stage"] = "greeting"
            session["selected_category"] = ""
            session["selected_purpose"] = ""
            session["selected_features"] = []
            session["selected_budget"] = ""
            session["selected_brand"] = ""

        # Ensure `chat_stage` exists in case it got lost
        if "chat_stage" not in session:
            session["chat_stage"] = "greeting"

        # First interaction: Greeting & Introduction
        if session["chat_stage"] == "greeting":
            session["chat_stage"] = "ask_purpose"
            return jsonify({"reply": "Hi! I'm SmartShop's assistant. We sell TVs, Phones, and Laptops. What kind of product are you looking for today?"})

        # Step 1: Detect Product Category (Laptops, Phones, TVs)
        if session["chat_stage"] == "ask_purpose":
            detected_category = detect_product_category(user_message)
            if not detected_category:
                return jsonify({"reply": "Could you clarify? Are you looking for a Phone, Laptop, or TV?"})

            session["selected_category"] = detected_category
            session["chat_stage"] = "ask_features"
            return jsonify({"reply": f"Great! What will you primarily use this {detected_category} for? (e.g., Gaming, Work, Entertainment)"})

        # Step 2: Ask for Features
        if session["chat_stage"] == "ask_features":
            session["selected_purpose"] = user_message
            session["chat_stage"] = "ask_budget"
            return jsonify({"reply": f"Do you have any specific features in mind for this {session['selected_category']}? (e.g., High Battery Life, Camera Quality, RAM, Screen Size)"})

        # Step 3: Ask for Budget & Brand
        if session["chat_stage"] == "ask_budget":
            session["selected_features"] = user_message.split(", ") if user_message.lower() != "none" else []
            session["chat_stage"] = "recommend_products"
            return jsonify({"reply": f"What's your budget range for this {session['selected_category']}? Do you have a preferred brand?"})

        # Step 4: Send Finalized Query to Gemini
        if session["chat_stage"] == "recommend_products":
            budget_brand_info = user_message.split(" and ")

            # Convert single price input into range if needed
            budget_input = budget_brand_info[0] if len(budget_brand_info) > 0 else ""
            if "-" not in budget_input and budget_input.isnumeric():
                session["selected_budget"] = f"0-{budget_input}"  # Converts "2000" → "0-2000"
            else:
                session["selected_budget"] = budget_input  # Keeps proper range format

            session["selected_brand"] = budget_brand_info[1] if len(budget_brand_info) > 1 else ""

            # Prepare structured data
            structured_query = {
                "category": session["selected_category"],
                "purpose": session["selected_purpose"],
                "features": session["selected_features"],
                "budget": session["selected_budget"],
                "brand": session["selected_brand"]
            }

            # Get products from database
            structured_products = fetch_products_from_database()
            print(f"✅ Using products for recommendation")

            # Send to Gemini for recommendation
            gemini_response = send_to_gemini(structured_query, structured_products)
            
            # Check if recommended_products exists in the response
            if "recommended_products" in gemini_response and gemini_response["recommended_products"]:
                products = gemini_response["recommended_products"]
                
                # Format each product into a string with bullet points
                product_strings = []
                for product in products:
                    name = product.get("name", "Unknown Product")
                    price = product.get("price", "Price unavailable")
                    features = product.get("features", [])
                    
                    # Format features as a comma-separated list (take only first 3 for brevity)
                    feature_text = ", ".join(features[:3]) if features else "No features listed"
                    
                    # Create formatted product string
                    product_str = f"• {name} - {price}\n  Key features: {feature_text}"
                    product_strings.append(product_str)
                
                # Combine intro message with product list
                intro_message = gemini_response.get("message", "Here are the best matching products:")
                formatted_response = f"{intro_message}\n\n{'\n\n'.join(product_strings)}"
                
                return jsonify({"reply": formatted_response})
            
            # If no products were found or there was an error
            return jsonify({"reply": gemini_response.get("message", "I couldn't find suitable products.")})

        # Handle any other unexpected stages
        return jsonify({"reply": "I'm not sure what to do next. Let's start over. What product are you looking for?"})

    except Exception as e:
        print(f"❌ ERROR in /chat: {e}")
        import traceback
        traceback.print_exc()  # Print full stack trace for debugging
        return jsonify({"error": "An internal server error occurred while processing your request."}), 500


@app.route('/debug-db', methods=['GET'])
def debug_db():
    try:
        # Check if we can connect to MongoDB
        db_names = client.list_database_names()
        collections = db.list_collection_names()
        
        # Try to count documents
        product_count = collection.count_documents({})
        
        # Get a sample document
        sample_doc = collection.find_one({})
        if sample_doc and "_id" in sample_doc:
            sample_doc["_id"] = str(sample_doc["_id"])  # Convert ObjectId to string
            
        return jsonify({
            "status": "connected",
            "databases": db_names,
            "collections": collections,
            "product_count": product_count,
            "sample_document": sample_doc
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})
    
# -------------------- **Helper Functions** --------------------

def detect_product_category(user_message):
    """
    Detects the product category (phone, laptop, or TV) based on user input.
    If no category is detected, returns an empty string.
    """
    category_keywords = {
        "phone": ["phone", "mobile", "smartphone", "iphone", "samsung", "android"],
        "laptop": ["laptop", "macbook", "notebook", "ultrabook", "gaming laptop"],
        "tv": ["tv", "television", "oled", "4k", "smart tv"]
    }

    # Convert user message to lowercase for case-insensitive matching
    user_message_lower = user_message.lower()

    # Check if any category keyword appears in the user message
    for category, keywords in category_keywords.items():
        if any(keyword in user_message_lower for keyword in keywords):
            return category  # ✅ Return the detected category

    return ""  # ❌ No category detected


def send_to_gemini(user_data, structured_products):
    """
    Sends user requirements and filtered products to Gemini for intelligent matching.
    """
    # Get products from the selected category
    category = user_data["category"].lower()
    all_products = structured_products.get(category, [])
    
    if not all_products:
        return {"response_type": "recommendation", 
                "message": f"I don't have any {category} products in our database at the moment."}
    
    print(f"🔍 Sending {len(all_products)} {category} products to Gemini")
    
    # Convert products to JSON for Gemini
    products_json = json.dumps(all_products, indent=2)

    # Prepare a natural language prompt with user requirements
    requirements = []
    if user_data["purpose"]:
        requirements.append(f"Will be used for: {user_data['purpose']}")
    if user_data["features"]:
        features_text = ", ".join(user_data["features"]) if isinstance(user_data["features"], list) else user_data["features"]
        requirements.append(f"Desired features: {features_text}")
    if user_data["budget"]:
        requirements.append(f"Budget: {user_data['budget']}")
    if user_data["brand"]:
        requirements.append(f"Preferred brand: {user_data['brand']}")
    
    requirements_text = "\n".join([f"- {req}" for req in requirements])

    gpt_payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "text": f"""
        You are a digital shopping assistant helping customers find the best products from our inventory.

        ### **USER REQUIREMENTS:**
        {requirements_text}

        ### **RULES FOR RECOMMENDATIONS:**
        1. ONLY recommend products from the EXACT list provided below
        2. For budget ranges like "1000-1500", recommend products in that exact range
        3. You may be flexible up to 10% ABOVE the maximum budget ONLY if the product is an excellent match
        4. For size ranges like "65-70 inch TV", ONLY recommend TVs within that exact size range
        5. DO NOT invent or make up products or features
        6. Recommend 2-3 products that best match the requirements
        7. If no products match ALL criteria, prioritize budget constraints first, then features

        ### **AVAILABLE PRODUCTS (ONLY recommend from this list):**
        ```json
        {products_json}
        ```

        ### **RESPONSE FORMAT:**
        Respond ONLY in this exact JSON format:

        ```json
        {{
          "response_type": "recommendation",
          "message": "Here are the best matching products based on your requirements:",
          "recommended_products": [
            {{
              "name": "Exact Product Name from List",
              "price": "Price from List",
              "features": ["Feature1", "Feature2", "Feature3"]
            }}
          ]
        }}
        ```
        """
                    }
                ]
            }
        ]
    }

    try:
        response = requests.post(endpoint, headers=headers, json=gpt_payload)
        print(f"🔄 Gemini API Response Status: {response.status_code}")

        if response.status_code != 200:
            print(f"❌ Gemini API Error: {response.text}")
            return {"response_type": "recommendation", "message": "Failed to process your query."}

        response_data = response.json()
        generated_text = response_data["candidates"][0]["content"]["parts"][0].get("text", "")
        
        # Extract JSON from Gemini response
        json_match = re.search(r"```json\s*({.*?})\s*```", generated_text, re.DOTALL)
        if not json_match:
            print("❌ Failed to extract JSON from Gemini response")
            return {"response_type": "recommendation", "message": "I couldn't find suitable products."}

        parsed_json = json.loads(json_match.group(1).strip())
        
        # Verify that recommended products actually match those in our database
        if "recommended_products" in parsed_json:
            valid_products = []
            available_product_names = [p["name"] for p in all_products]
            
            for product in parsed_json["recommended_products"]:
                if product["name"] in available_product_names:
                    valid_products.append(product)
                else:
                    print(f"⚠️ Warning: Gemini recommended '{product['name']}' which is not in our database")
            
            parsed_json["recommended_products"] = valid_products
            
            if not valid_products:
                parsed_json["message"] = "I couldn't find any products matching your criteria. Could you adjust your preferences?"
        
        return parsed_json

    except Exception as e:
        print(f"❌ Exception in Gemini API call: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"response_type": "recommendation", "message": "An error occurred while processing your request."}



def fetch_products_from_database():
    """
    Fetches all products from MongoDB and structures them correctly.
    """
    try:
        products_cursor = collection.find({}, {"_id": 0})
        structured_products = {}

        # Short debug message
        print("🔍 Fetching products from database...")

        for doc in products_cursor:
            category = doc.get("category", "").strip().lower()
            
            if not category:
                continue  # Skip documents with no category
            
            # Initialize category list if it doesn't exist
            if category not in structured_products:
                structured_products[category] = []

            # Extract product details
            if "products" in doc and isinstance(doc["products"], list):
                for sub_prod in doc["products"]:
                    product_name = sub_prod.get("name", "").strip()
                    product_price = sub_prod.get("price", "N/A")
                    product_features = sub_prod.get("specifications", [])
                    product_brand = sub_prod.get("brand", "").strip()

                    # Skip products without a name
                    if not product_name:
                        continue

                    # Handle missing data
                    if product_price == "N/A" or product_price is None:
                        product_price = "Unknown Price"

                    if not product_brand:
                        product_brand = "Generic Brand"
                    
                    # Add to structured products
                    structured_products[category].append({
                        "name": product_name,
                        "price": f"${product_price}" if isinstance(product_price, (int, float)) else product_price,
                        "features": product_features,
                        "brand": product_brand
                    })

        # Shorter summary debug
        product_counts = {cat: len(prods) for cat, prods in structured_products.items()}
        print(f"📦 Loaded products: {product_counts}")
        
        return structured_products

    except Exception as e:
        print(f"❌ MongoDB Error: {str(e)}")
        return {}



def parse_budget_range(budget_string):
    """
    Parse budget ranges using regex patterns rather than hardcoded phrases.
    """
    if not budget_string:
        return None, None
    
    # Remove currency symbols and normalize
    budget_string = re.sub(r'[$£€]', '', budget_string.lower().strip())
    
    # Pattern for range like "X-Y" or "between X and Y"
    range_pattern = re.search(r'(\d+)(?:\s*-\s*|\s+to\s+|\s+and\s+)(\d+)', budget_string)
    if range_pattern:
        return int(range_pattern.group(1)), int(range_pattern.group(2))
    
    # Pattern for "around X" or "about X"
    approx_pattern = re.search(r'(?:around|about|approximately|roughly)\s+(\d+)', budget_string)
    if approx_pattern:
        value = int(approx_pattern.group(1))
        # Create a range of ±15%
        return int(value * 0.85), int(value * 1.15)
    
    # Pattern for "under X" or "below X"
    under_pattern = re.search(r'(?:under|below|less than|at most)\s+(\d+)', budget_string)
    if under_pattern:
        return None, int(under_pattern.group(1))
    
    # Pattern for "over X" or "above X"
    over_pattern = re.search(r'(?:over|above|more than|at least)\s+(\d+)', budget_string)
    if over_pattern:
        return int(over_pattern.group(1)), None
    
    # Single number fallback
    single_number = re.search(r'(\d+)', budget_string)
    if single_number:
        value = int(single_number.group(1))
        return None, value
    
    return None, None

def extract_numeric_price(price_string):
    """
    Extracts numeric price from a string like '$2399' or '2399' and returns it as an integer.
    If the price is 'N/A' or non-numeric, returns None.
    """
    if not price_string or price_string in ["N/A", "null", ""]:
        return None  # No price available

    price_match = re.search(r"\d+", str(price_string))  # ✅ Ensure input is a string
    return int(price_match.group()) if price_match else None

# def extract_key_features(message, category):
#     """
#     Extract product features using regex patterns rather than hardcoded feature lists.
#     """
#     features = []
    
#     # Screen size pattern (works for TVs, phones, laptops)
#     size_pattern = re.search(r'(\d+)(?:\s*-\s*(\d+))?\s*(?:inch|in|")(?:\s+screen|\s+display)?', message)
#     if size_pattern:
#         if size_pattern.group(2):  # Range like "50-60 inch"
#             features.append(f"size_range:{size_pattern.group(1)}-{size_pattern.group(2)}")
#         else:  # Single size like "55 inch"
#             features.append(f"size:{size_pattern.group(1)}")
    
#     # Common product-specific patterns
#     if category == "tv":
#         # TV resolution
#         if re.search(r'4k|uhd|ultra\s*hd', message):
#             features.append("resolution:4K")
#         elif re.search(r'8k', message):
#             features.append("resolution:8K")
        
#         # TV panel type
#         if re.search(r'oled', message):
#             features.append("panel:OLED")
#         elif re.search(r'qled', message):
#             features.append("panel:QLED")
    
#     elif category == "phone":
#         # Camera quality
#         camera_pattern = re.search(r'camera|photo|pictures|photography', message)
#         if camera_pattern:
#             features.append("feature:camera")
        
#         # Battery life
#         if re.search(r'battery|long\s*lasting|all\s*day', message):
#             features.append("feature:battery")
            
#         # Gaming performance
#         if re.search(r'gaming|games|play|performance', message):
#             features.append("feature:performance")
    
#     elif category == "laptop":
#         # RAM/memory
#         ram_pattern = re.search(r'(\d+)\s*(?:gb|g)\s*(?:ram|memory)', message)
#         if ram_pattern:
#             features.append(f"ram:{ram_pattern.group(1)}")
        
#         # Storage
#         storage_pattern = re.search(r'(\d+)\s*(?:gb|g|tb|t)\s*(?:storage|ssd|hard\s*drive)', message)
#         if storage_pattern:
#             features.append(f"storage:{storage_pattern.group(1)}")
            
#         # Performance category
#         if re.search(r'gaming|powerful|fast|performance', message):
#             features.append("performance:high")
#         elif re.search(r'basic|simple|everyday|browsing', message):
#             features.append("performance:basic")
    
#     return features


def filter_products_for_gemini(user_data, structured_products):
    """
    Filters products based on basic criteria, but with more flexibility.
    """
    category = user_data["category"].lower()
    min_budget, max_budget = parse_budget_range(user_data["budget"])
    preferred_brand = user_data["brand"].lower() if user_data["brand"] else None

    # Get all products from the selected category
    all_products = structured_products.get(category, [])
    if not all_products:
        print(f"⚠️ No products found in category '{category}'")
        return []
    
    print(f"📊 Found {len(all_products)} products in category '{category}'")
    
    # Apply flexible filtering
    filtered_products = all_products.copy()
    
    # If we have strict matching criteria but no results, we'll gradually relax constraints
    
    # 1. Try strict filtering first (both budget and brand if specified)
    strict_filtered = []
    for product in filtered_products:
        product_price = extract_numeric_price(product["price"])
        product_brand = product["brand"].lower()
        
        # Skip products without a valid price when budget is specified
        if (min_budget or max_budget) and not product_price:
            continue
            
        # Budget filtering
        if min_budget and product_price and product_price < min_budget:
            continue
        if max_budget and product_price and product_price > max_budget:
            continue
            
        # Brand filtering
        if preferred_brand and preferred_brand not in product_brand:
            continue
            
        strict_filtered.append(product)
    
    # If we have strict matches, return them
    if strict_filtered:
        print(f"✅ Found {len(strict_filtered)} products matching all criteria")
        return strict_filtered
        
    # 2. If no strict matches, relax brand constraint if specified
    if preferred_brand:
        brand_relaxed = []
        for product in filtered_products:
            product_price = extract_numeric_price(product["price"])
            
            # Skip products without a valid price when budget is specified
            if (min_budget or max_budget) and not product_price:
                continue
                
            # Only apply budget filtering
            if min_budget and product_price and product_price < min_budget:
                continue
            if max_budget and product_price and product_price > max_budget:
                continue
                
            brand_relaxed.append(product)
            
        if brand_relaxed:
            print(f"✅ Found {len(brand_relaxed)} products after relaxing brand constraint")
            return brand_relaxed
    
    # 3. If still no matches, relax budget slightly (±20%)
    budget_relaxed = []
    relaxed_min = min_budget * 0.8 if min_budget else None
    relaxed_max = max_budget * 1.2 if max_budget else None
    
    for product in filtered_products:
        product_price = extract_numeric_price(product["price"])
        product_brand = product["brand"].lower()
        
        # Skip products without a valid price when budget is specified
        if (relaxed_min or relaxed_max) and not product_price:
            continue
            
        # Relaxed budget filtering
        if relaxed_min and product_price and product_price < relaxed_min:
            continue
        if relaxed_max and product_price and product_price > relaxed_max:
            continue
            
        # Brand filtering (if still applying)
        if preferred_brand and preferred_brand not in product_brand:
            continue
            
        budget_relaxed.append(product)
    
    if budget_relaxed:
        print(f"✅ Found {len(budget_relaxed)} products after relaxing budget constraints")
        return budget_relaxed
    
    # 4. If still no matches, return all products in the category as fallback
    print(f"ℹ️ No specific matches, returning all {len(all_products)} products in category")
    return all_products





if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)
