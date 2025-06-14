from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client['ecommerce_db']
collection = db['products']

# Update the gaming headphone image
collection.update_many(
    {"name": {"$regex": "Gaming Headset.*RGB Light", "$options": "i"}},
    {"$set": {"image": "gamingheadphone.jpg"}}
)

# Update the PS5 image
collection.update_many(
    {"name": {"$regex": "PlayStation 5", "$options": "i"}},
    {"$set": {"image": "ps5.jpg"}}
)

# Update the category-based products as well
gaming_category = collection.find_one({"category": "gaming"})
if gaming_category and "products" in gaming_category:
    updated_products = []
    for product in gaming_category["products"]:
        if "RGB Light" in product.get("name", ""):
            product["image"] = "gamingheadphone.jpg"
        elif "PlayStation 5" in product.get("name", ""):
            product["image"] = "ps5.jpg"
        updated_products.append(product)
    
    # Update the category document
    collection.update_one(
        {"category": "gaming"},
        {"$set": {"products": updated_products}}
    )

print("✅ Updated gaming product images to match available files!")
print("   - Gaming headphone: gamingheadphone.jpg")
print("   - PS5: ps5.jpg")