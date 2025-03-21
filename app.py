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
from flask import send_from_directory

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

@app.route('/images/<filename>')
def serve_image(filename):
    """Serve images from the static/images directory"""
    return send_from_directory('static/images', filename)  # ✅ Securely serve images

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

@app.route('/reset-session', methods=['GET', 'POST'])
def reset_session():
    """Reset the user's session to start a new chat"""
    # Clear all session data
    session.clear()
    
    # Initialize with default values
    session["new_chat"] = True
    session["chat_stage"] = "greeting"
    session["selected_category"] = ""
    session["selected_purpose"] = ""
    session["selected_features"] = []
    session["selected_budget"] = ""
    session["selected_brand"] = ""
    session["recommended_products"] = []
    session["chosen_product"] = None
    
    return jsonify({"status": "success", "message": "Session reset successfully"})

@app.route('/chat', methods=['POST'])
@validate_request
def chat():
    try:
        user_message = request.json.get("message", "").strip().lower()
        
        # Get the instance ID from the request
        instance_id = request.json.get("instance_id", "default")
        print(f"👤 Request from instance: {instance_id}")
        
        # Store session data in a namespace based on instance ID
        session_key = f"chat_data_{instance_id}"
        
        # Check if this is the first message of a new conversation
        is_first_message = request.json.get("new_chat", False)
        
        # Initialize session data for this instance if it doesn't exist or is a new chat
        if session_key not in session or is_first_message:
            session[session_key] = {
                "chat_stage": "greeting",
                "selected_category": "",
                "selected_purpose": "",
                "selected_features": [],
                "selected_budget": "",
                "selected_brand": "",
                "recommended_products": [],
                "chosen_product": None
            }
            print(f"✅ Initialized new session for instance: {instance_id}")
        
        # Get the chat data for this specific instance
        chat_data = session[session_key]
        
        # If this is the first message with empty content, just return the greeting
        if is_first_message and not user_message:
            return jsonify({"reply": "Hi! I'm SmartShop's virtual assistant. We sell TVs, Phones, and Laptops. What kind of product are you looking for today?"})
            
        # For a regular message with content
        # First interaction: Greeting & Introduction
        if chat_data["chat_stage"] == "greeting":
            chat_data["chat_stage"] = "ask_purpose"
            session[session_key] = chat_data  # Update session
            return jsonify({"reply": "Hi! I'm smartshop's virtual assistant. We sell TVs, Phones, and Laptops. What kind of product are you looking for today?"})

        # Step 1: Detect Product Category (Laptops, Phones, TVs)
        if chat_data["chat_stage"] == "ask_purpose":
            detected_category = detect_product_category(user_message)
            if not detected_category:
                return jsonify({"reply": "Could you clarify? Are you looking for a Phone, Laptop, or TV?"})

            chat_data["selected_category"] = detected_category
            chat_data["chat_stage"] = "ask_features"
            session[session_key] = chat_data  # Update session
            return jsonify({"reply": f"Great! What will you primarily use this {detected_category} for? (e.g., Gaming, Work, Entertainment)"})

        # Step 2: Ask for Features
        if chat_data["chat_stage"] == "ask_features":
            chat_data["selected_purpose"] = user_message
            chat_data["chat_stage"] = "ask_budget"
            session[session_key] = chat_data  # Update session
            return jsonify({"reply": f"Do you have any specific features in mind for this {chat_data['selected_category']}? (e.g., High Battery Life, Camera Quality, RAM, Screen Size)"})

        # Step 3: Ask for Budget & Brand
        if chat_data["chat_stage"] == "ask_budget":
            chat_data["selected_features"] = user_message.split(", ") if user_message.lower() != "none" else []
            chat_data["chat_stage"] = "recommend_products"
            session[session_key] = chat_data  # Update session
            return jsonify({"reply": f"What's your budget range for this {chat_data['selected_category']}? Do you have a preferred brand?"})

        # Step 4: Send Finalized Query to Gemini
        if chat_data["chat_stage"] == "recommend_products":
            # Store the raw user response from the budget/brand question
            budget_brand_response = user_message
            chat_data["budget_brand_response"] = budget_brand_response  # Store for later context
            
            # Prepare structured data - pass the raw response as additional context
            structured_query = {
                "category": chat_data["selected_category"],
                "purpose": chat_data["selected_purpose"],
                "features": chat_data["selected_features"],
                "budget_brand_response": budget_brand_response,
                "raw_response": True  # Flag to indicate we're passing the raw response
            }

            print(f"📋 Query to Gemini: {structured_query}")

            # Get products from database
            structured_products = fetch_products_from_database()
            print(f"✅ Using products for recommendation")

            # Send to Gemini for recommendation with enhanced context
            gemini_response = send_to_gemini(structured_query, structured_products)
            
            # Check if recommended_products exists in the response
            if "recommended_products" in gemini_response and gemini_response["recommended_products"]:
                products = gemini_response["recommended_products"]
                
                # Store the recommended products in the session
                chat_data["recommended_products"] = products
                
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
                
                # Add a prompt for further questions
                follow_up_prompt = "\n\nIs there anything specific about these products you'd like to know more about? Or would you like me to help you choose the best option based on a specific feature?"
                formatted_response += follow_up_prompt
                
                # Move to follow-up stage instead of resetting
                chat_data["chat_stage"] = "followup_questions"
                session[session_key] = chat_data
                
                return jsonify({"reply": formatted_response})
            
            # If no products were found or there was an error
            return jsonify({"reply": gemini_response.get("message", "I couldn't find suitable products.")})
            
        # NEW SECTION: Handle follow-up questions after recommendations
        if chat_data["chat_stage"] == "followup_questions":
            # Check for conversation closing signals
            if any(keyword in user_message.lower() for keyword in ["thank you", "thanks", "great", "perfect", "buy", "purchase", "add to cart"]):
                # User seems satisfied, provide a closing message and reset
                closing_message = "I'm glad I could help you find the right product! Is there anything else you'd like to know about our products?"
                
                # Reset the conversation but keep the category for potential follow-up
                original_category = chat_data["selected_category"]
                chat_data["chat_stage"] = "greeting"
                chat_data["selected_category"] = ""
                chat_data["selected_purpose"] = ""
                chat_data["selected_features"] = []
                chat_data["selected_budget"] = ""
                chat_data["selected_brand"] = ""
                chat_data["recommended_products"] = []
                chat_data["chosen_product"] = None
                session[session_key] = chat_data
                
                return jsonify({"reply": closing_message})
                
            # Check if we have recommended products to discuss
            if not chat_data["recommended_products"]:
                # Fallback if somehow we lost our recommendations
                chat_data["chat_stage"] = "greeting"
                session[session_key] = chat_data
                return jsonify({"reply": "I'm sorry, I've lost track of our product recommendations. Let's start over. What kind of product are you looking for today?"})
            
            # Prepare the follow-up query with context
            followup_query = {
                "category": chat_data["selected_category"],
                "purpose": chat_data["selected_purpose"],
                "features": chat_data["selected_features"],
                "budget_brand_response": chat_data.get("budget_brand_response", ""),
                "user_question": user_message,
                "is_followup": True,
                "recommended_products": chat_data["recommended_products"]
            }
            
            # Send to Gemini for follow-up response
            followup_response = send_followup_to_gemini(followup_query)
            
            # Check if the response indicates a final choice
            if followup_response.get("final_choice"):
                chat_data["chosen_product"] = followup_response["final_choice"]
                
                # Format the final choice message
                final_product = followup_response["final_choice"]
                final_message = followup_response.get("message", "Based on our conversation, I think this is the best choice for you:")
                
                # Create a formatted product string for the final choice
                name = final_product.get("name", "Unknown Product")
                price = final_product.get("price", "Price unavailable")
                features = final_product.get("features", [])
                feature_text = ", ".join(features[:3]) if features else "No features listed"
                
                final_response = f"{final_message}\n\n✅ {name} - {price}\n  Key features: {feature_text}\n\nWould you like to proceed with this product, or do you have more questions?"
                
                session[session_key] = chat_data
                return jsonify({"reply": final_response})
            
            # For regular follow-up responses (not final choice)
            return jsonify({"reply": followup_response.get("message", "I'm not sure about that. Could you clarify your question?")})

    except Exception as e:
        print(f"❌ ERROR in /chat: {e}")
        import traceback
        traceback.print_exc()  # Print full stack trace for debugging
        return jsonify({"error": "An internal server error occurred while processing your request."}), 500

