from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["ecommerce_db"]
collection = db["products"]

# New structured product data
updated_products = [
    {
        "name": "MacBook M4 Pro",
        "type": "laptop",
        "price": 2399,
        "specifications": ["16GB RAM", "512GB SSD", "M4 Pro chip", "Retina Display", "High-performance GPU"]
    },
    {
        "name": "High-End Gaming Laptop",
        "type": "laptop",
        "price": 2999,
        "specifications": ["32GB RAM", "1TB SSD", "RTX 4090", "144Hz Display", "Intel Core i9"]
    },
    {
        "name": "iPhone 16 Pro Max",
        "type": "phone",
        "price": 1299,
        "specifications": ["Triple Camera Setup", "A18 Pro Chip", "50 MP Camera", "OLED Display", "5G Connectivity"]
    },
    {
        "name": "iPhone 16 Pro",
        "type": "phone",
        "price": 1099,
        "specifications": ["Dual Camera Setup", "A18 Chip", "48 MP Camera", "OLED Display", "5G Connectivity"]
    },
    {
        "name": "MyPhone Plus",
        "type": "phone",
        "price": 699,
        "specifications": ["50 MP Camera", "Wide Lens", "LCD Display", "4G Connectivity", "Fast Charging"]
    }
]

# Clear the collection (optional: remove all existing entries)
collection.delete_many({})

# Insert updated products
collection.insert_many(updated_products)

print("✅ Database successfully updated with structured features!")
