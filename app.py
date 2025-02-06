from flask import Flask, request, jsonify, make_response
from pymongo import MongoClient
import requests
import re
from flask_cors import CORS
from functools import wraps

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# MongoDB connection
client = MongoClient("mongodb://localhost:27017/")
db = client['ecommerce_db']
collection = db['products']

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

@app.route('/chat', methods=['POST'])
@validate_request
def chat():
    try:
        # Step 1: Extract user message from the request
        data = request.json
        user_message = data.get("message", "").strip()

        if not user_message:
            return jsonify({"error": "No message provided"}), 400
 
        # Step 2: Getting product categories dynamically from the database
        available_categories = collection.distinct("type")
        print(f"Available product categories in DB: {available_categories}")

        # Step 3: Query Gemini AI to extract product type and features
        gpt_payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": f"Extract product type and key features from this query: {user_message}"}]
                }
            ]
        }

        gpt_response = requests.post(endpoint, headers=headers, json=gpt_payload)

        if gpt_response.status_code != 200:
            print(f"Google Gemini API error: {gpt_response.text}")
            return jsonify({"error": "Failed to process query with Google Gemini"}), 500

        gpt_result = gpt_response.json()

        # Step 4: Validate the API response
        if "candidates" not in gpt_result or not gpt_result["candidates"]:
            print(f"Error: Google Gemini API returned an invalid response: {gpt_result}")
            return jsonify({"error": "Google Gemini API failed to return a valid response"}), 500

        extracted_features = gpt_result["candidates"][0]["content"]["parts"][0]["text"]
        if not extracted_features:
            print(f"Error: No content extracted from Google Gemini API response: {gpt_result}")
            return jsonify({"error": "Failed to extract product features from AI"}), 500

        print(f"Extracted raw features from Gemini:\n{extracted_features}")

        # Step 5: Extracting and properly cleaning the product type
        product_type_match = re.search(r"Product Type:\s*(.+)", extracted_features, re.IGNORECASE)

        if product_type_match:
            detected_product_type = product_type_match.group(1).strip().lower()

            # Remove unwanted characters like asterisks (*), dashes (-), extra spaces, markdown symbols
            detected_product_type = re.sub(r'[^a-zA-Z0-9 ]', '', detected_product_type).strip()
        else:
            detected_product_type = None

        if not detected_product_type or detected_product_type not in [c.lower() for c in available_categories]:
            print(f"⚠️ WARNING: Detected product type '{detected_product_type}' is NOT in DB categories!")
            return jsonify({"reply": "Sorry, we couldn't find that type of product in our database."})

        print(f"✅ Cleaned Product Type: {detected_product_type}")

        # Step 6: Extract feature list properly
        feature_list_match = re.search(r"Key Features:\s*\n?([\s\S]+)", extracted_features, re.IGNORECASE)

        if feature_list_match:
            feature_list_raw = feature_list_match.group(1)
            
            # Remove special characters and formatting like '*', '-', and excess spaces
            cleaned_keywords = [feature.strip().lower() for feature in re.split(r'\n|-|\*', feature_list_raw) if feature.strip()]
        else:
            cleaned_keywords = []

        print(f"Cleaned keywords for matching: {cleaned_keywords}")

        # Step 7: Query MongoDB for Matching Products
        query = {"type": detected_product_type}

        if cleaned_keywords:
            regex_pattern = "|".join(map(re.escape, cleaned_keywords))
            query["specifications"] = {"$regex": regex_pattern, "$options": "i"}

        matching_products = list(collection.find(query))

        # Debugging
        print(f"Matching products found: {len(matching_products)}")
        for product in matching_products:
            print(f"Product: {product['name']}, Type: {product['type']}, Specs: {product['specifications']}")

        # Step 8: Ranking Products Based on Match Score
        ranked_products = []
        for product in matching_products:
            product_name = product.get("name", "")
            product_specs = product.get("specifications", "")
            product_price = product.get("price", "Price not available")

            # Score based on matching features
            match_score = sum(1 for keyword in cleaned_keywords if keyword in product_specs.lower())
            ranked_products.append((product_name, product_specs, product_price, match_score))

        ranked_products.sort(key=lambda x: x[3], reverse=True)  # Sort by match score

        # Step 9: Return the Best Match or Fallback Response
        if ranked_products:
            best_match = ranked_products[0]
            return jsonify({
                "reply": f"Recommended: {best_match[0]} - {best_match[1]}. Price: ${best_match[2]}"
            })
        else:
            return jsonify({"reply": "Sorry, no matching products found based on your request."})

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
