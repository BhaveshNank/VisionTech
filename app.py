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
    Sends filtered product data to Gemini for recommendation.
    """
    
    # Get filtered products
    filtered_products = filter_products_for_gemini(user_data, structured_products)
    print(f"🔍 Sending {len(filtered_products)} products to Gemini")

    # If no products match constraints, inform the user
    if not filtered_products:
        return {"response_type": "recommendation", "message": "I couldn't find any products that match all your criteria. Please consider adjusting your budget or brand preferences."}

    # Convert structured products into JSON for Gemini
    products_json = json.dumps(filtered_products, indent=2)

    gpt_payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "text": f"""
        You are a digital shopping assistant helping customers find the best products.

        ### **VERY IMPORTANT INSTRUCTION: You must ONLY recommend products from the exact list provided below. DO NOT create, invent, or suggest any products that aren't in this list.**

        ### **User's Requirements:**
        - Category: {user_data['category']}
        - Purpose: {user_data['purpose']}
        - Features: {", ".join(user_data['features']) if user_data['features'] else "None"}
        - Budget: {user_data['budget']}
        - Preferred Brand: {user_data['brand']}

        ### **Available Products (ONLY recommend from this list):**
        ```json
        {products_json}
        ```

        ### **Instructions:**
        1. Choose ONLY products from the above list that best match the user's requirements.
        2. Recommend 2-3 products (or all matching products if fewer are available).
        3. DO NOT make up any products or features.
        4. If no products match all criteria, suggest the closest matches from the list.
        5. Respond ONLY in this exact JSON format:

        ```json
        {{
          "response_type": "recommendation",
          "message": "Here are the best matching products:",
          "recommended_products": [
            {{
              "name": "Exact Product Name from List",
              "price": "Price from List",
              "features": ["Feature1", "Feature2", "Feature3"]
            }},
            {{
              "name": "Another Product Name from List",
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
            return {"response_type": "recommendation", "message": "Failed to process query."}

        response_data = response.json()
        generated_text = response_data["candidates"][0]["content"]["parts"][0].get("text", "")
        
        print(f"🔍 Raw Gemini response text: {generated_text[:200]}...")

        # Extract JSON from Gemini response
        json_match = re.search(r"```json\s*({.*?})\s*```", generated_text, re.DOTALL)
        if not json_match:
            print("❌ Failed to extract JSON from Gemini response")
            print(f"🔍 Full response text: {generated_text}")
            return {"response_type": "recommendation", "message": "I couldn't find suitable products."}

        parsed_json = json.loads(json_match.group(1).strip())
        
        # Verify that recommended products actually match those in our database
        if "recommended_products" in parsed_json:
            valid_products = []
            
            # Get all available product names from our database for comparison
            available_product_names = [p["name"] for p in filtered_products]
            
            for product in parsed_json["recommended_products"]:
                if product["name"] in available_product_names:
                    # This is a valid product from our database
                    valid_products.append(product)
                else:
                    print(f"⚠️ Warning: Gemini recommended '{product['name']}' which is not in our database")
            
            # Replace with only valid products from our database
            parsed_json["recommended_products"] = valid_products
            
            if not valid_products:
                parsed_json["message"] = "I couldn't find any products in our database that match your criteria. Please adjust your preferences."
        
        print(f"✅ Successfully parsed JSON response with validated products")
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
    Parses a budget range from a string like '1000-2000' or 'below 1500'.
    Returns (min_budget, max_budget) or (None, None) if invalid.
    """
    if not budget_string:
        return None, None  # ✅ Return None if no budget was provided

    budget_string = budget_string.lower().replace("$", "").strip()
    numbers = re.findall(r"\d+", budget_string)  # ✅ Extract all numbers

    if len(numbers) == 2:  # ✅ Case: "1000-2000"
        return int(numbers[0]), int(numbers[1])

    if len(numbers) == 1:
        if "below" in budget_string:
            return None, int(numbers[0])  # ✅ Case: "below 1500"
        if "above" in budget_string:
            return int(numbers[0]), None  # ✅ Case: "above 1000"
        return int(numbers[0]), None  # ✅ Case: "budget is 1500"

    return None, None  # ❌ No valid numbers found


def extract_numeric_price(price_string):
    """
    Extracts numeric price from a string like '$2399' or '2399' and returns it as an integer.
    If the price is 'N/A' or non-numeric, returns None.
    """
    if not price_string or price_string in ["N/A", "null", ""]:
        return None  # No price available

    price_match = re.search(r"\d+", str(price_string))  # ✅ Ensure input is a string
    return int(price_match.group()) if price_match else None




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
