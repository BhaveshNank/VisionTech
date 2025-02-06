from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client['ecommerce_db']  # Database name
collection = db['products']  # Collection name

# Sample products to insert
products = [
    {
        "name": "MacBook M4 Pro",
        "type": "laptop",
        "price": 2399,
        "specifications": "16GB RAM, 512GB SSD, M4 Pro chip, ideal for programming, video editing, and gaming. A perfect choice for professionals."
    },
    {
        "name": "High-End Gaming Laptop",
        "type": "laptop",
        "price": 2999,
        "specifications": "32GB RAM, 1TB SSD, RTX 4090, designed for high-performance gaming and content creation. A top-tier laptop for enthusiasts."
    },
    {
        "name": "iPhone 16 Pro Max",
        "type": "phone",
        "price": 1299,
        "specifications": "Triple camera setup, A18 Pro chip, 50 MP camera, excellent for photography and videography. Ideal for professionals who require the best camera features."
    },
    {
        "name": "iPhone 16 Pro",
        "type": "phone",
        "price": 1099,
        "specifications": "Dual camera setup, A18 chip, 48 MP camera, great for photography. Designed for enthusiasts seeking high-quality photos."
    },
    {
        "name": "MyPhone Plus",
        "type": "phone",
        "price": 699,
        "specifications": "50 MP camera, wide lens, suitable for everyday photography. A budget-friendly option for casual users."
    }
]

# Insert the data into MongoDB
collection.insert_many(products)

print("✅ Products successfully inserted into the database!")

