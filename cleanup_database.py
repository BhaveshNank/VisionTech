from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client['ecommerce_db']
collection = db['products']

print("=== CLEANING UP DATABASE ===")

# Remove individual product documents (keeping only category-based documents)
individual_docs = list(collection.find({"type": {"$exists": True}}))
print(f"Found {len(individual_docs)} individual product documents to remove:")

for doc in individual_docs:
    print(f"  - {doc.get('name', 'Unknown')} (type: {doc.get('type')})")
    collection.delete_one({"_id": doc["_id"]})

print(f"✅ Removed {len(individual_docs)} individual product documents")

# Remove any documents without products array
empty_docs = list(collection.find({"products": {"$exists": False}}))
print(f"Found {len(empty_docs)} empty documents to remove:")

for doc in empty_docs:
    print(f"  - Document with _id: {doc.get('_id')}")
    collection.delete_one({"_id": doc["_id"]})

print(f"✅ Removed {len(empty_docs)} empty documents")

# Count final products
print("\n=== FINAL DATABASE STATE ===")
remaining_docs = list(collection.find({}))
total_products = 0

for doc in remaining_docs:
    category = doc.get('category', 'unknown')
    products_count = len(doc.get('products', []))
    total_products += products_count
    print(f"{category.upper()}: {products_count} products")

print(f"\n📊 TOTAL PRODUCTS: {total_products}")
print(f"📊 TOTAL CATEGORIES: {len(remaining_docs)}")

# Verify specific products
print("\n=== VERIFYING SPECIFIC PRODUCTS ===")
gaming_doc = collection.find_one({"category": "gaming"})
if gaming_doc:
    gaming_products = gaming_doc.get('products', [])
    print(f"Gaming products: {len(gaming_products)}")
    for product in gaming_products:
        print(f"  - {product.get('name')}")

audio_doc = collection.find_one({"category": "audio"})
if audio_doc:
    audio_products = audio_doc.get('products', [])
    print(f"Audio products: {len(audio_products)}")
    for product in audio_products:
        print(f"  - {product.get('name')}")

print("\n✅ Database cleanup completed!")