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

        print(f"Received message: {user_message}")

        # Step 2: Fetch available product categories from MongoDB
        available_categories = collection.distinct("category")
        available_categories_lower = [c.lower() for c in available_categories]
        print(f"📌 Available product categories in DB: {available_categories}")

        # Step 3: Querying Gemini API to extract user intent
        gpt_payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {
                            "text": f"""
                            You are an AI assistant helping customers find products in an electronics store. 
                            - Identify the **main product category** the user is searching for (e.g., Laptop, Phone, TV).
                            - Identify any **specific features** mentioned (e.g., 16GB RAM, OLED Display, Budget-friendly).
                            - If the user does not mention any features, just return the available products in that category.
                            
                            **User Query:** {user_message}

                            Respond in this JSON format:
                            {{
                                "product_type": "<category>",
                                "features": ["<feature1>", "<feature2>"]
                            }}
                            """
                        }
                    ]
                }
            ]
        }

        gpt_response = requests.post(endpoint, headers=headers, json=gpt_payload)
        if gpt_response.status_code != 200:
            print(f"Google Gemini API error: {gpt_response.text}")
            return jsonify({"error": "Failed to process query with Gemini"}), 500

        gpt_result = gpt_response.json()

        # Step 4: Validate API response
        if "candidates" not in gpt_result or not gpt_result["candidates"]:
            print(f"Error: Invalid response from Google Gemini API: {gpt_result}")
            return jsonify({"error": "AI response is empty"}), 500

        # Gemini's textual output from the first candidate
        raw_gemini_text = gpt_result["candidates"][0]["content"]["parts"][0].get("text", "").strip()
        if not raw_gemini_text:
            print(f"Error: No content extracted from Google Gemini API response: {gpt_result}")
            return jsonify({"error": "Failed to extract product features from AI"}), 500

        print(f"Extracted raw features from Gemini:\n{raw_gemini_text}")

        # Step 5: Extract product_type and features from the JSON text
        try:
            gemini_response = json.loads(raw_gemini_text)  # Convert text response to JSON
            detected_product_type = gemini_response.get("product_type", "").strip().lower()
            # NEW: Extract features from JSON
            raw_features_list = gemini_response.get("features", [])
            # Convert them to lowercase for easier matching
            cleaned_keywords = [f.lower().strip() for f in raw_features_list if f.strip()]
        except json.JSONDecodeError:
            print(f"⚠️ Failed to parse Gemini response: {raw_gemini_text}")
            return jsonify({"reply": "Sorry, we couldn't determine the product type from your request."})

        if not detected_product_type:
            print(f"⚠️ No valid product type extracted!")
            return jsonify({"reply": "Sorry, we couldn't determine the product type from your request."})

        print(f"✅ Detected Product Type: {detected_product_type}")
        print(f"🟢 Extracted Features: {raw_features_list}")
        print(f"🟢 Cleaned Keywords: {cleaned_keywords}")

        # Step 5.1: Map product type to known categories in DB
        def map_product_type(detected_product_type, available_categories):
            detected_product_type = detected_product_type.lower()
            for category in available_categories:
                if re.search(rf"\b{re.escape(detected_product_type)}\b", category, re.IGNORECASE):
                    return category
            return None


        mapped_product_type = map_product_type(detected_product_type, available_categories)

        if not mapped_product_type:
            print(f"⚠️ No valid product type detected in the database!")
            return jsonify({"reply": "Sorry, we couldn't find that type of product in our database."})

        print(f"Mapped Product Type: {mapped_product_type}")

        # Step 7: Query MongoDB for Matching Products
        query = {"category": mapped_product_type}  # Match category first

        # If user specified features, filter using multiple regex conditions
        if cleaned_keywords:
            regex_patterns = [
                {"products.specifications": {"$regex": re.escape(keyword), "$options": "i"}}
                for keyword in cleaned_keywords
            ]
            regex_patterns.append(  # ✅ Also allow searching in product name (e.g., "Samsung TV")
                {"products.name": {"$regex": re.escape(' '.join(cleaned_keywords)), "$options": "i"}}
            )
            query["$or"] = regex_patterns

        print(f"📌 Updated MongoDB Query: {query}")
        matching_docs = list(collection.find(query))

        # Extract relevant products from each matching doc
        filtered_products = []
        for doc in matching_docs:
            for product in doc.get("products", []):
                specs_lower = [spec.lower() for spec in product.get("specifications", [])]
                # Ensure ALL cleaned_keywords are in the product specs for a match
                if all(any(kw in spec for spec in specs_lower) for kw in cleaned_keywords) or any(
                    kw in product["name"].lower() for kw in cleaned_keywords
                ):
                    filtered_products.append(product)

        if not filtered_products:
            print(f"⚠️ No products found in database for type: {mapped_product_type} "
                f"with features: {cleaned_keywords}")
            return jsonify({
                "reply": f"Sorry, no {mapped_product_type} with features {', '.join(cleaned_keywords)} found."
            })

        print(f"✅ Matching products found: {len(filtered_products)}")


        # Step 8: Rank products based on feature match
        ranked_products = []
        for product in filtered_products:
            product_name = product.get("name", "")
            product_specs = product.get("specifications", [])
            product_price = product.get("price", "Price not available")

            # Simple scoring: +1 for each matched feature
            match_score = sum(1 for kw in cleaned_keywords
                              if any(kw in spec.lower() for spec in product_specs))

            ranked_products.append((product_name, product_specs, product_price, match_score))

        # Sort products by match score (descending)
        ranked_products.sort(key=lambda x: x[3], reverse=True)

        # Step 9: Return the Best Match or Fallback
        if ranked_products:
            best_match = ranked_products[0]
            best_name, best_specs, best_price, _ = best_match
            return jsonify({
                "reply": f"Recommended: {best_name} - Features: {', '.join(best_specs)}. Price: ${best_price}"
            })
        else:
            return jsonify({"reply": "Sorry, no matching products found based on your request."})

    except Exception as e:
        print(f"ERROR: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500

    

if __name__ == "__main__":
    app.run(debug=True)

