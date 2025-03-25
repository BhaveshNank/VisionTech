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

app = Flask(__name__, static_folder='static')
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
api_key = "AIzaSyCw2spSKyxnSg9KNLpg1n3f7nRqZe-KfU4"
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


@app.route('/api/search-suggestions', methods=['GET'])
def search_suggestions():
    """Return product name suggestions based on a search query"""
    try:
        query = request.args.get('query', '').strip().lower()
        if not query or len(query) < 2:
            return jsonify([])
            
        # Fetch products from database
        structured_products = fetch_products_from_database()
        
        # Extract all product names from all categories
        all_products = []
        for category, products in structured_products.items():
            for product in products:
                product['category'] = category  # Add category to each product
            all_products.extend(products)
            
        # Find matching products (by name or brand)
        matches = []
        for product in all_products:
            product_name = product.get('name', '').lower()
            product_brand = product.get('brand', '').lower()
            
            if query in product_name or query in product_brand:
                matches.append({
                    'name': product.get('name', ''),
                    'category': product.get('category', ''),
                    'image': product.get('image', '')
                })
                
        # Sort by relevance (exact matches first)
        matches.sort(key=lambda x: 0 if x['name'].lower().startswith(query) else 1)
                
        # Limit results
        return jsonify(matches[:10])
        
    except Exception as e:
        print(f"❌ Error in search suggestions: {str(e)}")
        return jsonify([])

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

