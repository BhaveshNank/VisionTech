from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client['ecommerce_db']
collection = db['products']

print("=== All documents in the database ===")
all_docs = list(collection.find({}))

for i, doc in enumerate(all_docs):
    print(f"\nDocument {i+1}:")
    print(f"  _id: {doc.get('_id')}")
    print(f"  Category: {doc.get('category', 'N/A')}")
    print(f"  Type: {doc.get('type', 'N/A')}")
    print(f"  Name: {doc.get('name', 'N/A')}")
    
    if 'products' in doc:
        print(f"  Products array with {len(doc['products'])} items:")
        for j, product in enumerate(doc['products']):
            print(f"    {j+1}. {product.get('name', 'Unknown')}")

print(f"\n=== Total documents: {len(all_docs)} ===")

# Look for duplicates
print("\n=== Looking for PS5 duplicates ===")
ps5_docs = list(collection.find({"name": {"$regex": "PlayStation.*5", "$options": "i"}}))
print(f"Found {len(ps5_docs)} PS5 individual documents")

print("\n=== Looking for SteelSeries products ===")
steelseries_docs = list(collection.find({"name": {"$regex": "SteelSeries", "$options": "i"}}))
print(f"Found {len(steelseries_docs)} SteelSeries individual documents")

# Check in category documents
for doc in all_docs:
    if 'products' in doc:
        for product in doc['products']:
            if 'steelseries' in product.get('name', '').lower():
                print(f"Found SteelSeries in {doc.get('category')} category: {product.get('name')}")
            if 'playstation' in product.get('name', '').lower():
                print(f"Found PS5 in {doc.get('category')} category: {product.get('name')}")