from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["ecommerce_db"]
collection = db["products"]

# Clear the existing database
collection.delete_many({})

# New structured data with fixed prices and brands
data = [
    {
        "category": "laptop",
        "products": [
            {"name": "MacBook M4 Pro", "brand": "Apple", "price": 2399, "specifications": ["16GB RAM", "512GB SSD", "M4 Pro chip", "Retina Display", "High-performance GPU"]},
            {"name": "High-End Gaming Laptop", "brand": "MSI", "price": 2999, "specifications": ["32GB RAM", "1TB SSD", "RTX 4090", "144Hz Display", "Intel Core i9"]},
            {"name": "LENOVO Yoga Slim 6 14\" Laptop", "brand": "Lenovo", "price": 899, "specifications": ["Intel Core i5-13500H", "8GB RAM", "512GB SSD", "Intel Iris Xe Graphics", "2.2K screen", "Battery life: Up to 14.2 hours", "Windows 11", "Intel Evo Platform"]},
            {"name": "HP Pavilion SE 14\" Laptop", "brand": "HP", "price": 599, "specifications": ["Intel Core i3-N305", "8GB RAM", "256GB SSD", "Full HD screen", "Battery life: Up to 8.5 hours", "Windows 11 S"]},
            {"name": "SAMSUNG Galaxy Book2 Pro SE 15.6\" Laptop", "brand": "Samsung", "price": 1299, "specifications": ["Intel Core Ultra 7 155H", "16GB DDR5 RAM", "512GB SSD", "Full HD AMOLED screen", "Battery life: Up to 25 hours", "Windows 11", "Intel Evo Platform", "Intel ARC Graphics"]},
            {"name": "APPLE MacBook Air 13.6\" (2024)", "brand": "Apple", "price": 1099, "specifications": ["Apple M3 chip", "16GB RAM", "256GB SSD", "Liquid Retina display", "Battery life: Up to 18 hours", "macOS", "Built for Apple Intelligence"]}
        ]
    },
    {
        "category": "phone",
        "products": [
            {"name": "iPhone 16 Pro Max", "brand": "Apple", "price": 1299, "specifications": ["Triple Camera Setup", "A18 Pro Chip", "50 MP Camera", "OLED Display", "5G Connectivity"]},
            {"name": "Samsung Galaxy S24 Ultra", "brand": "Samsung", "price": 1199, "specifications": ["Quad Camera Setup", "Snapdragon 8 Gen 3", "200 MP Camera", "120Hz AMOLED Display", "5G Connectivity"]},
            {"name": "OnePlus 13R", "brand": "OnePlus", "price": 499, "specifications": ["Snapdragon 8 Gen 3", "50MP Wide Camera", "8MP Ultra Wide Camera", "50MP Telephoto", "2x optical zoom", "4x optical quality zoom", "16MP Front Camera", "6.78-inch display", "6000mAh Battery", "80W SUPERVOOC charging", "IP65 Water & Dust Resistance"]},
            {"name": "Xiaomi 14T Pro", "brand": "Xiaomi", "price": 699, "specifications": ["6.67-inch AMOLED", "2712 x 1220 pixels resolution", "144Hz refresh rate", "MediaTek Dimensity 9300+", "512GB Storage", "50MP Main Camera", "120W Wired Charging", "Android 14 with HyperOS"]},
            {"name": "Samsung Galaxy Z Flip 6", "brand": "Samsung", "price": 999, "specifications": ["6.7-inch Dynamic AMOLED", "Snapdragon 8 Gen 3", "12GB RAM", "256GB Storage", "50MP Main Camera", "4000mAh Battery", "IP48 Water & Dust Resistance"]},
            {"name": "Samsung Galaxy S24 FE", "brand": "Samsung", "price": 799, "specifications": ["6.7-inch Dynamic AMOLED", "Samsung Exynos 2400e", "8GB RAM", "128GB Storage", "50MP Main Camera", "IP68 Water & Dust Resistance"]}
        ]
    },
    {
        "category": "tv",
        "products": [
            {"name": "Samsung 65-inch QLED TV", "brand": "Samsung", "price": 1499, "specifications": ["4K UHD", "Quantum HDR", "120Hz Refresh Rate", "Smart TV"]},
            {"name": "LG OLED CX 55-inch", "brand": "LG", "price": 1799, "specifications": ["4K OLED", "Dolby Vision", "HDMI 2.1", "Smart TV"]},
            {"name": "Sony Bravia 8 OLED TV", "brand": "Sony", "price": 2299.99, "specifications": ["65-inch OLED panel", "4K Ultra HD resolution", "Dolby Vision", "120Hz refresh rate", "Google TV interface", "Acoustic Surface Audio+ technology"]},
            {"name": "LG OLED evo G4 4K Smart TV", "brand": "LG", "price": 2396.99, "specifications": ["65-inch OLED evo panel", "4K Ultra HD resolution", "Dolby Vision", "120Hz refresh rate", "webOS 24", "Brightness Booster Max technology"]},
            {"name": "Samsung S95D QD-OLED TV", "brand": "Samsung", "price": 3198.95, "specifications": ["65-inch QD-OLED panel", "4K Ultra HD resolution", "HDR10+ support", "120Hz refresh rate", "Tizen OS", "Object Tracking Sound technology"]},
            {"name": "Hisense U8N Mini-LED TV", "brand": "Hisense", "price": 1499.99, "specifications": ["65-inch Mini-LED panel", "4K Ultra HD resolution", "Dolby Vision", "144Hz refresh rate", "Google TV with hands-free voice control"]}
        ]
    }
]

# Insert new data into MongoDB
collection.insert_many(data)
print("✅ Database has been populated successfully!")