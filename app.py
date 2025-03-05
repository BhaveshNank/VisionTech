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

# ✅ Configure session FIRST
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_COOKIE_SAMESITE'] = 'None'  # Required for cross-origin requests
app.config['SESSION_COOKIE_SECURE'] = False  # Must be True in production
Session(app)  # ✅ Initialize Flask Session

# ✅ Apply CORS after session setup
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)




# MongoDB Connection 
client = MongoClient("mongodb://localhost:27017/")  # Connect to MongoDB
db = client["ecommerce_db"]  # The database name
collection = db["products"]  # The collection in that database 


# Google Gemini API Setup
api_key = "GEMINI_KEY_HERE"
endpoint = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro-002:generateContent?key={api_key}"

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

# Test route to check if Flask is running
@app.route('/test', methods=['GET'])
def test():
    logging.info("Test API called")
    return jsonify({"message": "API is working!"}), 200

@app.route('/chat', methods=['OPTIONS'])
def chat_options():
    """Handles CORS preflight requests."""
    response = jsonify({"message": "CORS preflight successful"})
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")  # Remove "*"
    response.headers.add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
    response.headers.add("Access-Control-Allow-Credentials", "true")  # ✅ Required for sessions
    return response

@app.route('/products/<category>', methods=['GET'])
def get_products_by_category(category):
    """
    Fetch all products belonging to a specific category from the database.
    """
    # Search for the category in the database
    category_data = collection.find_one({"category": category.lower()})

    if not category_data:
        return jsonify({"reply": f"No {category}s found in the database."}), 200

    # Extract products from the category document
    product_list = [
        f"{product.get('name', 'Unknown Product')} - Price: ${product.get('price', 'N/A')}"
        for product in category_data.get("products", [])
    ]

    return jsonify({"reply": "\n".join(product_list)})

