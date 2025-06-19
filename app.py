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
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='.', static_url_path='')
#  Configure Flask Session for Vercel compatibility
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'YOUR_FLASK_SECRET_KEY_HERE')

# Use in-memory sessions for Vercel (serverless)
if os.getenv('VERCEL'):
    app.config['SESSION_TYPE'] = 'null'  # No session storage for serverless
else:
    app.config['SESSION_TYPE'] = 'filesystem'
    app.config['SESSION_PERMANENT'] = False
    app.config['SESSION_FILE_DIR'] = os.path.join(os.getcwd(), '.flask_session')

#  Set session cookie policies
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = True if os.getenv('VERCEL') else False

#  Apply CORS with proper settings for Vercel
ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', '*').split(',')
CORS(app, 
     resources={r"/*": {"origins": ALLOWED_ORIGINS}}, 
     supports_credentials=False if os.getenv('VERCEL') else True,
     expose_headers=["Content-Type", "Authorization"],
     allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
     methods=["GET", "POST", "OPTIONS"]
)

# Initialize Flask-Session
if not os.getenv('VERCEL'):
    Session(app)

# MongoDB Connection with improved error handling and SSL options
MONGODB_URI = os.getenv('MONGODB_URI')
try:
    # Try multiple connection configurations for maximum compatibility
    connection_configs = [
        # Configuration 1: Standard SSL settings
        {
            'tlsAllowInvalidCertificates': True,
            'serverSelectionTimeoutMS': 8000,
            'connectTimeoutMS': 8000,
            'socketTimeoutMS': 8000,
            'retryWrites': True,
            'retryReads': True,
            'maxPoolSize': 10
        },
        # Configuration 2: Disable SSL verification entirely
        {
            'ssl': False,
            'serverSelectionTimeoutMS': 5000,
            'connectTimeoutMS': 5000,
            'socketTimeoutMS': 5000,
            'retryWrites': True,
            'retryReads': True
        },
        # Configuration 3: Basic connection with minimal SSL
        {
            'tls': True,
            'tlsInsecure': True,
            'serverSelectionTimeoutMS': 3000,
            'connectTimeoutMS': 3000,
            'socketTimeoutMS': 3000
        }
    ]
    
    client = None
    for i, config in enumerate(connection_configs, 1):
        try:
            print(f"🔄 Attempting MongoDB connection (config {i})...")
            test_client = MongoClient(MONGODB_URI, **config)
            # Test the connection with a quick ping
            test_client.admin.command('ping')
            client = test_client
            print(f"✅ Successfully connected to MongoDB Atlas (config {i})")
            break
        except Exception as config_error:
            print(f"❌ Config {i} failed: {str(config_error)}")
            continue
    
    if client:
        db = client["ecommerce_db"]
        collection = db["products"]
        MONGODB_CONNECTED = True
    else:
        raise Exception("All connection configurations failed")
        
except Exception as e:
    print(f"❌ Failed to connect to MongoDB Atlas with all configurations")
    print(f"   Final error: {str(e)}")
    print("🔄 Will use local JSON fallback for product data")
    client = None
    db = None
    collection = None
    MONGODB_CONNECTED = False 


# Google Gemini API Setup
api_key = os.getenv('GEMINI_API_KEY')
endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={api_key}"


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

def convert_markdown_to_html(text):
    """
    Convert basic markdown formatting to HTML.
    Specifically handles ** for bold text and * for italic text.
    """
    import re
    
    # Convert **text** to <strong>text</strong>
    text = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', text)
    
    # Convert *text* to <em>text</em> (for italic support)
    text = re.sub(r'\*([^*]+)\*', r'<em>\1</em>', text)
    
    return text

# Add this simple detection function after generate_comparison_table

def detect_comparison_request(user_message):
    """
    Detects if the user is asking for a product comparison.
    """
    comparison_keywords = [
        'compare', 'vs', 'versus', 'difference between', 
        'which is better', 'comparison', 'better than',
        'choose between', 'deciding between'
    ]
    
    message_lower = user_message.lower()
    return any(keyword in message_lower for keyword in comparison_keywords)

def generate_comparison_table(comparison_data):
    """
    Generates an HTML comparison table from structured data.
    Expected format: {
        "products": ["Product 1", "Product 2"],
        "features": {
            "Price": ["$999", "$899"],
            "Processor": ["A17 Pro", "Snapdragon 8 Gen 3"],
            ...
        }
    }
    """
    if not comparison_data or "products" not in comparison_data:
        return ""
    
    products = comparison_data["products"]
    features = comparison_data.get("features", {})
    
    # Start building the table
    html = """
    <div style="margin: 20px 0; overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); min-width: 500px;">
            <thead>
                <tr style="background: #000000; color: white;">
                    <th style="padding: 12px; text-align: left; border: 1px solid #333333; font-weight: 600; min-width: 120px;">Feature</th>
    """
    
    # Add product headers
    for product in products:
        html += f'<th style="padding: 12px; text-align: left; border: 1px solid #333333; font-weight: 600;">{product}</th>\n'
    
    html += """
                </tr>
            </thead>
            <tbody>
    """
    
    # Add feature rows
    for feature, values in features.items():
        html += '<tr>\n'
        html += f'<td style="padding: 12px; border: 1px solid #dee2e6; font-weight: 500; background: #f8f9fa;">{feature}</td>\n'
        for value in values:
            html += f'<td style="padding: 12px; border: 1px solid #dee2e6;">{value}</td>\n'
        html += '</tr>\n'
    
    html += """
            </tbody>
        </table>
    </div>
    """
    
    return html



# Test route to check if Flask is running
@app.route('/test', methods=['GET'])
def test():
    logging.info("Test API called")
    return jsonify({"message": "API is working!"}), 200

# Health check endpoint to monitor system status
@app.route('/health', methods=['GET'])
def health_check():
    """
    Comprehensive health check for the Flask application
    """
    try:
        health_status = {
            "status": "healthy",
            "timestamp": json.dumps({"timestamp": "now"}, default=str),
            "services": {
                "flask": "running",
                "mongodb": "connected" if MONGODB_CONNECTED else "disconnected",
                "local_fallback": "available",
                "gemini_api": "configured" if api_key else "not_configured"
            },
            "data_sources": {
                "primary": "mongodb_atlas" if MONGODB_CONNECTED else "local_json",
                "fallback": "local_json" if not MONGODB_CONNECTED else "mongodb_atlas"
            }
        }
        
        # Test data fetching
        try:
            products = fetch_products_from_database()
            product_counts = {cat: len(prods) for cat, prods in products.items()}
            health_status["product_data"] = {
                "available": True,
                "categories": list(products.keys()),
                "total_products": sum(product_counts.values()),
                "breakdown": product_counts
            }
        except Exception as e:
            health_status["product_data"] = {
                "available": False,
                "error": str(e)
            }
            health_status["status"] = "degraded"
        
        # Determine overall status
        if not MONGODB_CONNECTED:
            health_status["status"] = "degraded"
            health_status["message"] = "Running on local fallback data due to MongoDB connection issues"
        else:
            health_status["message"] = "All systems operational"
            
        status_code = 200 if health_status["status"] in ["healthy", "degraded"] else 503
        return jsonify(health_status), status_code
        
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "error": str(e),
            "timestamp": json.dumps({"timestamp": "now"}, default=str)
        }), 503

