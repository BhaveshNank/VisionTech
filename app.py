from flask import Flask, request, jsonify, make_response
from pymongo import MongoClient
import requests
import re
from flask_cors import CORS
from functools import wraps
import logging 
import json 
app = Flask(__name__)
# This allows all origins, methods, and headers
CORS(app, resources={r"/chat": {"origins": "*"}})

# MongoDB Connection 
client = MongoClient("mongodb://localhost:27017/")  # Connect to MongoDB
db = client["ecommerce_db"]  # The database name
collection = db["products"]  # The collection in that database 


# Google Gemini API Setup
api_key = "GEMINI_KEY_HERE"
endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={api_key}"

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
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
    return response, 200


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
    try:
        # Step 1: Extract user message
        data = request.json
        user_message = data.get("message", "").strip()

        if not user_message:
            return jsonify({"error": "No message provided"}), 400

        print(f"📩 Received message: {user_message}")

        # Step 2: Fetch available product categories from MongoDB
        available_categories = collection.distinct("category")
        available_categories_lower = [c.lower() for c in available_categories]
        print(f"📌 Available product categories in DB: {available_categories}")

        # Step 3: Identify the product category from user input
        detected_category = None
        for category in available_categories:
            if category.lower() in user_message.lower():
                detected_category = category
                break

        if not detected_category:
            print(f"⚠️ Could not detect product category from query: {user_message}")
            return jsonify({"reply": "Sorry, we couldn't identify the product category in your request."})

        print(f"✅ Detected Product Category: {detected_category}")

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

        # Step 5: Send structured features to Gemini for intelligent matching
        gpt_payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {
                            "text": f"""
                            You are an AI assistant helping customers find products in an electronics store.

                            ## Task:
                            - The user is searching for a {detected_category}.
                            - The store has the following products available:

                            {json.dumps(structured_products, indent=2)}

                            - Your task is to **identify the most relevant product** based on the user's request.
                            - Match features as closely as possible. **Do not guess new features**.

                            **User Query:** {user_message}

                            ## Expected Response Format:
                            {{
                                "selected_product": "<Product Name>",
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

        # Parse response
        try:
            gemini_response = json.loads(raw_gemini_text)
            selected_product_name = gemini_response.get("selected_product", "").strip()
            matched_features = gemini_response.get("matched_features", [])

            if not selected_product_name or not matched_features:
                raise ValueError("Gemini returned an empty product name or features.")

        except (json.JSONDecodeError, ValueError):
            print(f"⚠️ Failed to parse Gemini response: {raw_gemini_text}")
            return jsonify({"reply": "Sorry, we couldn't determine the best product."})

        # Step 6: Fetch the exact product from MongoDB
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

        # Step 7: Return the matched product
        return jsonify({
            "reply": f"Recommended: {matched_product['name']} - Features: {', '.join(matched_features)}. "
                     f"Price: ${matched_product.get('price', 'Price not available')}"
        })

    except Exception as e:
        print(f"❌ ERROR: {e}")
        return jsonify({"error": "An internal server error occurred while processing your request."}), 500

    

if __name__ == "__main__":
    app.run(debug=True)