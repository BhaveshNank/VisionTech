from flask import Flask, request, jsonify, make_response
from pymongo import MongoClient
import requests
import re
from flask_cors import CORS
from functools import wraps
import logging 

app = Flask(__name__)
# ✅ Allow all origins, methods, and headers
CORS(app, resources={r"/chat": {"origins": "*"}})

# ✅ MongoDB Connection (Make sure MongoDB is running)
client = MongoClient("mongodb://localhost:27017/")  # Connect to MongoDB
db = client["ecommerce_db"]  # Use your database name
collection = db["products"]  # Use your collection name


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


# ✅ Test route to check if Flask is running
@app.route('/test', methods=['GET'])
def test():
    logging.info("Test API called")
    return jsonify({"message": "API is working!"}), 200

# ✅ Fixing CORS Issues (Preflight Requests)
@app.route('/chat', methods=['OPTIONS'])
def chat_options():
    """Handles CORS preflight requests."""
    response = jsonify({"message": "CORS preflight successful"})
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
    return response, 200

@app.route('/chat', methods=['POST'])
@validate_request
def chat():
    try:
        # ✅ Step 1: Extract user message
        data = request.json
        user_message = data.get("message", "").strip()

        if not user_message:
            return jsonify({"error": "No message provided"}), 400

        print(f"✅ Received message: {user_message}")

        # ✅ Step 2: Fetch available product categories from MongoDB
        available_categories = collection.distinct("type")
        available_categories_lower = [c.lower() for c in available_categories]
        print(f"📌 Available product categories in DB: {available_categories}")

        # ✅ Step 3: Query Gemini API to extract user intent
        gpt_payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": f"Extract the required product type and key features from this query: {user_message}"}]
                }
            ]
        }

        gpt_response = requests.post(endpoint, headers=headers, json=gpt_payload)
        if gpt_response.status_code != 200:
            print(f"❌ Google Gemini API error: {gpt_response.text}")
            return jsonify({"error": "Failed to process query with Gemini"}), 500

        gpt_result = gpt_response.json()

        # ✅ Step 4: Validate API response
        if "candidates" not in gpt_result or not gpt_result["candidates"]:
            print(f"❌ Error: Invalid response from Google Gemini API: {gpt_result}")
            return jsonify({"error": "AI response is empty"}), 500

        extracted_features = gpt_result["candidates"][0]["content"]["parts"][0].get("text", "").strip()
        if not extracted_features:
            print(f"❌ Error: No content extracted from Google Gemini API response: {gpt_result}")
            return jsonify({"error": "Failed to extract product features from AI"}), 500

        print(f"📌 Extracted raw features from Gemini:\n{extracted_features}")

        # ✅ Step 5: Extract product type
        product_type_match = re.search(r"Product Type:\s*(.+)", extracted_features, re.IGNORECASE)

        detected_product_type = None
        if product_type_match:
            detected_product_type = product_type_match.group(1).strip().lower()
            detected_product_type = re.sub(r'[^a-zA-Z0-9 ]', '', detected_product_type).strip()

        # ✅ Step 5.1: Map product type correctly
        def map_product_type(detected_product_type, available_categories):
            if not detected_product_type:
                return None
            for category in available_categories:
                if detected_product_type in category.lower() or category.lower() in detected_product_type:
                    return category
            return None

        mapped_product_type = map_product_type(detected_product_type, available_categories)

        if not mapped_product_type:
            print(f"⚠️ No valid product type detected!")
            return jsonify({"reply": "Sorry, we couldn't find that type of product in our database."})

        print(f"✅ Mapped Product Type: {mapped_product_type}")
        detected_product_type = mapped_product_type.lower()

        # ✅ Step 6: Extract and clean feature list
        feature_list_match = re.search(r"Key Features:\s*\n?([\s\S]+)", extracted_features, re.IGNORECASE)

        cleaned_keywords = []
        if feature_list_match:
            feature_list_raw = feature_list_match.group(1)

            # Ignore irrelevant descriptions
            irrelevant_phrases = {"not specified", "not provided", "no details", "not mentioned"}

            cleaned_keywords = [
                feature.strip().lower()
                for feature in re.split(r'\n|-|\*', feature_list_raw)
                if feature.strip().lower() not in irrelevant_phrases
            ]

        print(f"📌 Cleaned keywords for matching: {cleaned_keywords}")

        # ✅ Step 7: Query MongoDB for Matching Products
        query = {"type": detected_product_type}

        if cleaned_keywords:
            regex_pattern = "|".join(map(re.escape, cleaned_keywords))
            query["specifications"] = {"$regex": regex_pattern, "$options": "i"}

        matching_products = list(collection.find(query))

        print(f"📌 Matching products found: {len(matching_products)}")
        for product in matching_products:
            print(f"🔹 Product: {product['name']}, Specs: {product['specifications']}")

        # ✅ Step 8: Rank products based on feature match
        ranked_products = []
        for product in matching_products:
            product_name = product.get("name", "")
            product_specs = product.get("specifications", [])
            product_price = product.get("price", "Price not available")

            # Score based on matching features
            match_score = sum(1 for keyword in cleaned_keywords if keyword in [spec.lower() for spec in product_specs])
            ranked_products.append((product_name, product_specs, product_price, match_score))

        ranked_products.sort(key=lambda x: x[3], reverse=True)

        # ✅ Step 9: Return the Best Match or Fallback Response
        if ranked_products:
            best_match = ranked_products[0]
            return jsonify({
                "reply": f"🔹 Recommended: {best_match[0]} - Features: {', '.join(best_match[1])}. Price: ${best_match[2]}"
            })
        else:
            return jsonify({"reply": "Sorry, no matching products found based on your request."})

    except Exception as e:
        print(f"❌ ERROR: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500

    

if __name__ == "__main__":
    app.run(debug=True)

