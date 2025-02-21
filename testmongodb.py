from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["ecommerce_db"]
collection = db["products"]

# Sample Data
categories = [
    {
        "category": "laptop",
        "products": [
            {
                "name": "MacBook M4 Pro",
                "price": 2399,
                "specifications": ["16GB RAM", "512GB SSD", "M4 Pro chip", "Retina Display", "High-performance GPU"]
            },
            {
                "name": "High-End Gaming Laptop",
                "price": 2999,
                "specifications": ["32GB RAM", "1TB SSD", "RTX 4090", "144Hz Display", "Intel Core i9"]
            }
        ]
    },
    {
        "category": "phone",
        "products": [
            {
                "name": "iPhone 16 Pro Max",
                "price": 1299,
                "specifications": ["Triple Camera Setup", "A18 Pro Chip", "50 MP Camera", "OLED Display", "5G Connectivity"]
            },
            {
                "name": "Samsung Galaxy S24 Ultra",
                "price": 1199,
                "specifications": ["Quad Camera Setup", "Snapdragon 8 Gen 3", "200 MP Camera", "120Hz AMOLED Display", "5G Connectivity"]
            }
        ]
    },
    {
        "category": "tv",
        "products": [
            {
                "name": "Samsung 65-inch QLED TV",
                "price": 1499,
                "specifications": ["4K UHD", "Quantum HDR", "120Hz Refresh Rate", "Smart TV"]
            },
            {
                "name": "LG OLED CX 55-inch",
                "price": 1799,
                "specifications": ["4K OLED", "Dolby Vision", "HDMI 2.1", "Smart TV"]
            }
        ]
    }
]

# Insert or Update Data in MongoDB
for category in categories:
    collection.update_one(
        {"category": category["category"]},  # Find the category
        {"$set": {"products": category["products"]}},  # Update products list
        upsert=True  # Insert if not found
    )

print("Data updated successfully!")