@app.route('/images/<filename>')
def serve_image(filename):
    """Serve images from the static/images directory"""
    try:
        response = make_response(send_from_directory('static/images', filename))
        # Allow all origins for Vercel deployment
        if os.getenv('VERCEL'):
            response.headers['Access-Control-Allow-Origin'] = '*'
        else:
            response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
        response.headers['Access-Control-Allow-Methods'] = 'GET'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        response.headers['Cache-Control'] = 'public, max-age=3600'  # Cache for 1 hour
        return response
    except Exception as e:
        print(f"❌ Error serving image {filename}: {str(e)}")
        return jsonify({"error": "Image not found"}), 404

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
    # For serverless, just return success - client will handle state reset
    if os.getenv('VERCEL'):
        return jsonify({"message": "Session reset successfully"})
    
    # Clear all session data for local development
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
        
        # For Vercel deployment, use simplified chat without sessions
        if os.getenv('VERCEL'):
            return jsonify({
                "reply": "Hello! I'm your VisionTech assistant. Due to current deployment constraints, I'm in simplified mode. Please visit our products page to explore our latest electronics!",
                "isHtml": False
            })
        
        # Get the instance ID from the request
        instance_id = request.json.get("instance_id", "default")
        print(f"👤 Request from instance: {instance_id}")
        
        # Get chat state from request (client-side state management for serverless)
        chat_state = request.json.get("chat_state", {})
        
        # Check if this is the first message of a new conversation
        is_first_message = request.json.get("new_chat", False)
        
        # Initialize chat data if it doesn't exist or is a new chat
        if not chat_state or is_first_message:
            chat_data = {
                "chat_stage": "detect_category",
                "selected_category": "",
                "recommended_products": [],
                "previously_shown_products": [],
                "rejected_products": [],
                "chosen_product": None,
                "conversation_history": [],
                "turn_count": 0,
                "has_use_case": False,
                "has_budget": False,
                "has_shown_initial_products": False
            }
            print(f"✅ Initialized new chat state for instance: {instance_id}")
        else:
            chat_data = chat_state
            print(f"✅ Using existing chat state for instance: {instance_id}")
        
        # Step 1: Detect Product Category
        if chat_data["chat_stage"] == "detect_category":
            detected_category = detect_product_category(user_message)
            if not detected_category:
                return jsonify({"reply": "Could you clarify? Are you looking for a Phone, Laptop, TV, Gaming product, or Audio equipment?"})
            
            # Category detected - save it and move to Gemini conversation
            chat_data["selected_category"] = detected_category
            chat_data["chat_stage"] = "gemini_conversation"
            chat_data["turn_count"] += 1

            chat_data["conversation_history"].append({"role": "user", "message": user_message})
            session[session_key] = chat_data
            
            # Send to Gemini for natural conversation
            structured_query = {
                "category": detected_category,
                "user_message": user_message,
                "conversation_history": chat_data["conversation_history"],
                "is_initial": True
            }
            
            # Get products from database
            structured_products = fetch_products_from_database()
            
            # Use the existing send_followup_to_gemini with modified query
            gemini_response = send_followup_to_gemini(structured_query)
            
            # Handle response
            if "recommended_products" in gemini_response and gemini_response["recommended_products"]:
                chat_data["recommended_products"] = gemini_response["recommended_products"]
                chat_data["has_shown_initial_products"] = True
                session[session_key] = chat_data
            
            # Add to conversation history
            chat_data["conversation_history"].append({"role": "assistant", "message": gemini_response.get("message", "")})
            session[session_key] = chat_data
            
            # Convert markdown to HTML in the message
            message = gemini_response.get("message", "Let me help you find the perfect product.")
            converted_message = convert_markdown_to_html(message)
            
            # Return response with HTML formatting
            if "isHtml" in gemini_response and gemini_response["isHtml"]:
                return jsonify({
                    "reply": converted_message,
                    "isHtml": True
                })
            else:
                # Even if Gemini didn't mark it as HTML, we still want to render the converted markdown
                return jsonify({
                    "reply": converted_message,
                    "isHtml": True  # Always set to True since we're converting markdown
                })

        # Step 2: All subsequent messages go directly to Gemini
        elif chat_data["chat_stage"] == "gemini_conversation":
            # Add message to conversation history
            chat_data["conversation_history"].append({"role": "user", "message": user_message})
            
            # Update tracking based on current message
            if not chat_data["has_use_case"]:
                use_case_keywords = ['gaming', 'work', 'business', 'entertainment', 'study', 
                                    'photo', 'camera', 'travel', 'basic', 'everyday', 'professional']
                if any(keyword in user_message.lower() for keyword in use_case_keywords):
                    chat_data["has_use_case"] = True

            if not chat_data["has_budget"]:
                if any(char.isdigit() for char in user_message) or any(term in user_message.lower() 
                    for term in ['budget', 'cheap', 'expensive', 'afford', 'price', 'cost', '$']):
                    chat_data["has_budget"] = True

            # Check for explicit show requests
            show_keywords = ["show me", "what do you have", "let me see", "display", "list", "options", "available"]
            explicit_show_request = any(keyword in user_message.lower() for keyword in show_keywords)
            
            # Prepare query for Gemini with full context
            conversational_query = {
                "category": chat_data["selected_category"],
                "user_message": user_message,
                "conversation_history": chat_data["conversation_history"],
                "recommended_products": chat_data.get("recommended_products", []),
                "rejected_products": chat_data.get("rejected_products", []),
                "is_followup": True,
                "is_gathering_requirements": not chat_data["has_shown_initial_products"],
                "turn_count": chat_data["turn_count"],
                "has_use_case": chat_data["has_use_case"],
                "has_budget": chat_data["has_budget"],
                "explicit_show_request": explicit_show_request,
                "should_show_products": (chat_data["has_use_case"] and chat_data["has_budget"] and 
                                        not chat_data["has_shown_initial_products"]) or
                                    chat_data["turn_count"] >= 2 or
                                    explicit_show_request or
                                    (chat_data["selected_category"] in ["gaming", "audio"] and 
                                     not chat_data["has_shown_initial_products"])
            }

            # Increment turn count
            chat_data["turn_count"] += 1
            
            # Get products from database
            structured_products = fetch_products_from_database()
            conversational_query["all_products"] = structured_products.get(chat_data["selected_category"], [])
            
            # Send to existing followup Gemini function
            gemini_response = send_followup_to_gemini(conversational_query)
            
            # Handle category switching
            if gemini_response.get("category_switch"):
                new_category = gemini_response.get("new_category")
                print(f"🔄 Processing category switch to: {new_category}")
                
                # Update session with new category and reset relevant data
                chat_data["selected_category"] = new_category
                chat_data["recommended_products"] = []
                chat_data["rejected_products"] = []
                chat_data["chosen_product"] = None
                chat_data["has_shown_initial_products"] = False
                chat_data["has_use_case"] = False
                chat_data["has_budget"] = False
                chat_data["turn_count"] = 1  # Reset turn count but keep conversation history
                
                # Create a new conversational query for the switched category
                new_conversational_query = {
                    "category": new_category,
                    "user_message": user_message,
                    "conversation_history": chat_data["conversation_history"],
                    "recommended_products": [],
                    "rejected_products": [],
                    "is_followup": True,
                    "is_gathering_requirements": True,  # Start gathering requirements for new category
                    "turn_count": 1,
                    "has_use_case": False,
                    "has_budget": False,
                    "explicit_show_request": False,
                    "should_show_products": False,  # Don't show products immediately
                    "category_switched": True  # Flag to indicate this is a category switch
                }
                
                # Get products for the new category
                structured_products = fetch_products_from_database()
                new_conversational_query["all_products"] = structured_products.get(new_category, [])
                
                # Send to Gemini with the new category context
                new_gemini_response = send_followup_to_gemini(new_conversational_query)
                
                # Update session with the new response
                chat_data["conversation_history"].append({"role": "user", "message": user_message})
                chat_data["conversation_history"].append({"role": "assistant", "message": new_gemini_response.get("message", "")})
                session[session_key] = chat_data
                
                # Return the new category response
                message = new_gemini_response.get("message", "Let me help you with that new category.")
                converted_message = convert_markdown_to_html(message)
                
                return jsonify({
                    "reply": converted_message,
                    "isHtml": True
                })
            
            # Update recommended products if new ones are provided
            if "recommended_products" in gemini_response and gemini_response["recommended_products"]:
                chat_data["recommended_products"] = gemini_response["recommended_products"]
                chat_data["has_shown_initial_products"] = True
            
            if "alternative_products" in gemini_response and gemini_response["alternative_products"]:
                chat_data["recommended_products"] = gemini_response["alternative_products"]
                chat_data["has_shown_initial_products"] = True
            
            # Track rejected products if user doesn't like recommendations
            dislike_phrases = ["don't like", "dont like", "not interested", "none of these", 
                            "something else", "other options", "too expensive", "cheaper"]
            if any(phrase in user_message.lower() for phrase in dislike_phrases):
                for product in chat_data.get("recommended_products", []):
                    product_name = product.get("name")
                    if product_name and product_name not in chat_data["rejected_products"]:
                        chat_data["rejected_products"].append(product_name)
            
            # Add response to history
            chat_data["conversation_history"].append({"role": "assistant", "message": gemini_response.get("message", "")})
            session[session_key] = chat_data
            
            # Convert markdown to HTML in the message
            message = gemini_response.get("message", "Let me help you with that.")
            converted_message = convert_markdown_to_html(message)
            
            # Return response with HTML formatting
            if "isHtml" in gemini_response and gemini_response["isHtml"]:
                return jsonify({
                    "reply": converted_message,
                    "isHtml": True
                })
            else:
                # Even if Gemini didn't mark it as HTML, we still want to render the converted markdown
                return jsonify({
                    "reply": converted_message,
                    "isHtml": True  # Always set to True since we're converting markdown
                })
            
    except Exception as e:
        print(f"❌ ERROR in /chat: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "An internal server error occurred while processing your request."}), 500

@app.route('/api/products', methods=['GET'])
def api_products():
    try:
        # Get query parameters
        category = request.args.get('category', 'all').lower()
        brand = request.args.get('brand', '').lower()
        search = request.args.get('search', '').strip()
        
        # Fetch products from database with fallback
        structured_products = fetch_products_from_database()
        
        # Handle empty database case
        if not structured_products:
            print("⚠️ No products found from database or local fallback")
            return jsonify([])
            
        # Prepare result array
        result = []
        
        # If category is "all", gather products from all categories
        if category == 'all':
            for cat, products in structured_products.items():
                for product in products:
                    product['category'] = cat  # Add category to each product
                    # Fix image path to include /images/ prefix
                    if 'image' in product and not product['image'].startswith('/'):
                        product['image'] = f"/images/{product['image']}"
                    result.append(product)
        else:
            # Get products from the specific category
            result = structured_products.get(category, [])
            # Add category to each product and fix image paths
            for product in result:
                product['category'] = category
                # Fix image path to include /images/ prefix
                if 'image' in product and not product['image'].startswith('/'):
                    product['image'] = f"/images/{product['image']}"
        
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
                product_features = ' '.join(product.get('features', [])).lower()  # Changed from specifications to features
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
        
        print(f"✅ API returning {len(result)} products for category '{category}'")
        return jsonify(result)
    
    except Exception as e:
        print(f"❌ Error in /api/products: {str(e)}")
        import traceback
        traceback.print_exc()
        # Return an empty array with error info in headers for debugging
        response = jsonify([])
        response.headers['X-Error'] = str(e)
        return response, 200  # Return 200 to avoid frontend errors, but with empty array


@app.route('/api/product/<product_id>', methods=['GET'])
def api_product_by_id(product_id):
    """
    Get a single product by its ID
    """
    try:
        print(f"🔍 Looking for product with ID: {product_id}")
        
        # Fetch all products from database
        structured_products = fetch_products_from_database()
        
        if not structured_products:
            return jsonify({"error": "No products found"}), 404
        
        # Search through all categories for the product with matching ID
        for category, products in structured_products.items():
            for i, product in enumerate(products):
                # Generate ID the same way as in /api/products
                name_slug = re.sub(r'[^a-z0-9]', '-', product['name'].lower())
                name_slug = name_slug.strip('-')
                name_slug = re.sub(r'-+', '-', name_slug)
                generated_id = f"{i+1}-{name_slug}"
                
                if generated_id == product_id:
                    # Add category and ID to the product
                    product['category'] = category
                    product['id'] = generated_id
                    # Fix image path to include /images/ prefix
                    if 'image' in product and not product['image'].startswith('/'):
                        product['image'] = f"/images/{product['image']}"
                    print(f"✅ Found product: {product['name']}")
                    return jsonify(product)
        
        print(f"❌ Product not found with ID: {product_id}")
        return jsonify({"error": "Product not found"}), 404
        
    except Exception as e:
        print(f"❌ Error in /api/product/{product_id}: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500





@app.route('/test-mongodb', methods=['GET'])
def test_mongodb():
    """Test MongoDB connection step by step"""
    try:
        import pymongo
        
        # Step 1: Check environment variable
        mongodb_uri = os.getenv('MONGODB_URI')
        if not mongodb_uri:
            return jsonify({
                "step": 1,
                "status": "FAILED",
                "error": "MONGODB_URI environment variable not found",
                "env_vars": {k: v for k, v in os.environ.items() if 'MONGO' in k or 'VERCEL' in k}
            })
        
        # Step 2: Try to create client
        try:
            test_client = pymongo.MongoClient(mongodb_uri, serverSelectionTimeoutMS=5000)
            
            # Step 3: Test connection
            test_client.admin.command('ping')
            
            # Step 4: Access database
            test_db = test_client['test']  # Using 'test' database
            
            # Step 5: List databases
            db_names = test_client.list_database_names()
            
            # Step 6: Check if our database exists
            available_dbs = [db for db in db_names if 'cluster' in db.lower() or 'test' in db.lower() or 'product' in db.lower()]
            
            # Step 7: Try to access collections in each database
            db_info = {}
            for db_name in db_names[:5]:  # Limit to first 5 databases
                try:
                    db_collections = test_client[db_name].list_collection_names()
                    db_info[db_name] = db_collections
                except Exception as e:
                    db_info[db_name] = f"Error: {str(e)}"
            
            test_client.close()
            
            return jsonify({
                "step": "SUCCESS",
                "status": "MongoDB connection working",
                "mongodb_uri_length": len(mongodb_uri),
                "databases": db_names,
                "available_dbs": available_dbs,
                "db_collections": db_info,
                "ping_successful": True
            })
            
        except Exception as db_error:
            return jsonify({
                "step": 2,
                "status": "FAILED", 
                "error": f"Database connection failed: {str(db_error)}",
                "mongodb_uri_length": len(mongodb_uri),
                "mongodb_uri_preview": mongodb_uri[:50] + "..." if len(mongodb_uri) > 50 else mongodb_uri
            })
            
    except Exception as e:
        return jsonify({
            "step": 0,
            "status": "FAILED",
            "error": f"General error: {str(e)}"
        })

@app.route('/debug-db', methods=['GET'])
def debug_db():
    try:
        # Debug environment variables
        mongodb_uri = os.getenv('MONGODB_URI')
        vercel_env = os.getenv('VERCEL')
        
        debug_info = {
            "mongodb_uri_exists": bool(mongodb_uri),
            "mongodb_uri_length": len(mongodb_uri) if mongodb_uri else 0,
            "vercel_env": vercel_env,
            "client_status": str(type(client)),
            "db_status": str(type(db)),
            "collection_status": str(type(collection))
        }
        
        if not mongodb_uri:
            return jsonify({
                "status": "error",
                "error": "MONGODB_URI environment variable not found",
                "debug": debug_info
            })
        
        # Check if we can connect to MongoDB
        if client is None:
            return jsonify({
                "status": "error", 
                "error": "MongoDB client is None",
                "debug": debug_info
            })
            
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
    and more synonyms/variations, with improved handling of short inputs.
    """
    # Convert user message to lowercase and clean whitespace
    user_message_lower = user_message.lower().strip()
    
    # Expanded keywords for better matching including all product categories
    # Priority order: More specific terms should be checked first
    category_keywords = {
        "laptop": ["laptop", "macbook", "notebook", "ultrabook", "gaming laptop",
                   "computer", "pc", "portable computer", "lapto", "latop", "laptp", "labtop"],
        "phone": ["phone", "mobile", "smartphone", "iphone", "samsung", "android", 
                  "cell", "cellular", "fone", "celfone", "handset"],
        "tv": ["tv", "television", "oled", "4k", "smart tv", "qled", "lcd", 
               "tele", "screen", "display", "monitor"],
        "audio": ["audio", "headphones", "earphones", "speaker", "speakers", "earbuds", 
                  "headset", "sound", "music", "bluetooth speaker", "gaming headphone", "gaming headphones"],
        "gaming": ["gaming", "game", "console", "ps5", "xbox", "playstation", "nintendo", 
                   "switch", "gaming chair", "gaming pc", "gaming console"]
    }

    # First check for explicit mentions with exact matching
    for category, keywords in category_keywords.items():
        if any(keyword in user_message_lower.split() for keyword in keywords):
            return category
    
    # For very short inputs (3 chars or less), require higher similarity
    is_short_input = any(len(word) <= 3 for word in user_message_lower.split())
    
    # Try partial matching for typo tolerance, with stricter rules for short inputs
    for category, keywords in category_keywords.items():
        for keyword in keywords:
            # For short inputs, only allow exact matches
            if is_short_input:
                # Only match short inputs if they exactly match a keyword
                # (e.g., "tv" matches "tv" but "la" doesn't match "laptop")
                if user_message_lower in keywords:
                    return category
            else:
                # For longer inputs, use Levenshtein distance with adaptive threshold
                # The longer the word, the more tolerance for typos
                max_distance = min(2, max(1, len(keyword) // 4))
                if any(levenshtein_distance(word, keyword) <= max_distance for word in user_message_lower.split()):
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

        ### **CRITICAL PRODUCT RESTRICTION:**
        **EXTREMELY IMPORTANT**: You MUST ONLY recommend products that are available in the product list above. You are STRICTLY FORBIDDEN from recommending any products not in this database. NEVER mention products like "Xbox Series X", "ASUS ROG Phone 7", "Nubia RedMagic 8 Pro" or any other products not explicitly listed above. If none of our products match the user's specific request, explain what we do have available instead.

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

def send_followup_to_gemini(query_data):
    """
    Enhanced follow-up handler with better product memory to avoid contradictions.
    Now includes category switching capability.
    """
    recommended_products = query_data.get("recommended_products", [])
    user_question = query_data.get("user_message", "")
    category = query_data.get("category", "")
    specifically_mentioned_products = query_data.get("specifically_mentioned_products", [])
    task_suitability_check = query_data.get("task_suitability_check", False)
    provide_detailed_info = query_data.get("provide_detailed_info", False)
    focus_product = query_data.get("focus_product", "")
    
    # Get rejected products
    rejected_products = query_data.get("rejected_products", [])
    
    # CATEGORY SWITCHING LOGIC
    # Check if user is requesting a different product category
    detected_new_category = detect_product_category(user_question)
    if detected_new_category and detected_new_category.lower() != category.lower():
        # Check for category switching indicators to avoid false positives
        switching_indicators = [
            "actually", "instead", "now i want", "i want a", "looking for a", 
            "show me", "need a", "switch to", "change to", "rather have",
            "prefer a", "get a", "buy a", "purchase a"
        ]
        
        user_lower = user_question.lower()
        has_switching_indicator = any(indicator in user_lower for indicator in switching_indicators)
        
        # Also check if it's a direct category request (like "laptop" as a standalone)
        is_direct_category_request = user_question.strip().lower() in [
            "laptop", "laptops", "phone", "phones", "tv", "tvs", "audio", "gaming"
        ]
        
        # Check for comparison requests across categories (e.g., "laptop vs phone")
        is_cross_category_comparison = any(
            cat1 in user_lower and cat2 in user_lower 
            for cat1 in ["laptop", "phone", "tv", "audio", "gaming"]
            for cat2 in ["laptop", "phone", "tv", "audio", "gaming"]
            if cat1 != cat2
        )
        
        if has_switching_indicator or is_direct_category_request:
            print(f"🔄 Category switch detected: {category} → {detected_new_category}")
            return {
                "category_switch": True,
                "new_category": detected_new_category,
                "restart_conversation": True
            }
        elif is_cross_category_comparison:
            # For cross-category comparisons, explain that we focus on one category at a time
            return {
                "message": f"I can help you with {detected_new_category}s! However, I focus on one product category at a time to give you the best recommendations. Would you like me to show you {detected_new_category} options, or would you prefer to continue with {category}s?"
            }
    
    # Skip the check if we're still gathering requirements
    if not query_data.get("is_initial", False) and not query_data.get("is_gathering_requirements", False) and not recommended_products:
        return {"message": "I don't have any recommendations to discuss. Let's start over with your product search."}
    
     # For initial queries, we need to get all products from the category
    # if query_data.get("is_initial", False):
    #     structured_products = fetch_products_from_database()
    #     all_products = structured_products.get(category, [])
    # else:
    #     all_products = query_data.get("all_products", [])
    
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
    
    # Add rejected products to context
    if rejected_products:
        context.append(f"User has PREVIOUSLY REJECTED these products: {', '.join(rejected_products)}")
        # Add the latest user query context (for Gemini to decide if they're asking for rejected items again)
        context.append(f"User's LATEST QUERY: \"{user_question}\"")
    
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
    
    # Special instructions for detailed product information
    if provide_detailed_info and focus_product:
        suitability_check_instructions = f"""
        IMPORTANT: The user wants more information about {focus_product}.
        Focus ONLY on providing detailed information about this product.
        Highlight its features and benefits for the user's specific needs.
        Do NOT contradict your recommendation or suggest it might not be suitable.
        NEVER suggest that a product you recommended is not a good choice.
        """
    
    # Prepare the products context
    context_products = {
        "recommended": recommended_products,
        "all_available": all_products,
        "specifically_mentioned": specifically_mentioned_products,
        "rejected_products": rejected_products  # Include rejected products
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
        You are a digital shopping assistant helping a customer find the perfect {category}.
        
        {"This is the initial conversation. The customer is interested in a " + category + ". " + ("For gaming and audio categories with limited inventory, show available products after understanding basic needs." if category in ["gaming", "audio"] else "Start by understanding their needs, budget, and preferences naturally.") if query_data.get("is_initial") else "Continue the conversation naturally."}

        ### **CONVERSATION HISTORY:**
        {json.dumps(query_data.get("conversation_history", []), indent=2)}

        ### **CONVERSATION CONTEXT:**
        {context_text}

        ### **PRODUCT CONTEXT:**
        ```json
        {context_json}
        ```

        ### **USER'S FOLLOW-UP QUESTION:**
        "{user_question}"
        
        {f'''### **CATEGORY SWITCH DETECTED:**
The user has switched to {category}s. This is a fresh start for this new category. You need to gather the essential information:
1. What they'll primarily use the {category} for (purpose/use case)
2. Their budget range  
3. Any specific features they're looking for

Respond naturally to their question while beginning this information gathering process. Don't show products until you have at least their primary use case.''' if query_data.get("category_switched") else ""}

        {suitability_check_instructions}

        ### **CRITICAL PRODUCT RESTRICTION:**
        **EXTREMELY IMPORTANT**: You MUST ONLY recommend, suggest, or mention products that are available in the "all_available" products list above. You are STRICTLY FORBIDDEN from recommending any products that are not in this database. If a user asks for a specific product type and none exist in the database, politely explain that you don't currently have that type of product in stock and ask if they'd like to see what similar alternatives are available. NEVER invent, suggest, or recommend products like "Xbox Series X", "ASUS ROG Phone 7", "Nubia RedMagic 8 Pro" or any other products not explicitly listed in the database.

        ### **CRITICAL CONSISTENCY RULES:**
        1. ONLY exclude rejected products if the user's latest query is asking for alternatives or cheaper options.
        2. If the user's latest query is explicitly asking for products of a specific type (e.g., gaming laptops, camera phones), INCLUDE all suitable products matching that type, including previously rejected ones.
        3. If a user is asking for cheaper alternatives, ensure you ONLY recommend products that are AT LEAST 15% less expensive than what you previously showed.
        4. Maintain consistency in your recommendations - don't contradict previous statements about product suitability.
        5. When the user is explicitly asking for a specific category of products, like "purely designed for gaming" laptops, prioritize products specifically made for that purpose - even if they were previously rejected.
        6. Use your judgment to determine if the user's latest query indicates they want to reconsider previously rejected products.
        7. If the user asks "tell me more about X", focus ONLY on providing detailed information about X.
        8. When the user asks about a product you recommended, enthusiastically explain why it's suitable for their needs based on their requirements.
        9. ALWAYS end your response with a relevant follow-up question UNLESS the user has clearly stated they're satisfied (e.g., "thank you" or "I'll add to cart").
        10. If a user asks for cheaper options, ensure you ONLY recommend products that are substantially cheaper.

        ### **CONVERSATION MANAGEMENT:**
        1. Only end a conversation if the user explicitly indicates they are done (saying "thank you", "that's all", etc.).
        2. Otherwise, keep the conversation going by answering their questions completely and asking a relevant follow-up.
        3. If a user shows interest in a specific product, provide detailed information about that product.
        4. A typical informational response should include: performance details, display quality, value proposition for their needs.
        5. NEVER end with "I'm glad I could help you find the right product" UNLESS the user has clearly indicated they've made a decision.

        ### **PRODUCT DISPLAY RULES:**
        1. Information Gathering Phase (DO NOT show products yet):
        - First 2-3 messages should focus on understanding user needs
        - Ask about: use case/purpose, budget, any specific preferences
        - Respond with questions only, no product recommendations yet
        - Keep track of what information you still need to gather

        2. Product Display Triggers (MUST show products):
        - After gathering basic requirements (use case + budget), ALWAYS show 2-3 product cards
        - When user says: "show me", "what are my options", "what do you recommend", "suggestions"
        - When user asks for: "alternatives", "other options", "something else", "cheaper", "different"
        - When comparing products: Always show the products being compared as cards
        - Use "recommended_products" or "alternative_products" in JSON response

        3. Text-Only Responses (NO product cards):
        - When answering general questions about features or technology
        - When user asks for more details about a single already-shown product
        - During the initial information gathering phase
        - When explaining differences or providing educational information

        4. The 3-Turn Rule:
        - Turn 1: Identify category and ask about primary use case
        - Turn 2: Ask about budget range
        - Turn 3: Ask about any specific features/preferences (optional if enough info)
        - Turn 4 or when sufficient info gathered: MUST display product recommendations

        5. Information Tracking:
        - Track gathered info: has_use_case, has_budget, has_preferences
        - Once you have use_case + budget, you MUST show products on next response
        - If user provides all info in one message, show products immediately

        ### **CURRENT CONVERSATION STATE:**
        - Turn number: {query_data.get("turn_count", 0)}
        - Has use case: {query_data.get("has_use_case", False)}
        - Has budget: {query_data.get("has_budget", False)}
        - Should show products: {query_data.get("should_show_products", False)}
        - Explicit show request: {query_data.get("explicit_show_request", False)}

        ### **DECISION LOGIC:**
        - If should_show_products is True, you MUST include products in recommended_products or alternative_products
        - If turn_count >= 3 and no products shown yet, MUST show products
        - If has_use_case and has_budget are both True, MUST show products on this response
        - SPECIAL RULE: For gaming and audio categories with limited products, show products after turn 1 even without complete budget info
        - GAMING/AUDIO OVERRIDE: If category is gaming or audio and user mentions the category type (console, headphones), immediately show the available products since inventory is limited
        - CRITICAL: If user explicitly asks to "show me", "what do you have", "let me see", or similar display requests, IMMEDIATELY show products regardless of other conditions
        - MANDATORY: If explicit_show_request is True, you MUST show products in your response using recommended_products or alternative_products

        ### INSTRUCTIONS:
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

        ### **PRODUCT DETAIL FORMATTING GUIDELINES:**
        When a user asks for more information about a specific product (e.g., "tell me more about X", "more details on X", "what about X"):

        1. Use HTML formatting to create a well-structured response
        2. Start with a brief introduction: "Here's more about the [Product Name] ([Price]):"
        3. Organize information into logical sections using <h3> headers
        4. Use bullet points (<ul> and <li>) for specifications and features
        5. Bold (<strong>) important specification names (e.g., Processor:, Display:, etc.)
        6. Choose sections that make sense for the specific product and user's needs
        7. Include a paragraph explaining how well the product fits the user's stated requirements
        8. Keep the tone informative but conversational
        9. End with a relevant follow-up question based on the conversation context

        Example structure (adapt as needed):
        - Use sections like "Key Features", "Specifications", "Performance", etc.
        - For detailed specs, use format: <li><strong>Feature:</strong> Description</li>
        - Include practical information relevant to the user's use case
        - Don't include sections that aren't relevant to the product or user's needs

        ### **COMPARISON REQUESTS:**
        When a user asks to compare products (using words like "compare", "vs", "versus", "difference between"), 
        follow these CRITICAL rules:
        
        1. Set "is_comparison": true
        2. Put the comparison data in the "comparison_data" field ONLY - NOT in the message
        3. Do NOT include raw JSON or comparison_data text in your message
        4. Your message should contain only your analysis and recommendations in natural language
        
        CRITICAL: For comparisons, your "message" field should NEVER contain JSON data or "comparison_data" text.
        
        Example comparison response structure:
        "is_comparison": true,
        "comparison_data": {{
            "products": ["Product Name 1", "Product Name 2"],
            "features": {{
                "Price": ["$X", "$Y"],
                "Processor": ["Spec 1", "Spec 2"],
                "RAM": ["X GB", "Y GB"],
                "Display": ["X inches", "Y inches"],
                "Battery": ["X hours", "Y hours"]
            }}
        }},
        "message": "Here's a comparison of these two phones. The Xiaomi offers better value for gaming performance, while the Nothing Phone provides a more premium design. Which aspect is more important to you?"

        ### **RESPONSE FORMAT:**
        ```json
        {{
          "response_type": "recommendation",
          "message": "Your detailed response to the user's question, ending with a follow-up question unless they're clearly done",
          "is_comparison": false,  // Set to true if this is a comparison request
          "comparison_data": null,  // Include comparison data structure if is_comparison is true
          "final_choice": null,  // If making a final recommendation, include the full product object here
          "alternative_products": [],  // If suggesting alternatives, include them here
          "conversation_complete": false,  // Set to true ONLY if user has clearly indicated they're done with the conversation
          "include_rejected_products": false  // Set to true if user's query indicates they want to see previously rejected products
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
        # Try standard JSON extraction first
        json_match = re.search(r'```json\s*({.*?})\s*```', generated_text, re.DOTALL)
        
        if not json_match:
            print("❌ Failed to extract JSON from follow-up Gemini response")
            print(f"Response text: {generated_text[:200]}...")  # Print first 200 chars for debugging
            
            # Try a more lenient pattern without language identifier
            json_match = re.search(r'```\s*({.*?})\s*```', generated_text, re.DOTALL)
            
            if not json_match:
                # Try a last resort pattern to find any JSON object
                json_match = re.search(r'({[\s\S]*"message"[\s\S]*})', generated_text)
                
            if not json_match:
                return {"message": "I couldn't properly analyze your question about these products. Could you rephrase it?"}

        parsed_json = json.loads(json_match.group(1).strip())
        # Check if this is a comparison response
        if parsed_json.get("is_comparison") and parsed_json.get("comparison_data"):
            # Generate the comparison table
            comparison_table = generate_comparison_table(parsed_json["comparison_data"])
            
            # Get the original message and clean it of any leaked comparison_data
            original_message = parsed_json.get("message", "Here's a detailed comparison:")
            
            # Remove any accidentally included comparison_data JSON from the message
            # Remove patterns like "comparison_data": { ... }
            cleaned_message = re.sub(r'"comparison_data":\s*{[^}]*}[^}]*}', '', original_message)
            # Remove patterns like { "products": [...], "features": {...} }
            cleaned_message = re.sub(r'{\s*"products":\s*\[.*?\],\s*"features":\s*{.*?}\s*}', '', cleaned_message, flags=re.DOTALL)
            # Remove any remaining JSON-like structures
            cleaned_message = re.sub(r'"[^"]*":\s*[\[\{][^\]\}]*[\]\}]', '', cleaned_message)
            # Clean up extra whitespace and newlines
            cleaned_message = re.sub(r'\n\s*\n', '\n', cleaned_message.strip())
            
            # If the message was mostly comparison data, provide a default
            if len(cleaned_message.strip()) < 20:
                cleaned_message = "Here's a detailed comparison of these products:"
            
            # Insert the comparison table
            full_message = f"{cleaned_message}\n\n{comparison_table}"
            
            # Update the response
            parsed_json["message"] = full_message
            parsed_json["isHtml"] = True
        
        # Process recommended products first (for category switching and initial recommendations)
        if "recommended_products" in parsed_json and parsed_json["recommended_products"]:
            recommended = parsed_json["recommended_products"]
            
            # Generate HTML content for recommended products
            recommended_html = ""
            for product in recommended:
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
                recommended_html += f"""
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
                    style="color: #000000; text-decoration: none; display: inline-block; padding: 8px 12px; background: #f0f0f0; border-radius: 4px; font-size: 14px; flex: 1; text-align: center;"
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
            original_message = parsed_json.get("message", "Here are some great options for you:")
            parsed_json["message"] = f"{original_message}\n\n{recommended_html}"
            parsed_json["isHtml"] = True
        
        # Process alternative products recommendations
        if "alternative_products" in parsed_json and parsed_json["alternative_products"]:
            alternatives = parsed_json["alternative_products"]
            
            # Only filter rejected products if not explicitly asking for that category
            if rejected_products and not parsed_json.get("include_rejected_products", False):
                rejected_lower = [name.lower() for name in rejected_products if name]
                alternatives = [product for product in alternatives 
                                if product.get("name", "").lower() not in rejected_lower]
            
            # Filter by price if user mentioned products being too expensive
            if "too expensive" in user_question.lower() or "cheaper" in user_question.lower():
                # Get max price of recommended products to compare against
                recommended_prices = [get_price_number(p.get("price", "")) for p in recommended_products]
                max_recommended_price = max(recommended_prices) if recommended_prices else float('inf')
                
                # Only keep alternatives that are cheaper than the most expensive recommended product
                cheaper_alternatives = []
                for product in alternatives:
                    product_price = get_price_number(product.get("price", ""))
                    # Only keep products at least 15% cheaper
                    if product_price < max_recommended_price * 0.85:
                        cheaper_alternatives.append(product)
                
                # Replace alternatives with cheaper ones only
                if cheaper_alternatives:
                    alternatives = cheaper_alternatives
            
            # Update parsed_json with filtered alternatives
            parsed_json["alternative_products"] = alternatives
            
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
                    style="color: #000000; text-decoration: none; display: inline-block; padding: 8px 12px; background: #f0f0f0; border-radius: 4px; font-size: 14px; flex: 1; text-align: center;"
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
            
            # Check if the final choice is not in rejected products, unless they want to see rejected products
            if rejected_products and name in rejected_products and not parsed_json.get("include_rejected_products", False):
                # Find an alternative if the chosen product was rejected
                alternative_product = next((p for p in all_products 
                                           if p.get("name") not in rejected_products), None)
                if alternative_product:
                    product = alternative_product
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
                  style="color: #000000; text-decoration: none; display: inline-block; padding: 8px 12px; background: #f0f0f0; border-radius: 4px; font-size: 14px; flex: 1; text-align: center;"
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
        
        # Validate all product recommendations against database
        if all_products:
            available_product_names = [p.get("name", "") for p in all_products]
            
            # Validate recommended_products
            if "recommended_products" in parsed_json and parsed_json["recommended_products"]:
                valid_recommended = [product for product in parsed_json["recommended_products"] 
                                   if product.get("name", "") in available_product_names]
                filtered_count = len(parsed_json["recommended_products"]) - len(valid_recommended)
                if filtered_count > 0:
                    print(f"⚠️ Filtered out {filtered_count} non-existent recommended products from followup")
                parsed_json["recommended_products"] = valid_recommended
            
            # Validate alternative_products  
            if "alternative_products" in parsed_json and parsed_json["alternative_products"]:
                valid_alternatives = [product for product in parsed_json["alternative_products"] 
                                    if product.get("name", "") in available_product_names]
                filtered_count = len(parsed_json["alternative_products"]) - len(valid_alternatives)
                if filtered_count > 0:
                    print(f"⚠️ Filtered out {filtered_count} non-existent alternative products from followup")
                parsed_json["alternative_products"] = valid_alternatives
            
            # Validate final_choice
            if "final_choice" in parsed_json and parsed_json["final_choice"]:
                if parsed_json["final_choice"].get("name", "") not in available_product_names:
                    print(f"⚠️ Filtered out non-existent final choice: {parsed_json['final_choice'].get('name', 'Unknown')}")
                    parsed_json["final_choice"] = None
        
        return parsed_json

    except Exception as e:
        print(f"❌ Exception in follow-up Gemini API call: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"message": "I encountered an error while processing your question. Could we try again?"}
    
def fetch_products_from_database():
    """
    Fetches all products from MongoDB with fallback to local JSON file.
    """
    # First try MongoDB if connected
    if MONGODB_CONNECTED and collection is not None:
        try:
            products_cursor = collection.find({}, {"_id": 0})
            structured_products = {}

            # Enhanced debug message
            print("🔍 Fetching products from MongoDB Atlas...")
            all_docs = list(products_cursor)
            print(f"📋 Found {len(all_docs)} documents in MongoDB")
            
            if len(all_docs) == 0:
                print("⚠️ No documents found in MongoDB, falling back to local data")
                return fetch_products_from_local()
                
            for i, doc in enumerate(all_docs):
                print(f"📄 Document {i+1}: category='{doc.get('category', 'NO CATEGORY')}', products={len(doc.get('products', []))}")

            for doc in all_docs:
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
                            # Use environment variable for base URL or fallback to localhost
                            base_url = os.getenv('FLASK_BASE_URL', 'http://localhost:5001')
                            image_url = f"{base_url}/images/{product_image}"
                        else:
                            # If no image in database, create a generic name based on brand and product
                            base_url = os.getenv('FLASK_BASE_URL', 'http://localhost:5001')
                            image_url = f"{base_url}/images/default-product.jpg"
                        
                        # Add to structured products
                        structured_products[category].append({
                            "name": product_name,
                            "price": f"${product_price}" if isinstance(product_price, (int, float)) else product_price,
                            "features": product_features,
                            "brand": product_brand,
                            "image": image_url  # Use the full URL path
                        })

            # Detailed summary debug
            product_counts = {cat: len(prods) for cat, prods in structured_products.items()}
            print(f"📦 Loaded products from MongoDB: {product_counts}")
            
            # Extra debug for gaming and audio
            if 'gaming' in structured_products:
                print(f"🎮 Gaming products: {[p['name'] for p in structured_products['gaming']]}")
            if 'audio' in structured_products:
                print(f"🔊 Audio products: {[p['name'] for p in structured_products['audio']]}")
            
            return structured_products

        except Exception as e:
            print(f"❌ MongoDB Error: {str(e)}")
            print("🔄 Falling back to local JSON data...")
            return fetch_products_from_local()
    else:
        print("🔄 Using local JSON data (MongoDB not connected)")
        return fetch_products_from_local()

def fetch_products_from_local():
    """
    Fallback function to load products from local JSON file and add missing categories.
    """
    try:
        print("📁 Loading products from local products.json...")
        
        # Load existing data
        with open('products.json', 'r') as f:
            data = json.load(f)
        
        structured_products = {}
        base_url = os.getenv('FLASK_BASE_URL', 'http://localhost:5001')
        
        # Process existing categories
        for item in data:
            category = item.get("category", "").strip().lower()
            if not category:
                continue
                
            if category not in structured_products:
                structured_products[category] = []
                
            if "products" in item and isinstance(item["products"], list):
                for sub_prod in item["products"]:
                    product_name = sub_prod.get("name", "").strip()
                    product_price = sub_prod.get("price", "N/A")
                    product_features = sub_prod.get("specifications", [])
                    product_brand = sub_prod.get("brand", "").strip()
                    product_image = sub_prod.get("image", "")
                    
                    if not product_name:
                        continue
                        
                    # Handle missing data
                    if product_price == "N/A" or product_price is None:
                        product_price = "Unknown Price"
                    if not product_brand:
                        product_brand = "Generic Brand"
                    
                    # Create image URL
                    if product_image:
                        image_url = f"{base_url}/images/{product_image}"
                    else:
                        image_url = f"{base_url}/images/default-product.jpg"
                    
                    structured_products[category].append({
                        "name": product_name,
                        "price": f"${product_price}" if isinstance(product_price, (int, float)) else product_price,
                        "features": product_features,
                        "brand": product_brand,
                        "image": image_url
                    })
        
        # Add missing gaming products
        if 'gaming' not in structured_products:
            structured_products['gaming'] = [
                {
                    "name": "Sony PlayStation 5 Console",
                    "brand": "Sony", 
                    "price": "$499.99",
                    "features": [
                        "Custom AMD Zen 2 8-core CPU running at 3.5GHz",
                        "Custom AMD RDNA 2 GPU with 10.28 TFLOPs",
                        "16GB GDDR6 RAM with 448GB/s memory bandwidth",
                        "825GB custom NVMe SSD with 5.5GB/s raw throughput",
                        "Support for 4K gaming at up to 120fps with ray tracing",
                        "Backwards compatibility with PlayStation 4 games",
                        "DualSense wireless controller with haptic feedback"
                    ],
                    "image": f"{base_url}/images/ps5.jpg"
                },
                {
                    "name": "Gaming Headset Stereo Surround Sound Gaming Headphones with Breathing RGB Light",
                    "brand": "OZEINO",
                    "price": "$29.99", 
                    "features": [
                        "50mm high-precision neodymium drivers for superior sound quality",
                        "Breathing RGB LED lights with 7 color variations",
                        "360-degree adjustable noise-canceling microphone",
                        "3.5mm universal compatibility (PC, PS4, PS5, Xbox One, Nintendo Switch)",
                        "Comfortable memory foam ear cushions for extended gaming sessions",
                        "Professional gaming-grade audio with virtual surround sound"
                    ],
                    "image": f"{base_url}/images/gamingheadphone.jpg"
                }
            ]
        
        # Add missing audio products
        if 'audio' not in structured_products:
            structured_products['audio'] = [
                {
                    "name": "Gaming Headset Pro with RGB Lighting",
                    "brand": "OZEINO",
                    "price": "$49.99",
                    "features": [
                        "7.1 Surround Sound for immersive gaming experience",
                        "Dynamic RGB lighting with multiple color modes", 
                        "Professional-grade noise canceling microphone",
                        "Ultra-comfortable memory foam padding",
                        "Compatible with PC, PS4, PS5, Xbox, Nintendo Switch",
                        "High-quality 50mm drivers for crystal clear audio"
                    ],
                    "image": f"{base_url}/images/headphone.jpg"
                }
            ]
        
        # Detailed summary
        product_counts = {cat: len(prods) for cat, prods in structured_products.items()}
        print(f"📦 Loaded products from local JSON: {product_counts}")
        
        return structured_products
        
    except Exception as e:
        print(f"❌ Error loading local JSON: {str(e)}")
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

def get_price_number(price_string):
    """Extract the numeric value from a price string."""
    if not price_string or not isinstance(price_string, str):
        return float('inf')  # Return infinity for missing prices
    
    print(f"💲 Extracting price from: {price_string}")
    
    # Remove currency symbols and any non-numeric characters except decimal point
    numeric_part = re.sub(r'[^\d.]', '', price_string)
    try:
        price = float(numeric_part)
        print(f"💲 Extracted price: {price}")
        return price
    except ValueError:
        print(f"❌ Failed to extract price from: {price_string}")
        return float('inf')  # Return infinity for invalid formats

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

# Serve React App
@app.route('/')
def serve_react():
    return send_from_directory(app.static_folder, 'index.html')

@app.errorhandler(404)
def not_found(e):
    # Serve React app for any route not handled by Flask
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)