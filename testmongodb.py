from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client['ecommerce_db']
collection = db['products']

# Fetch products
products = list(collection.find())

# Print results
for product in products:
    print(product)
