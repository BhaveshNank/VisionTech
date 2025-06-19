#!/usr/bin/env python3
"""
MongoDB Connection Troubleshooting Script
This script helps diagnose and fix MongoDB Atlas SSL connection issues.
"""

import os
import ssl
import certifi
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_mongodb_connection():
    """Test different MongoDB connection configurations"""
    
    MONGODB_URI = os.getenv('MONGODB_URI')
    if not MONGODB_URI:
        print("❌ MONGODB_URI not found in environment variables")
        return False
    
    print(f"🔍 Testing MongoDB connection to: {MONGODB_URI[:50]}...")
    
    # Test configurations in order of preference
    configs = [
        {
            "name": "Standard SSL with cert verification",
            "params": {
                "tls": True,
                "tlsCAFile": certifi.where(),
                "serverSelectionTimeoutMS": 10000,
                "connectTimeoutMS": 10000,
                "socketTimeoutMS": 10000,
                "retryWrites": True,
                "retryReads": True
            }
        },
        {
            "name": "SSL with invalid cert bypass",
            "params": {
                "tls": True,
                "tlsAllowInvalidCertificates": True,
                "serverSelectionTimeoutMS": 10000,
                "connectTimeoutMS": 10000,
                "socketTimeoutMS": 10000,
                "retryWrites": True,
                "retryReads": True
            }
        },
        {
            "name": "SSL insecure mode",
            "params": {
                "tls": True,
                "tlsInsecure": True,
                "serverSelectionTimeoutMS": 8000,
                "connectTimeoutMS": 8000,
                "socketTimeoutMS": 8000
            }
        },
        {
            "name": "Basic SSL context",
            "params": {
                "ssl": True,
                "ssl_cert_reqs": ssl.CERT_NONE,
                "serverSelectionTimeoutMS": 8000,
                "connectTimeoutMS": 8000,
                "socketTimeoutMS": 8000
            }
        },
        {
            "name": "No SSL (if allowed)",
            "params": {
                "ssl": False,
                "serverSelectionTimeoutMS": 5000,
                "connectTimeoutMS": 5000,
                "socketTimeoutMS": 5000
            }
        }
    ]
    
    successful_config = None
    
    for i, config in enumerate(configs, 1):
        print(f"\n🔄 Test {i}: {config['name']}")
        try:
            client = MongoClient(MONGODB_URI, **config['params'])
            
            # Test connection with ping
            result = client.admin.command('ping')
            print(f"✅ SUCCESS: {config['name']}")
            print(f"   Ping result: {result}")
            
            # Test database access
            db = client["ecommerce_db"]
            collections = db.list_collection_names()
            print(f"   Collections found: {collections}")
            
            # Test product count
            if "products" in collections:
                product_count = db["products"].count_documents({})
                print(f"   Product documents: {product_count}")
            
            successful_config = config
            client.close()
            break
            
        except Exception as e:
            print(f"❌ FAILED: {str(e)}")
            continue
    
    if successful_config:
        print(f"\n✅ RECOMMENDED CONFIGURATION:")
        print(f"   Name: {successful_config['name']}")
        print(f"   Parameters: {successful_config['params']}")
        return True
    else:
        print(f"\n❌ ALL CONFIGURATIONS FAILED")
        print(f"   Consider using local JSON fallback or checking network/firewall settings")
        return False

def check_ssl_environment():
    """Check SSL-related environment settings"""
    print("\n🔍 SSL Environment Check:")
    print(f"   Python SSL version: {ssl.OPENSSL_VERSION}")
    print(f"   Certifi CA bundle location: {certifi.where()}")
    print(f"   SSL context default: {ssl.create_default_context()}")
    
    # Check if CA bundle exists
    ca_file = certifi.where()
    if os.path.exists(ca_file):
        print(f"   ✅ CA bundle file exists: {ca_file}")
    else:
        print(f"   ❌ CA bundle file not found: {ca_file}")

def generate_improved_connection_code():
    """Generate improved connection code for app.py"""
    print("\n📝 IMPROVED CONNECTION CODE:")
    print("="*60)
    print("""
# Improved MongoDB Connection Code
import ssl
import certifi
from pymongo import MongoClient

MONGODB_URI = os.getenv('MONGODB_URI')
try:
    # Primary connection attempt with proper SSL
    client = MongoClient(
        MONGODB_URI,
        tls=True,
        tlsCAFile=certifi.where(),
        serverSelectionTimeoutMS=10000,
        connectTimeoutMS=10000,
        socketTimeoutMS=10000,
        retryWrites=True,
        retryReads=True,
        maxPoolSize=10
    )
    
    # Test connection
    client.admin.command('ping')
    print("✅ MongoDB Atlas connected successfully")
    
    db = client["ecommerce_db"]
    collection = db["products"]
    MONGODB_CONNECTED = True
    
except Exception as e:
    print(f"❌ Primary connection failed: {str(e)}")
    
    # Fallback connection attempt
    try:
        client = MongoClient(
            MONGODB_URI,
            tls=True,
            tlsAllowInvalidCertificates=True,
            serverSelectionTimeoutMS=8000,
            connectTimeoutMS=8000,
            socketTimeoutMS=8000,
            retryWrites=True,
            retryReads=True
        )
        
        client.admin.command('ping')
        print("✅ MongoDB Atlas connected with fallback SSL settings")
        
        db = client["ecommerce_db"]
        collection = db["products"]
        MONGODB_CONNECTED = True
        
    except Exception as fallback_error:
        print(f"❌ Fallback connection also failed: {str(fallback_error)}")
        print("🔄 Using local JSON fallback for product data")
        
        client = None
        db = None
        collection = None
        MONGODB_CONNECTED = False
""")
    print("="*60)

if __name__ == "__main__":
    print("🧪 MongoDB Atlas Connection Diagnostics")
    print("="*50)
    
    # Check SSL environment
    check_ssl_environment()
    
    # Test connections
    success = test_mongodb_connection()
    
    # Generate improved code
    generate_improved_connection_code()
    
    print(f"\n📊 SUMMARY:")
    if success:
        print("✅ At least one connection method succeeded")
        print("   You can use the recommended configuration above")
    else:
        print("❌ All connection methods failed")
        print("   Recommendations:")
        print("   1. Check your network connection")
        print("   2. Verify MongoDB Atlas IP whitelist settings")
        print("   3. Check if your firewall blocks MongoDB ports")
        print("   4. Consider using the local JSON fallback")
        print("   5. Try updating pymongo: pip install --upgrade pymongo")