@app.route('/api/products', methods=['GET'])
def api_products():
    try:
        # Get query parameters
        category = request.args.get('category', 'all').lower()
        brand = request.args.get('brand', '').lower()
        search = request.args.get('search', '').strip()
        
        # Fetch products from database
        structured_products = fetch_products_from_database()
        
        # Handle empty database case
        if not structured_products:
            return jsonify([])
            
        # Prepare result array
        result = []
        
        # If category is "all", gather products from all categories
        if category == 'all':
            for cat, products in structured_products.items():
                for product in products:
                    product['category'] = cat  # Add category to each product
                    result.append(product)
        else:
            # Get products from the specific category
            result = structured_products.get(category, [])
            # Add category to each product
            for product in result:
                product['category'] = category
        
        # Apply brand filter if specified
        if brand:
            result = [p for p in result if brand.lower() in p.get('brand', '').lower()]
        
        # Apply search filter if specified
        if search:
            # Case-insensitive search in name and features
            search_terms = search.lower().split()
            filtered_results = []
            
            for product in result:
                product_name = product.get('name', '').lower()
                product_features = ' '.join(product.get('specifications', [])).lower()
                product_text = f"{product_name} {product_features}"
                
                # Check if all search terms are found in the product text
                if all(term in product_text for term in search_terms):
                    filtered_results.append(product)
            
            result = filtered_results
        
        # Add ID field for each product
        for i, product in enumerate(result):
            name_slug = re.sub(r'[^a-z0-9]', '-', product['name'].lower())
            name_slug = name_slug.strip('-')
            name_slug = re.sub(r'-+', '-', name_slug)
            product['id'] = f"{i+1}-{name_slug}"
        
        return jsonify(result)
    
    except Exception as e:
        print(f"❌ Error in /api/products: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

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
    This enhanced version handles raw natural language input for budget and brand.
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
    
    # If we're using raw response mode, pass the budget and brand question response directly
    if user_data.get("raw_response", False) and "budget_brand_response" in user_data:
        requirements.append(f"Budget and brand preferences: {user_data['budget_brand_response']}")
    
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

        ### **IMPORTANT PRODUCT UNDERSTANDING RULES:**
        1. When a user mentions a specific product like "iPhone", that indicates they prefer the Apple brand
        2. If they say "Samsung Galaxy", that means they prefer Samsung brand
        3. If they say "Google Pixel", that means they prefer Google brand
        4. Always prioritize the specific products/brands mentioned in their requirements
        5. When a user states they have "no budget", offer high-quality options without price constraints
        6. If they don't mention budget, prioritize mid-range products

        ### **RULES FOR RECOMMENDATIONS:**
        1. ONLY recommend products from the EXACT list provided below
        2. For budget ranges like "1000-1500", recommend products in that exact range
        3. You may be flexible up to 10% ABOVE the maximum budget ONLY if the product is an excellent match
        4. For size ranges like "65-70 inch TV", ONLY recommend TVs within that exact size range
        5. DO NOT invent or make up products or features
        6. Recommend 2-3 products that best match the requirements
        7. If a specific product line is mentioned (like "iPhone"), prioritize those products
        8. If no products match ALL criteria, prioritize brand preference first, then budget constraints
        9. If a preferred brand is mentioned, try to recommend only that brand's products

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

# Update the fetch_products_from_database function

def send_followup_to_gemini(query_data):
    """
    Handles follow-up questions about previously recommended products.
    """
    recommended_products = query_data.get("recommended_products", [])
    user_question = query_data.get("user_question", "")
    category = query_data.get("category", "")
    
    if not recommended_products:
        return {"message": "I don't have any recommendations to discuss. Let's start over with your product search."}
    
    # Convert products to JSON for Gemini
    products_json = json.dumps(recommended_products, indent=2)
    
    # Context from previous conversation
    context = []
    if query_data.get("purpose"):
        context.append(f"User needs a {category} for: {query_data['purpose']}")
    if query_data.get("features"):
        features_text = ", ".join(query_data['features']) if isinstance(query_data['features'], list) else query_data['features']
        context.append(f"Desired features: {features_text}")
    if query_data.get("budget_brand_response"):
        context.append(f"Budget and brand preferences: {query_data['budget_brand_response']}")
    
    context_text = "\n".join([f"- {ctx}" for ctx in context])
    
    gpt_payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "text": f"""
        You are a digital shopping assistant helping a customer choose between previously recommended products.

        ### **CONVERSATION CONTEXT:**
        {context_text}

        ### **PREVIOUSLY RECOMMENDED PRODUCTS:**
        ```json
        {products_json}
        ```

        ### **USER'S FOLLOW-UP QUESTION:**
        "{user_question}"

        ### **INSTRUCTIONS:**
        1. If the user is asking for more details about a specific product, provide those details from the product data.
        2. If the user is asking to compare products, highlight the key differences.
        3. If the user is expressing preference for a specific feature, explain which product best satisfies that preference.
        4. If the user seems ready to make a final decision or asks "which is best", recommend a single product that best matches their overall requirements.
        5. If you recommend a final choice, include it in the special "final_choice" field in your response.
        6. Only mention the products in the provided list - do not invent or reference other products.

        ### **RESPONSE FORMAT:**
        ```json
        {{
          "message": "Your detailed response to the user's question",
          "final_choice": null  // If making a final recommendation, include the full product object here
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
        
        if response.status_code != 200:
            print(f"❌ Gemini API Error: {response.text}")
            return {"message": "I'm having trouble analyzing these products right now. Could you try again?"}

        response_data = response.json()
        generated_text = response_data["candidates"][0]["content"]["parts"][0].get("text", "")
        
        # Extract JSON from Gemini response
        json_match = re.search(r"```json\s*({.*?})\s*```", generated_text, re.DOTALL)
        if not json_match:
            print("❌ Failed to extract JSON from follow-up Gemini response")
            return {"message": "I couldn't properly analyze your question about these products. Could you rephrase it?"}

        parsed_json = json.loads(json_match.group(1).strip())
        return parsed_json

    except Exception as e:
        print(f"❌ Exception in follow-up Gemini API call: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"message": "I encountered an error while processing your question. Could we try again?"}
    
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
                    product_image = sub_prod.get("image", "")

                    # Skip products without a name
                    if not product_name:
                        continue

                    # Handle missing data
                    if product_price == "N/A" or product_price is None:
                        product_price = "Unknown Price"

                    if not product_brand:
                        product_brand = "Generic Brand"
                    
                    # Create full image URL
                    image_url = None
                    if product_image:
                        image_url = f"http://localhost:5001/images/{product_image}"
                    
                    # Add to structured products
                    structured_products[category].append({
                        "name": product_name,
                        "price": f"${product_price}" if isinstance(product_price, (int, float)) else product_price,
                        "features": product_features,
                        "brand": product_brand,
                        "image": image_url  # Use the full URL path
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
