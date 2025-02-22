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

        # Step 3: Fetch available features from MongoDB before querying Gemini
        all_available_features = set()

        # We need to delay querying MongoDB until we have a detected product type.
        # So Step 3 only initializes an empty feature set.
        print("📌 Step 3: Will fetch available features after extracting product type.")


        # Step 4: Querying Gemini API to detect product category & user intent
        gpt_payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {
                            "text": f"""
                            You are an AI assistant helping customers find products in an electronics store. 
                            
                            ## Task:
                            - Identify the **main product category** the user is searching for (e.g., Laptop, Phone, TV).
                            - If the user requests a product for a **specific intent** (e.g., "I need a laptop for gaming"),
                            suggest the most relevant features **only from the available ones**.
                            - If the user does not specify features, return the product category without features.

                            ## Important Instructions:
                            - **Use ONLY the following feature categories**: ['RAM', 'GPU', 'Display', 'Storage', 'Processor', 'Battery Life'].
                            - **Format each feature as an object with name and value**.
                            - **Do NOT make up new feature names**; use only the listed categories.
                            - **Ensure feature values match how they appear in product descriptions** (e.g., '16GB RAM', 'Intel i9', '144Hz Display').

                            ## Example Queries & Expected Responses:
                            
                            **User Query:** "I need a gaming laptop"
                            **Expected Response:**
                            {{
                                "product_type": "Laptop",
                                "features": [
                                    {{"name": "GPU", "value": "RTX 4090"}},
                                    {{"name": "Display", "value": "144Hz"}}
                                ]
                            }}

                            **User Query:** "I need a laptop with 32GB RAM and Intel i9 processor"
                            **Expected Response:**
                            {{
                                "product_type": "Laptop",
                                "features": [
                                    {{"name": "RAM", "value": "32GB"}},
                                    {{"name": "Processor", "value": "Intel i9"}}
                                ]
                            }}

                            **User Query:** "{user_message}"

                            ## Respond strictly in this JSON format:
                            {{
                                "product_type": "<category>",
                                "features": [
                                    {{"name": "<Feature Name>", "value": "<Feature Value>"}}
                                ]
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
        if "candidates" not in gpt_result or not gpt_result["candidates"]:
            print(f"❌ ERROR: Gemini API returned an invalid response:\n{gpt_result}")
            return jsonify({"error": "AI response is empty"}), 500

        # Extract Gemini's response text
        raw_gemini_text = gpt_result["candidates"][0]["content"]["parts"][0].get("text", "").strip()
        if not raw_gemini_text:
            print(f"❌ ERROR: Gemini API response has no text:\n{gpt_result}")
            return jsonify({"error": "Failed to extract product features from AI"}), 500




        # Step 5: Extract product_type and features from the JSON text
        detected_product_type = None
        cleaned_keywords = []

        try:
            print(f"🔍 Raw response from Gemini API:\n{raw_gemini_text}")
            gemini_response = json.loads(raw_gemini_text)

            # Extract product category
            detected_product_type = gemini_response.get("product_type", "").strip().lower()

            # Extract features (handle structured features correctly)
            raw_features_list = gemini_response.get("features", [])
            
            # If features are structured as { "name": "...", "value": "..." }, extract correctly
            for feature in raw_features_list:
                if isinstance(feature, dict) and "name" in feature and "value" in feature:
                    full_feature = f"{feature['value']} {feature['name']}"  # Correct word order
                    cleaned_keywords.append(full_feature.strip().lower())
                elif isinstance(feature, str):  # Handle string-based features normally
                    cleaned_keywords.append(feature.strip().lower())

        except json.JSONDecodeError:
            print(f"⚠️ Failed to parse Gemini response: {raw_gemini_text}")
            return jsonify({"reply": "Sorry, we couldn't determine the product type."})

        if not detected_product_type:
            print(f"⚠️ No valid product type extracted!")
            return jsonify({"reply": "Sorry, we couldn't determine the product type."})

        print(f"✅ Detected Product Type: {detected_product_type}")
        print(f"🟢 Selected Features (from Gemini & DB): {raw_features_list}")
        print(f"🟢 Cleaned Keywords for Querying: {cleaned_keywords}")



        # Step 5.1: Normalize feature names to match database format
        normalized_features = []

        for feature in cleaned_keywords:
            # Remove special characters and extra spaces
            normalized = re.sub(r"[^a-zA-Z0-9 ]", "", feature).strip().lower()

            # Check if the normalized feature exists in the available features
            best_match = None
            for db_feature in all_available_features:
                db_normalized = re.sub(r"[^a-zA-Z0-9 ]", "", db_feature).strip().lower()
                
                if sorted(db_normalized.split()) == sorted(normalized.split()):
                    best_match = db_feature
                    break  # Stop once a match is found

            # Use the best match if found, otherwise, keep the original
            normalized_features.append(best_match if best_match else feature)

        print(f"🟢 Final Normalized Features for Querying: {normalized_features}")




        # Step 6: Map product type to known categories in DB
        def map_product_type(detected_product_type, available_categories):
            if not detected_product_type:
                return None

            for category in available_categories:
                if re.search(rf"\b{re.escape(detected_product_type)}\b", category, re.IGNORECASE):
                    return category

            return None

        mapped_product_type = map_product_type(detected_product_type, available_categories)

        if not mapped_product_type:
            print(f"⚠️ No valid product type found in the database!")
            return jsonify({"reply": "Sorry, we couldn't find that type of product in our database."})

        print(f"✅ Mapped Product Type: {mapped_product_type}")

        # Fetch available features **after detecting the product type**
        available_features_query = collection.find_one(
            {"category": mapped_product_type}, {"products.specifications": 1, "_id": 0}
        )

        all_available_features = set()
        if available_features_query and "products" in available_features_query:
            for product in available_features_query["products"]:
                specifications = product.get("specifications", [])
                if isinstance(specifications, list):
                    all_available_features.update(specifications)

        print(f"📌 Available Features for {mapped_product_type}: {list(all_available_features)}")




        # Step 7: Query MongoDB for Matching Products
        query = {"category": mapped_product_type}  # Start with category filter

        regex_patterns = []  # Ensure regex_patterns is initialized before use

        if cleaned_keywords:
            for keyword in cleaned_keywords:
                # Normalize keyword (remove special characters)
                normalized_keyword = re.sub(r"[^a-zA-Z0-9 ]", "", keyword).strip().lower()

                # Create regex pattern for **exact full feature match** (not word-separated)
                exact_match_regex = r"\b" + re.escape(normalized_keyword) + r"\b"

                regex_patterns.append({"products.specifications": {"$regex": exact_match_regex, "$options": "i"}})

        # Only add regex patterns if they exist
        if regex_patterns:
            query["$or"] = regex_patterns

        print(f"🔍 Final MongoDB Query Before Execution: {json.dumps(query, indent=2)}")

        # Fetch products from MongoDB
        matching_docs = list(collection.find(query))

        # Extract relevant products from each matching doc
        filtered_products = []
        for doc in matching_docs:
            for product in doc.get("products", []):
                specs_lower = [spec.lower() for spec in product.get("specifications", [])]
                if any(any(kw in spec for spec in specs_lower) for kw in cleaned_keywords):
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

            match_score = sum(
                1 for kw in cleaned_keywords
                if any(kw in spec.lower() for spec in product_specs)
            )
            ranked_products.append((product_name, product_specs, product_price, match_score))

        ranked_products.sort(key=lambda x: x[3], reverse=True)

        # Step 9: Return the best match
        best_name, best_specs, best_price, _ = ranked_products[0]
        return jsonify({
            "reply": f"Recommended: {best_name} - Features: {', '.join(best_specs)}. Price: ${best_price}"
        })

    except Exception as e:
        print(f"ERROR: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500

    

if __name__ == "__main__":
    app.run(debug=True)