@app.route('/chat', methods=['POST'])
@validate_request
def chat():
    print(f"🛠 Session ID: {session.get('_id', 'No session ID')}")
    print(f"🛠 Session Data Before Processing: {dict(session)}")

    try:
        # Step 1: Extract user message & Handle Follow-Ups
        data = request.json
        user_message = data.get("message", "").strip().lower()

        if not user_message:
            return jsonify({"error": "No message provided"}), 400

        print(f"📩 Received message: {user_message}")

        # ✅ If the user is responding to a previous question
        if "last_question" in session and session["last_question"]:
            print(f"🔄 Detected user follow-up response: {session['last_question']}")

            # If we already know the last category, reconstruct user intent
            if "last_category" in session and session["last_category"]:
                user_message = f"I need a {session['last_category']} for {user_message}"
                print(f"📝 Interpreted full query: {user_message}")

            # Clear session variable after use to avoid unintended overrides
            session.pop("last_question", None)
            session.modified = True

        # ✅ Debugging: Print session data
        print(f"🛠 Session Data: {dict(session)}")







        # Step 2: Fetch available product categories from MongoDB
        available_categories = collection.distinct("category")
        # available_categories_lower = [c.lower() for c in available_categories]
        print(f"📌 Available product categories in DB: {available_categories}")

        # Step 3: Identify the product category & Store in Session
        detected_category = None
        for category in available_categories:
            if category.lower() in user_message.lower():  # ✅ Using substring matching instead of regex
                detected_category = category
                break

        # ✅ If no category detected, try to use the last remembered category from session
        if "last_category" in session and not detected_category:
            detected_category = session["last_category"]
            print(f"🔄 Using last known category from session: {detected_category}")

        # 🚨 If still no category is detected, ask the user for clarification
        if not detected_category:
            print(f"⚠️ Could not detect product category from query: {user_message}")
            
            # 🚀 Store last user message in session to improve follow-ups
            session["last_user_message"] = user_message  
            session.modified = True
            
            return jsonify({
                "reply": "I couldn't determine the product category. We sell Laptops, Phones, and TVs. Which one do you need?"
            })

        print(f"✅ Detected Product Category: {detected_category}")

        # ✅ Store detected category in session for future follow-ups
        session["last_category"] = detected_category
        session.modified = True


        # Step 4: Fetch all products and features for the detected category
        category_data = collection.find_one({"category": detected_category}, {"products": 1, "_id": 0})

        if not category_data or "products" not in category_data:
            print(f"❌ No products found in category: {detected_category}")
            return jsonify({"reply": f"Sorry, no products available in {detected_category} category."})

        # Structure products as a dictionary
        structured_products = {
            product["name"]: product.get("specifications", [])
            for product in category_data["products"]
        }

        print(f"📌 Extracted Products & Features: {json.dumps(structured_products, indent=2)}")


        # Step 5: Send structured features to Gemini for conversational engagement
        gpt_payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {
                            "text": f"""
                            You are an AI assistant helping customers in an electronics store.

                            ## Task:
                            - If the user query **does NOT mention a specific feature** (e.g., "I need a laptop"), **DO NOT recommend a product yet**.
                            - Instead, ask a **clarifying question** like:  
                            - "What will you use the laptop for? Gaming, Work, or General Use?"
                            - If the user **already provided enough details** (e.g., "I need a gaming laptop with RTX 4090"), **THEN recommend a product**.

                            ## Example Behavior:

                            **User:** "I need a laptop"  
                            **Bot:** "Sure! What will you use the laptop for? Gaming, Work, or General Use?"

                            **User:** "I need a gaming laptop with RTX 4090"  
                            **Bot:** "Great! I recommend the 'High-End Gaming Laptop' with RTX 4090 and 32GB RAM."

                            **User Query:** "{user_message}"

                            ## Available Products:
                            {json.dumps(structured_products, indent=2)}

                            ## Respond in this JSON format:
                            {{
                                "response_type": "recommendation" or "question",
                                "message": "<your response>",
                                "selected_product": "<Product Name> (if applicable)",
                                "matched_features": ["<Feature1>", "<Feature2>"]
                            }}
                            """
                        }
                    ]
                }
            ]
        }


        # Call Gemini API
        gpt_response = requests.post(endpoint, headers=headers, json=gpt_payload)

        if gpt_response.status_code != 200:
            print(f"❌ Gemini API error: {gpt_response.text}")
            return jsonify({"error": "Failed to process query with Gemini"}), 500

        gpt_result = gpt_response.json()
        if "candidates" not in gpt_result or not gpt_result["candidates"]:
            print(f"❌ ERROR: Gemini API returned an invalid response:\n{gpt_result}")
            return jsonify({"error": "AI response is empty"}), 500

        # Extract Gemini's response text
        raw_gemini_text = gpt_result["candidates"][0]["content"]["parts"][0].get("text", "").strip()
        print(f"🔍 Raw response from Gemini API:\n{raw_gemini_text}")

        # Step 6: Handle conversational responses & Store Questions in Session
        try:
            # Log raw response for debugging
            print(f"🔍 Raw response from Gemini API:\n{raw_gemini_text}")

            # 🛠 Ensure the response is clean (remove any formatting artifacts like triple backticks)
            raw_gemini_text = raw_gemini_text.strip("```json").strip("```").strip()

            # Ensure Gemini response is a valid JSON object before parsing
            gemini_response = json.loads(raw_gemini_text)

        except json.JSONDecodeError as e:
            print(f"❌ ERROR: Failed to parse AI response - {str(e)}")
            return jsonify({"reply": "Sorry, we couldn't parse the AI response. Please try again."}), 500
        except ValueError as e:
            print(f"❌ ERROR: {str(e)}")
            return jsonify({"reply": "Sorry, we couldn't understand the AI response."}), 500

        # Extract details from Gemini response safely
        response_type = gemini_response.get("response_type", "").strip().lower()
        chatbot_message = gemini_response.get("message", "I'm not sure how to respond.")
        selected_product_raw = gemini_response.get("selected_product")  # This might be None
        matched_features = gemini_response.get("matched_features", [])

        # Safe handling: Ensure selected_product_name is a string before calling .strip()
        if isinstance(selected_product_raw, str):
            selected_product_name = selected_product_raw.strip()
        else:
            selected_product_name = ""  # Default to empty if None

        print("✅ Extracted from Gemini response:")
        print(f"   - response_type: {response_type}")
        print(f"   - chatbot_message: {chatbot_message}")
        print(f"   - selected_product_name: {selected_product_name}")
        print(f"   - matched_features: {matched_features}")

        # ✅ Store the chatbot's question if Gemini asks for clarification
        if response_type == "question":
            print("💬 Gemini wants more info. Storing question in session.")
            session["last_question"] = chatbot_message  # Save the chatbot's follow-up question
            session.modified = True  # Ensure session updates
            return jsonify({"reply": chatbot_message})

        # ✅ If no product was selected, return chatbot message without lookup
        if not selected_product_name:
            return jsonify({"reply": chatbot_message})





            

        # Step 7: Fetch the exact product from MongoDB
        query = {
            "category": detected_category,
            "products.name": {"$regex": f"^{re.escape(selected_product_name)}$", "$options": "i"}
        }

        print(f"🔍 Final MongoDB Query Before Execution: {json.dumps(query, indent=2)}")

        # Fetch product from MongoDB
        matching_product_doc = collection.find_one(query, {"products.$": 1, "_id": 0})

        if not matching_product_doc:
            print(f"⚠️ No product found in database for type: {detected_category} with name: {selected_product_name}")
            return jsonify({
                "reply": f"Sorry, we couldn't find {selected_product_name} in our inventory."
            })

        # Extract product details
        matched_product = matching_product_doc["products"][0]
        print(f"✅ Matched Product Found: {matched_product}")

        # Step 8: Return the matched product
        return jsonify({
            "reply": f"Recommended: {matched_product['name']} - Features: {', '.join(matched_features)}. "
                    f"Price: ${matched_product.get('price', 'Price not available')}"
        })


    except Exception as e:
        print(f"❌ ERROR: {e}")
        return jsonify({"error": "An internal server error occurred while processing your request."}), 500
    

if __name__ == "__main__":
    app.run(debug=True)