@app.route('/api/product-image/<product_name>')
def get_product_image(product_name):
    """Dynamically find and serve the appropriate product image without hardcoded categories"""
    try:
        # Normalize product name
        product_name = product_name.lower()
        
        # First, try to match from database
        product = db.products.find_one({"name": {"$regex": product_name, "$options": "i"}})
        if product and "image" in product and product["image"]:
            # Instead of redirect, return a JSON with the image URL
            image_url = product["image"]
            return jsonify({"image_url": image_url})
            
        # If we have a category in the product, use it
        if product and "category" in product:
            product_category = product["category"].lower()
        else:
            # No need to guess categories - we'll do direct image matching
            product_category = None
        
        # Look for images in static/images directory
        image_dir = os.path.join(app.static_folder, 'images')
        
        # Try to match by exact name first
        for image_file in os.listdir(image_dir):
            if image_file.endswith(('.jpg', '.png', '.jpeg', '.gif')):
                normalized_filename = image_file.lower()
                # Look for exact product name match
                if product_name.replace(' ', '_') in normalized_filename:
                    print(f"Found exact match for {product_name}: {image_file}")
                    return send_from_directory('static/images', image_file)
        
        # Try to match by individual keywords in the product name
        product_keywords = set(product_name.split())
        best_match = None
        best_match_score = 0
        
        for image_file in os.listdir(image_dir):
            if image_file.endswith(('.jpg', '.png', '.jpeg', '.gif')):
                # Calculate score based on how many keywords match
                filename_words = set(image_file.lower().replace('.jpg', '').replace('.png', '').replace('_', ' ').split())
                match_score = len(product_keywords.intersection(filename_words))
                
                if match_score > best_match_score:
                    best_match_score = match_score
                    best_match = image_file
                    
                # If we have an exact match, use it immediately
                if match_score == len(product_keywords):
                    print(f"Found perfect keyword match for {product_name}: {image_file}")
                    return send_from_directory('static/images', image_file)
        
        # If we found a partial match with at least one keyword
        if best_match and best_match_score > 0:
            print(f"Found best keyword match for {product_name}: {best_match} (score: {best_match_score})")
            return send_from_directory('static/images', best_match)
                    
        # If no match is found, return a default image
        print(f"No image match found for {product_name}, using default")
        return send_from_directory('static/images', 'default-product.jpg')
    
    except Exception as e:
        print(f"Error finding product image: {str(e)}")
        return send_from_directory('static/images', 'default-product.jpg')

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
                "chat_stage": "ask_purpose",
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

        # Step 1: Detect Product Category (Laptops, Phones, TVs)
        if chat_data["chat_stage"] == "ask_purpose":
            detected_category = detect_product_category(user_message)
            if not detected_category:
                return jsonify({"reply": "Could you clarify? Are you looking for a Phone, Laptop, or TV?"})

            chat_data["selected_category"] = detected_category
            
            # Check if user already mentioned purpose in their first message
            purpose_keywords = {
                "gaming": ["gaming", "game", "games", "play games", "gamer", "play"],
                "work": ["work", "office", "professional", "business", "coding", "code"],
                "entertainment": ["movies", "watch", "streaming", "entertainment", "videos"],
                "student": ["school", "college", "student", "education", "study"]
            }
            
            detected_purpose = None
            user_msg_lower = user_message.lower()
            for purpose, keywords in purpose_keywords.items():
                if any(keyword in user_msg_lower for keyword in keywords):
                    detected_purpose = user_msg_lower
                    break
            
            if detected_purpose:
                # User already mentioned purpose, skip to features
                chat_data["selected_purpose"] = detected_purpose
                chat_data["chat_stage"] = "ask_features"
                session[session_key] = chat_data
                
                # Get category-specific feature prompt
                if detected_category == "phone":
                    feature_prompt = "Great! Do you have any specific features in mind for this phone? (e.g., Camera quality, Battery life, Storage capacity, Processing power)"
                elif detected_category == "laptop":
                    feature_prompt = "Great! Do you have any specific features in mind for this laptop? (e.g., RAM, Processor type, Storage capacity, Screen size, Weight)"
                elif detected_category == "tv":
                    feature_prompt = "Great! Do you have any specific features in mind for this TV? (e.g., Screen size, Resolution, Panel type, Smart features, HDMI ports)"
                else:
                    # Generic fallback
                    feature_prompt = f"Great! Do you have any specific features in mind for this {detected_category}?"
                
                return jsonify({"reply": feature_prompt})
            
            # User didn't mention purpose, ask for it
            chat_data["chat_stage"] = "ask_features"
            session[session_key] = chat_data
            
            # Get category-specific purpose question
            if detected_category == 'tv':
                purpose_question = "Great! What kind of content do you usually watch on TV? (e.g., Sports, Movies, Gaming)"
            elif detected_category == 'phone':
                purpose_question = "Great! What will you primarily use this phone for? (e.g., Gaming, work or basic use)"
            elif detected_category == 'laptop':
                purpose_question = "Great! What will you primarily use this laptop for? (e.g., Gaming, Work, Entertainment)?"
            else:
                purpose_question = f"Great! What will you primarily use this {detected_category} for?"
            
            return jsonify({"reply": purpose_question})

        # Step 2: Ask for Features
        if chat_data["chat_stage"] == "ask_features":
            # Check if the user is correcting us about the purpose
            correction_phrases = [
                "i just said", "i already told you", "i mentioned", 
                "as i said", "like i said", "i just told you"
            ]
            
            is_correction = any(phrase in user_message.lower() for phrase in correction_phrases)
            
            if is_correction:
                # Extract the actual purpose from the correction
                purpose_keywords = {
                    "gaming": ["gaming", "game", "games", "play games", "gamer", "play"],
                    "work": ["work", "office", "professional", "business", "coding", "code"],
                    "entertainment": ["movies", "watch", "streaming", "entertainment", "videos"],
                    "student": ["school", "college", "student", "education", "study"]
                }
                
                detected_purpose = None
                user_msg_lower = user_message.lower()
                for purpose, keywords in purpose_keywords.items():
                    if any(keyword in user_msg_lower for keyword in keywords):
                        detected_purpose = purpose
                        break
                
                if detected_purpose:
                    chat_data["selected_purpose"] = detected_purpose
                else:
                    chat_data["selected_purpose"] = user_message  # Store the whole message as purpose
            else:
                chat_data["selected_purpose"] = user_message
            
            # FIXED: Remove duplicate feature prompt here - proceed directly to asking for budget
            chat_data["chat_stage"] = "ask_budget"
            session[session_key] = chat_data
            
            # Ask about features directly instead of repeating the question
            budget_prompt = "Do you have any specific features in mind for this product? (e.g., display quality, performance, storage)"
            return jsonify({"reply": budget_prompt})

        # Step 3: Ask for Budget & Brand
        if chat_data["chat_stage"] == "ask_budget":
            # Process features - handle "I don't know" cases
            dont_know_phrases = ["don't know", "dont know", "not sure", "no idea", "none"]
            
            if any(phrase in user_message.lower() for phrase in dont_know_phrases):
                chat_data["selected_features"] = []
            else:
                chat_data["selected_features"] = user_message.split(", ") if user_message.lower() != "none" else []
            
            chat_data["chat_stage"] = "recommend_products"
            session[session_key] = chat_data
            
            # Category-specific budget prompts
            if chat_data["selected_category"] == "phone":
                budget_prompt = "What's your budget range for this phone? Do you have a preferred brand?"
            elif chat_data["selected_category"] == "laptop":
                budget_prompt = "What's your budget range for this laptop? Do you have a preferred brand?"
            elif chat_data["selected_category"] == "tv":
                budget_prompt = "What's your budget range for this TV? Do you have a preferred brand?"
            else:
                budget_prompt = f"What's your budget range for this {chat_data['selected_category']}? Do you have a preferred brand?"
            
            return jsonify({"reply": budget_prompt})

        # Step 4: Send Finalized Query to Gemini
        if chat_data["chat_stage"] == "recommend_products":
            # Handle "I don't know" responses for budget
            dont_know_phrases = ["don't know", "dont know", "not sure", "no idea", "none"]
            student_phrases = ["student", "university", "college", "school", "tight budget", "limited budget"]
            
            # Extract budget and brand information
            budget_brand_response = user_message
            chat_data["budget_brand_response"] = budget_brand_response
            
            # Try to extract brand preference
            common_brands = ["apple", "samsung", "sony", "lg", "dell", "hp", "asus", 
                           "acer", "lenovo", "microsoft", "google", "oneplus", "xiaomi"]
            
            detected_brand = None
            for brand in common_brands:
                if brand in budget_brand_response.lower() and f"not {brand}" not in budget_brand_response.lower():
                    detected_brand = brand
                    break
                    
            # Product lines that imply brands
            brand_indicators = {
                "iphone": "apple", "macbook": "apple", "galaxy": "samsung", 
                "pixel": "google", "surface": "microsoft"
            }
            
            for indicator, brand in brand_indicators.items():
                if indicator in budget_brand_response.lower():
                    detected_brand = brand
                    break
            
            chat_data["selected_brand"] = detected_brand if detected_brand else ""
            
            # Prepare structured data - pass the raw response as additional context
            structured_query = {
                "category": chat_data["selected_category"],
                "purpose": chat_data["selected_purpose"],
                "features": chat_data["selected_features"],
                "budget_brand_response": budget_brand_response,
                "brand": chat_data["selected_brand"],
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

                # Determine product category from first recommended product (if available)
                product_category = None
                if products and len(products) > 0:
                    first_product = products[0]
                    if 'category' in first_product:
                        product_category = first_product['category'].lower()
                    else:
                        # Try to guess from product name
                        product_name = first_product.get('name', '').lower()
                        if any(term in product_name for term in ['tv', 'television']):
                            product_category = 'tv'
                        elif any(term in product_name for term in ['phone', 'smartphone', 'iphone']):
                            product_category = 'phone'
                        elif any(term in product_name for term in ['laptop', 'computer', 'macbook']):
                            product_category = 'laptop'

                # Generate category-specific follow-up question
                category_specific_question = get_category_specific_follow_up(user_message, product_category)

                # Add the category-specific prompt with clear separation markers
                follow_up_prompt = f"\n\n---\n\n{category_specific_question} Or would you like me to help you choose between these options?"
                formatted_response += follow_up_prompt
                
                # Move to follow-up stage instead of resetting
                chat_data["chat_stage"] = "followup_questions"
                session[session_key] = chat_data
                
                return jsonify({"reply": formatted_response})
            
            # If no products were found or there was an error
            return jsonify({"reply": gemini_response.get("message", "I couldn't find suitable products.")})
            
        # Handle follow-up questions after recommendations
        if chat_data["chat_stage"] == "followup_questions":
            # Check for conversation closing signals
            if any(keyword in user_message.lower() for keyword in ["thank you", "thanks", "great", "perfect", "buy", "purchase", "add to cart"]):
                # User seems satisfied, provide a closing message and reset
                closing_message = "I'm glad I could help you find the right product! Is there anything else you'd like to know about our products?"
                
                # Reset the conversation but keep the category for potential follow-up
                original_category = chat_data["selected_category"]
                chat_data["chat_stage"] = "ask_purpose"
                chat_data["selected_category"] = ""
                chat_data["selected_purpose"] = ""
                chat_data["selected_features"] = []
                chat_data["selected_budget"] = ""
                chat_data["selected_brand"] = ""
                chat_data["recommended_products"] = []
                chat_data["chosen_product"] = None
                session[session_key] = chat_data
                
                return jsonify({"reply": closing_message})
            
            # Check if the user is asking about specific products
            recommended_products = chat_data.get("recommended_products", [])
            product_names = [p.get("name", "").lower() for p in recommended_products]
            
            # Check if the user is asking about specific recommended products
            mentioned_products = []
            for product_name in product_names:
                if product_name and product_name in user_message.lower():
                    mentioned_products.append(product_name)
            
            # If user asks about specific products
            if mentioned_products:
                followup_query = {
                    "category": chat_data["selected_category"],
                    "purpose": chat_data["selected_purpose"],
                    "features": chat_data["selected_features"],
                    "budget_brand_response": chat_data.get("budget_brand_response", ""),
                    "user_question": user_message,
                    "is_followup": True,
                    "recommended_products": chat_data["recommended_products"],
                    "specifically_mentioned_products": mentioned_products,  # Pass the specifically mentioned products
                    "task_suitability_check": True  # Flag to check if products are suitable for the task
                }
                
                # Get products from database for full context
                structured_products = fetch_products_from_database()
                all_category_products = structured_products.get(chat_data["selected_category"], [])
                followup_query["all_products"] = all_category_products
                
                # Send to Gemini for follow-up response with suitability check
                followup_response = send_followup_to_gemini(followup_query)
                
                # Return the response with HTML formatting if available
                if "isHtml" in followup_response and followup_response["isHtml"]:
                    return jsonify({
                        "reply": followup_response.get("message", "Let me help you with that:"),
                        "isHtml": True
                    })
                else:
                    return jsonify({
                        "reply": followup_response.get("message", "Let me help you with that:")
                    })
                
            # Check if we have recommended products to discuss
            if not chat_data["recommended_products"]:
                # Fallback if somehow we lost our recommendations
                chat_data["chat_stage"] = "greeting"
                session[session_key] = chat_data
                return jsonify({"reply": "I'm sorry, I've lost track of our product recommendations. Let's start over. What kind of product are you looking for today?"})
            
            # Handle "I don't like any of these" scenarios
            dislike_phrases = ["don't like", "dont like", "not interested", "none of these", 
                               "something else", "other options", "other products"]
            
            if any(phrase in user_message.lower() for phrase in dislike_phrases):
                # User doesn't like the recommendations, ask for more specific preferences
                followup_query = {
                    "category": chat_data["selected_category"],
                    "purpose": chat_data["selected_purpose"],
                    "features": chat_data["selected_features"],
                    "budget_brand_response": chat_data.get("budget_brand_response", ""),
                    "user_question": user_message,
                    "is_followup": True,
                    "recommended_products": chat_data["recommended_products"],
                    "request_alternatives": True  # Flag to request alternative products
                }
                
                # Get access to the full product database
                structured_products = fetch_products_from_database()
                
                # Create enhanced followup query with all products
                followup_query["all_products"] = structured_products.get(chat_data["selected_category"], [])
                
                # Send to Gemini for follow-up response with alternative suggestions
                followup_response = send_followup_to_gemini(followup_query)
                
                # If we have alternative products, update the recommended products
                if "alternative_products" in followup_response and followup_response["alternative_products"]:
                    chat_data["recommended_products"] = followup_response["alternative_products"]
                    session[session_key] = chat_data
                
                # Return the response with HTML formatting if available
                if "isHtml" in followup_response and followup_response["isHtml"]:
                    return jsonify({
                        "reply": followup_response.get("message", "Here are some alternatives you might prefer:"),
                        "isHtml": True
                    })
                else:
                    return jsonify({
                        "reply": followup_response.get("message", "Here are some alternatives you might prefer:")
                    })
            
            # Handle "which one is best for me" scenarios
            best_choice_phrases = ["which one", "which is best", "best for me", "recommend one", 
                                  "suggest one", "best option", "best choice"]
            
            if any(phrase in user_message.lower() for phrase in best_choice_phrases):
                # User wants a specific recommendation
                followup_query = {
                    "category": chat_data["selected_category"],
                    "purpose": chat_data["selected_purpose"],
                    "features": chat_data["selected_features"],
                    "budget_brand_response": chat_data.get("budget_brand_response", ""),
                    "user_question": user_message,
                    "is_followup": True,
                    "recommended_products": chat_data["recommended_products"],
                    "make_recommendation": True  # Flag to make a final recommendation
                }
                
                # Send to Gemini for follow-up response
                followup_response = send_followup_to_gemini(followup_query)
                
                # If we have a final choice, save it
                if "final_choice" in followup_response and followup_response["final_choice"]:
                    chat_data["chosen_product"] = followup_response["final_choice"]
                    session[session_key] = chat_data
                
                # Return the response with HTML formatting if available
                if "isHtml" in followup_response and followup_response["isHtml"]:
                    return jsonify({
                        "reply": followup_response.get("message", "Based on your requirements, I recommend this product:"),
                        "isHtml": True
                    })
                else:
                    return jsonify({
                        "reply": followup_response.get("message", "Based on your requirements, I recommend this product:")
                    })
            
            # For other types of follow-up questions
            followup_query = {
                "category": chat_data["selected_category"],
                "purpose": chat_data["selected_purpose"],
                "features": chat_data["selected_features"],
                "budget_brand_response": chat_data.get("budget_brand_response", ""),
                "user_question": user_message,
                "is_followup": True,
                "recommended_products": chat_data["recommended_products"]
            }
            
            # Get products from database for full context
            structured_products = fetch_products_from_database()
            all_category_products = structured_products.get(chat_data["selected_category"], [])
            followup_query["all_products"] = all_category_products
            
            # Send to Gemini for follow-up response
            followup_response = send_followup_to_gemini(followup_query)
            
            # Return the response with HTML formatting if available
            if "isHtml" in followup_response and followup_response["isHtml"]:
                return jsonify({
                    "reply": followup_response.get("message", "Let me help you with that:"),
                    "isHtml": True
                })
            else:
                return jsonify({
                    "reply": followup_response.get("message", "Let me help you with that:")
                })

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
    Enhanced function to detect product category with better typo tolerance
    and more synonyms/variations.
    """
    # Convert user message to lowercase and clean whitespace
    user_message_lower = user_message.lower().strip()
    
    # Expanded keywords for better matching
    category_keywords = {
        "phone": ["phone", "mobile", "smartphone", "iphone", "samsung", "android", 
                  "cell", "cellular", "fone", "celfone", "handset"],
        "laptop": ["laptop", "macbook", "notebook", "ultrabook", "gaming laptop", 
                   "computer", "pc", "portable computer", "lapto", "latop", "laptp", "labtop"],
        "tv": ["tv", "television", "oled", "4k", "smart tv", "qled", "lcd", 
               "tele", "screen", "display", "monitor"]
    }

    # First check for explicit mentions with exact matching
    for category, keywords in category_keywords.items():
        if any(keyword in user_message_lower.split() for keyword in keywords):
            return category
    
    # Try partial matching for typo tolerance
    for category, keywords in category_keywords.items():
        for keyword in keywords:
            # Check if any keyword is similar to any word in the user message
            if any(levenshtein_distance(word, keyword) <= 2 for word in user_message_lower.split()):
                return category
    
    return ""  # No category detected

def levenshtein_distance(s1, s2):
    """
    Calculate the Levenshtein distance between two strings.
    This helps with typo tolerance.
    """
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    
    if len(s2) == 0:
        return len(s1)
    
    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    
    return previous_row[-1]

def send_to_gemini(user_data, structured_products):
    """
    Enhanced function to improve product filtering and respect brand preferences.
    """
    # Get products from the selected category
    category = user_data["category"].lower()
    all_products = structured_products.get(category, [])
    
    if not all_products:
        return {"response_type": "recommendation", 
                "message": f"I don't have any {category} products in our database at the moment."}
    
    print(f"🔍 Sending {len(all_products)} {category} products to Gemini")
    
    # Extract brand preference more accurately
    brand_preference = None
    if "budget_brand_response" in user_data:
        brand_response = user_data["budget_brand_response"].lower()
        
        # List of common brands to check for
        common_brands = ["apple", "samsung", "sony", "lg", "dell", "hp", "asus", 
                        "acer", "lenovo", "microsoft", "google", "oneplus", "xiaomi"]
        
        # Check if any brand is mentioned
        for brand in common_brands:
            if brand in brand_response and "not " + brand not in brand_response:
                brand_preference = brand
                break
                
        # Check for specific product lines that imply brands
        brand_indicators = {
            "iphone": "apple", "macbook": "apple", "galaxy": "samsung", 
            "pixel": "google", "surface": "microsoft"
        }
        
        for indicator, brand in brand_indicators.items():
            if indicator in brand_response:
                brand_preference = brand
                break
    
    # Convert products to JSON for Gemini
    products_json = json.dumps(all_products, indent=2)

    # Prepare the requirements
    requirements = []
    if user_data["purpose"]:
        requirements.append(f"Will be used for: {user_data['purpose']}")
    if user_data["features"]:
        features_text = ", ".join(user_data["features"]) if isinstance(user_data["features"], list) else user_data["features"]
        requirements.append(f"Desired features: {features_text}")
    
    # Add brand preference if detected
    if brand_preference:
        requirements.append(f"Preferred brand: {brand_preference}")
    
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
        10. IMPORTANT: Always include the product's image field in your recommendations
        11. If a specific brand is mentioned, ONLY recommend products from that brand unless none are available

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
              "features": ["Feature1", "Feature2", "Feature3"],
              "image": "The image URL from the product data"
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
        
        # Handle brand preference in post-processing if needed
        if brand_preference and "recommended_products" in parsed_json:
            brand_products = [p for p in parsed_json["recommended_products"] 
                            if brand_preference.lower() in p.get("name", "").lower() or 
                               brand_preference.lower() in p.get("brand", "").lower()]
            
            # If we have brand matches, prioritize them
            if brand_products:
                parsed_json["recommended_products"] = brand_products
                parsed_json["message"] = f"Here are the best {brand_preference.capitalize()} products based on your requirements:"
            elif len(parsed_json["recommended_products"]) > 0:
                # If no brand matches but we have other recommendations
                parsed_json["message"] = f"I couldn't find any {brand_preference.capitalize()} products matching your criteria. Here are some alternatives:"
        
        # Verify that recommended products actually match those in our database
        if "recommended_products" in parsed_json:
            valid_products = []
            available_product_names = [p["name"] for p in all_products]
            
            for product in parsed_json["recommended_products"]:
                if product["name"] in available_product_names:
                    # Find the matching product in our database to ensure we have the correct image
                    matching_product = next((p for p in all_products if p["name"] == product["name"]), None)
                    if matching_product:
                        # Make sure we have the image from our database
                        product["image"] = matching_product.get("image", product.get("image", "default-product.jpg"))
                        # Add brand info if available
                        if "brand" in matching_product and "brand" not in product:
                            product["brand"] = matching_product["brand"]
                        # Add category info if available
                        if "category" in matching_product and "category" not in product:
                            product["category"] = matching_product["category"]

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
    Enhanced follow-up handler with better product suitability checking.
    """
    recommended_products = query_data.get("recommended_products", [])
    user_question = query_data.get("user_question", "")
    category = query_data.get("category", "")
    specifically_mentioned_products = query_data.get("specifically_mentioned_products", [])
    task_suitability_check = query_data.get("task_suitability_check", False)
    
    if not recommended_products:
        return {"message": "I don't have any recommendations to discuss. Let's start over with your product search."}
    
    # Get access to the full product database for the category
    all_products = query_data.get("all_products", [])
    
    # Extract context from previous conversation
    context = []
    if query_data.get("purpose"):
        context.append(f"User needs a {category} for: {query_data['purpose']}")
    if query_data.get("features"):
        features_text = ", ".join(query_data['features']) if isinstance(query_data['features'], list) else query_data['features']
        context.append(f"Desired features: {features_text}")
    if query_data.get("budget_brand_response"):
        context.append(f"Budget and brand preferences: {query_data['budget_brand_response']}")
    
    context_text = "\n".join([f"- {ctx}" for ctx in context])
    
    # Additional instructions for product suitability check
    suitability_check_instructions = ""
    if task_suitability_check and specifically_mentioned_products:
        suitability_check_instructions = f"""
        IMPORTANT: The user has specifically asked about the following products: {', '.join(specifically_mentioned_products)}
        You MUST assess if these specific products are suitable for the user's needs based on the context.
        If they are NOT suitable, you MUST:
        1. Clearly explain WHY they are not suitable for the specific needs/purpose mentioned.
        2. ONLY THEN recommend alternatives that would better meet their needs.
        If they ARE suitable, provide detailed information on those specific products.
        """
    
    # Prepare the products context
    context_products = {
        "recommended": recommended_products,
        "all_available": all_products,
        "specifically_mentioned": specifically_mentioned_products
    }
    
    # Convert context to JSON for Gemini
    context_json = json.dumps(context_products, indent=2)
    
    gpt_payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "text": f"""
        You are a digital shopping assistant helping a customer choose between products.

        ### **CONVERSATION CONTEXT:**
        {context_text}

        ### **PRODUCT CONTEXT:**
        ```json
        {context_json}
        ```

        ### **USER'S FOLLOW-UP QUESTION:**
        "{user_question}"

        {suitability_check_instructions}

        ### **INSTRUCTIONS:**
        1. If the user is asking about specific products that were previously recommended, focus ONLY on those specific products.
        2. If those specific products are not suitable for the user's needs, CLEARLY EXPLAIN WHY before suggesting alternatives.
        3. If the user is asking to compare products, highlight the key differences.
        4. If the user is expressing preference for a specific feature, explain which product best satisfies that preference.
        5. If the user does not like the recommended products, suggest alternatives from the full product list that might better match their needs.
        6. If the user seems ready to make a final decision or asks "which is best", recommend a single product that best matches their overall requirements.
        7. If you recommend a final choice, include it in the special "final_choice" field in your response.
        8. Format the response to include relevant product details including View Details and Add to Cart options.
        9. If suggesting new products not in the original recommendations, include them in the "alternative_products" field.
        10. IMPORTANT: NEVER format your response as Markdown. ALWAYS use the JSON format with alternative_products as an array of product objects.

        ### **RESPONSE FORMAT:**
        ```json
        {{
          "message": "Your detailed response to the user's question",
          "final_choice": null,  // If making a final recommendation, include the full product object here
          "alternative_products": []  // If suggesting alternatives, include them here
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
        
        # Fix the regex pattern for extracting JSON
        json_match = re.search(r"```json\s*({.*?})\s*```", generated_text, re.DOTALL)
        
        if not json_match:
            print("❌ Failed to extract JSON from follow-up Gemini response")
            print(f"Response text: {generated_text[:200]}...")  # Print first 200 chars for debugging
            return {"message": "I couldn't properly analyze your question about these products. Could you rephrase it?"}

        parsed_json = json.loads(json_match.group(1).strip())
        
        # Process alternative products recommendations
        if "alternative_products" in parsed_json and parsed_json["alternative_products"]:
            # Format the response message to include the alternatives
            alternatives = parsed_json["alternative_products"]
            
            # Generate HTML content for alternative products - FIXED VERSION
            alternative_html = ""
            for product in alternatives:
                name = product.get("name", "Unknown Product")
                price = product.get("price", "Price unavailable")
                features = product.get("features", [])
                image = product.get("image", "default-product.jpg")
                
                # If image is missing, try to find it
                if "image" not in product or not product["image"]:
                    # Try to find matching product in all_products
                    matching_product = next((p for p in all_products if p["name"] == name), None)
                    if matching_product and "image" in matching_product:
                        image = matching_product["image"]
                    else:
                        image = f"http://localhost:5001/images/default-product.jpg"
                
                # Create product ID for linking
                product_id = name.lower().replace(" ", "-").replace("/", "-")
                
                # Format features as a comma-separated list
                feature_text = ", ".join(features[:3]) if features else "No features listed"
                
                # Add to HTML content with consistent styling
                alternative_html += f"""
                <div style="margin: 15px 0; padding: 15px; border-radius: 8px; background: #ffffff; border: 1px solid #e9ecef;">
                <div style="display: flex; align-items: flex-start; margin-bottom: 10px;">
                    <img 
                    src="{image}" 
                    alt="{name}" 
                    style="width: 60px; height: 60px; object-fit: contain; margin-right: 15px; border-radius: 4px;" 
                    onerror="this.onerror=null; this.src='http://localhost:5001/images/default-product.jpg';" 
                    />
                    <div style="flex: 1;">
                    <div style="font-weight: bold; font-size: 16px; margin-bottom: 2px; color: #000;">{name}</div>
                    <div style="font-weight: bold; font-size: 16px; margin-bottom: 5px; color: #000;">{price}</div>
                    <div style="font-size: 14px; color: #666; line-height: 1.4;">{feature_text}</div>
                    </div>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    <a 
                    href="/product/1-{product_id}" 
                    target="_blank"
                    rel="noopener noreferrer" 
                    style="color: #007bff; text-decoration: none; display: inline-block; padding: 8px 12px; background: #e6f7ff; border-radius: 4px; font-size: 14px; flex: 1; text-align: center;"
                    data-product-id="1-{product_id}"
                    data-product-name="{name.replace('"', '&quot;')}"
                    >
                    View Details
                    </a>
                    <button 
                    class="add-to-cart-btn" 
                    data-id="1-{product_id}" 
                    data-name="{name.replace("'", "\\'")}" 
                    data-price="{price.replace('$', '') if isinstance(price, str) else price}" 
                    data-image="{image}"
                    style="color: white; background: #28a745; border: none; border-radius: 4px; padding: 8px 12px; font-size: 14px; cursor: pointer; flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px;"
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4a2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                    </svg>
                    Add to Cart
                    </button>
                </div>
                </div>
                """
            
            # Combine original message with HTML product displays
            original_message = parsed_json.get("message", "Here are some alternative products that might better match your needs:")
            parsed_json["message"] = f"{original_message}\n\n{alternative_html}"
            parsed_json["isHtml"] = True
        
        # Format final choice with product details if present
        if "final_choice" in parsed_json and parsed_json["final_choice"]:
            product = parsed_json["final_choice"]
            name = product.get("name", "Unknown Product")
            price = product.get("price", "Price unavailable")
            features = product.get("features", [])
            image = product.get("image", "default-product.jpg")
            
            # If image is missing, try to find it
            if "image" not in product or not product["image"]:
                matching_product = next((p for p in all_products if p["name"] == name), None)
                if matching_product and "image" in matching_product:
                    image = matching_product["image"]
                else:
                    image = f"http://localhost:5001/images/default-product.jpg"
            
            # Create product ID for linking
            product_id = name.lower().replace(" ", "-").replace("/", "-")
            
            # Format features
            feature_text = ", ".join(features[:3]) if features else "No features listed"
            
            # Create HTML for final choice
            final_choice_html = f"""
            <div style="margin: 15px 0; padding: 15px; border-radius: 8px; background: #e7f7ee; border: 1px solid #28a745;">
              <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <img 
                  src="{image}" 
                  alt="{name}" 
                  style="width: 80px; height: 80px; object-fit: contain; margin-right: 15px; border-radius: 4px;" 
                  onerror="this.onerror=null; this.src='http://localhost:5001/images/default-product.jpg';" 
                />
                <div>
                  <strong style="font-size: 18px;">{name}</strong> - {price}
                  <div>{feature_text}</div>
                </div>
              </div>
              <div style="display: flex; gap: 10px; margin-top: 10px;">
                <a 
                  href="/product/1-{product_id}" 
                  target="_blank"
                  rel="noopener noreferrer" 
                  style="color: #007bff; text-decoration: none; display: inline-block; padding: 8px 12px; background: #e6f0ff; border-radius: 4px; font-size: 14px; flex: 1; text-align: center;"
                  data-product-id="1-{product_id}"
                  data-product-name="{name.replace('"', '&quot;')}"
                >
                  View Details
                </a>
                <button 
                  class="add-to-cart-btn" 
                  data-id="1-{product_id}" 
                  data-name="{name.replace("'", "\\'")}" 
                  data-price="{price.replace('$', '') if isinstance(price, str) else price}" 
                  data-image="{image}"
                  style="color: white; background: #28a745; border: none; border-radius: 4px; padding: 8px 12px; font-size: 14px; cursor: pointer; flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px;"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4a2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                  </svg>
                  Add to Cart
                </button>
              </div>
            </div>
            """
            
            # Combine original message with HTML product display
            original_message = parsed_json.get("message", "Based on your requirements, I think this is the best choice for you:")
            parsed_json["message"] = f"{original_message}\n\n{final_choice_html}"
            parsed_json["isHtml"] = True
        
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
                    
                    # Get image directly from database field
                    product_image = sub_prod.get("image", "")

                    # Skip products without a name
                    if not product_name:
                        continue

                    # Handle missing data
                    if product_price == "N/A" or product_price is None:
                        product_price = "Unknown Price"

                    if not product_brand:
                        product_brand = "Generic Brand"
                    
                    # Create full image URL - use the image from database
                    image_url = None
                    if product_image:
                        image_url = f"http://localhost:5001/images/{product_image}"
                    else:
                        # If no image in database, create a generic name based on brand and product
                        image_url = f"http://localhost:5001/images/default-product.jpg"
                    
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

def get_category_specific_follow_up(user_message, product_category=None):
    """Generate category-specific follow-up questions"""
    
    # First try to detect category from the user message if not provided
    if not product_category:
        message_lower = user_message.lower()
        
        if any(term in message_lower for term in ['tv', 'television', 'screen', 'display']):
            product_category = 'tv'
        elif any(term in message_lower for term in ['phone', 'smartphone', 'iphone', 'android', 'mobile']):
            product_category = 'phone'
        elif any(term in message_lower for term in ['laptop', 'computer', 'notebook', 'macbook']):
            product_category = 'laptop'
    
    # Return category-specific follow-up
    if product_category == 'tv':
        return "What kind of content do you usually watch on your TV? (e.g., Sports, Movies, Gaming)"
    elif product_category == 'phone':
        return "What features are most important to you in a phone? (e.g., Camera quality, Battery life, Performance)"
    elif product_category == 'laptop':
        return "What will you primarily use this laptop for? (e.g., Gaming, Work, Entertainment)?"
    else:
        return "Is there anything specific you're looking for in this product? (e.g., Brand preference, Price range, Key features)"

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)
