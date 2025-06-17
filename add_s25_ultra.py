#!/usr/bin/env python3

import pymongo
from pymongo import MongoClient

# MongoDB Connection
client = MongoClient("mongodb://localhost:27017/")
db = client["ecommerce_db"]
collection = db["products"]

def add_s25_ultra():
    """Add Samsung Galaxy S25 Ultra to the phone category"""
    
    # Samsung Galaxy S25 Ultra product data
    s25_ultra_product = {
        "name": "Samsung Galaxy S25 Ultra",
        "brand": "Samsung",
        "price": 1149,
        "specifications": [
            "6.8-inch Dynamic AMOLED 2X display",
            "Snapdragon 8 Gen 3 for Galaxy processor",
            "200MP main camera with AI photography",
            "12GB/16GB RAM options",
            "256GB/512GB/1TB storage",
            "5000mAh battery with 45W fast charging", 
            "S Pen included",
            "Galaxy AI features",
            "IP68 water resistance",
            "Titanium frame construction",
            "One UI 7.1 based on Android 15",
            "5G connectivity"
        ],
        "image": "samsungs25ultra.jpg",
        "description": "Experience the ultimate in mobile technology with the Galaxy S25 Ultra. Featuring next-generation Galaxy AI, advanced photography capabilities, and the most powerful S Pen experience yet.",
        "category": "phone",
        "in_stock": True,
        "rating": 4.8,
        "reviews_count": 245
    }
    
    try:
        # Find the phone category document
        phone_doc = collection.find_one({"category": "phone"})
        
        if phone_doc:
            # Check if S25 Ultra already exists
            existing_product = None
            for product in phone_doc.get("products", []):
                if product.get("name") == "Samsung Galaxy S25 Ultra":
                    existing_product = product
                    break
            
            if existing_product:
                print("Samsung Galaxy S25 Ultra already exists in the database. Updating...")
                # Update existing product
                collection.update_one(
                    {"category": "phone", "products.name": "Samsung Galaxy S25 Ultra"},
                    {"$set": {"products.$": s25_ultra_product}}
                )
                print("✅ Samsung Galaxy S25 Ultra updated successfully!")
            else:
                # Add new product to existing phone category
                collection.update_one(
                    {"category": "phone"},
                    {"$push": {"products": s25_ultra_product}}
                )
                print("✅ Samsung Galaxy S25 Ultra added successfully to existing phone category!")
        else:
            # Create new phone category with S25 Ultra
            phone_category = {
                "category": "phone",
                "products": [s25_ultra_product]
            }
            collection.insert_one(phone_category)
            print("✅ Created new phone category with Samsung Galaxy S25 Ultra!")
            
        # Verify the addition
        updated_doc = collection.find_one({"category": "phone"})
        if updated_doc:
            phone_products = updated_doc.get("products", [])
            s25_found = any(p.get("name") == "Samsung Galaxy S25 Ultra" for p in phone_products)
            if s25_found:
                print(f"✅ Verification successful! Total phones in database: {len(phone_products)}")
            else:
                print("❌ Verification failed! S25 Ultra not found after insertion.")
        
    except Exception as e:
        print(f"❌ Error adding Samsung Galaxy S25 Ultra: {str(e)}")

if __name__ == "__main__":
    print("Adding Samsung Galaxy S25 Ultra to product database...")
    add_s25_ultra()
    print("Done!")