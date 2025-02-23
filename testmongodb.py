from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["ecommerce_db"]
collection = db["products"]

# New TVs to be added under the "tv" category
new_tvs = [
    {
        "name": "Sony Bravia 8 OLED TV",
        "price": 2299.99,  # Update with the actual price if available
        "specifications": [
            "65-inch OLED panel",
            "4K Ultra HD resolution",
            "Dolby Vision, HDR10 support",
            "120Hz refresh rate",
            "Google TV interface with voice control",
            "Acoustic Surface Audio+ technology",
            "Slim profile with minimalist stand"
        ]
    },
    {
        "name": "LG OLED evo G4 4K Smart TV",
        "price": 2396.99,  # Update with the actual price if available
        "specifications": [
            "65-inch OLED evo panel",
            "4K Ultra HD resolution",
            "Dolby Vision, HDR10 support",
            "120Hz refresh rate",
            "webOS 24 with α11 AI Processor 4K",
            "Brightness Booster Max technology",
            "Gallery design for wall mounting"
        ]
    },
    {
        "name": "Samsung S95D QD-OLED TV",
        "price": 3198.95,  # Update with the actual price if available
        "specifications": [
            "65-inch QD-OLED panel",
            "4K Ultra HD resolution",
            "HDR10+ support",
            "120Hz refresh rate",
            "Tizen OS with voice assistants",
            "Object Tracking Sound technology",
            "Infinity One Design with slim bezels"
        ]
    },
    {
        "name": "Hisense U8N Mini-LED TV",
        "price": 1499.99,  # Update with the actual price if available
        "specifications": [
            "65-inch Mini-LED panel",
            "4K Ultra HD resolution",
            "Dolby Vision, HDR10+ support",
            "144Hz refresh rate",
            "Google TV with hands-free voice control",
            "Dolby Atmos support",
            "Robust build with sleek finish"
        ]
    }
]

# Ensure new TVs are added without removing existing ones
collection.update_one(
    {"category": "tv"},
    {"$push": {"products": {"$each": new_tvs}}},
    upsert=True
)

print("✅ New TVs have been successfully added to the 'tv' category in the database!")
