from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client['ecommerce_db']
collection = db['products']

# Gaming Headphone Product (based on the Amazon link provided)
gaming_headphone = {
    "name": "Gaming Headset Stereo Surround Sound Gaming Headphones with Breathing RGB Light",
    "brand": "OZEINO",
    "price": 29.99,
    "specifications": [
        "50mm high-precision neodymium drivers for superior sound quality",
        "Breathing RGB LED lights with 7 color variations",
        "360-degree adjustable noise-canceling microphone",
        "3.5mm universal compatibility (PC, PS4, PS5, Xbox One, Nintendo Switch)",
        "Comfortable memory foam ear cushions for extended gaming sessions",
        "Lightweight design with adjustable headband",
        "In-line volume control and microphone mute button",
        "Durable braided cable with gold-plated 3.5mm connector",
        "Compatible with Windows, Mac, Linux operating systems",
        "Professional gaming-grade audio with virtual surround sound"
    ],
    "image": "gamingheadphone.jpg",
    "category": "gaming"
}

# PS5 Product
ps5_console = {
    "name": "Sony PlayStation 5 Console",
    "brand": "Sony",
    "price": 499.99,
    "specifications": [
        "Custom AMD Zen 2 8-core CPU running at 3.5GHz",
        "Custom AMD RDNA 2 GPU with 10.28 TFLOPs and 36 compute units",
        "16GB GDDR6 RAM with 448GB/s memory bandwidth",
        "825GB custom NVMe SSD with 5.5GB/s raw throughput",
        "Support for 4K gaming at up to 120fps with ray tracing",
        "Backwards compatibility with PlayStation 4 games",
        "3D audio technology for immersive gaming experience",
        "DualSense wireless controller with haptic feedback and adaptive triggers",
        "Ultra HD Blu-ray disc support and digital game downloads",
        "USB-A and USB-C ports, HDMI 2.1 output, Ethernet and Wi-Fi 6 connectivity"
    ],
    "image": "ps5.jpg",
    "category": "gaming"
}

# First, check if gaming category already exists
gaming_category = collection.find_one({"category": "gaming"})

if gaming_category:
    # Add products to existing gaming category
    collection.update_one(
        {"category": "gaming"},
        {"$push": {"products": {"$each": [gaming_headphone, ps5_console]}}}
    )
    print("✅ Added gaming products to existing gaming category!")
else:
    # Create new gaming category document
    gaming_category_doc = {
        "category": "gaming",
        "products": [gaming_headphone, ps5_console]
    }
    collection.insert_one(gaming_category_doc)
    print("✅ Created new gaming category with products!")

# Also add individual product documents for better search functionality
individual_products = [
    {
        "name": gaming_headphone["name"],
        "brand": gaming_headphone["brand"], 
        "price": gaming_headphone["price"],
        "specifications": "; ".join(gaming_headphone["specifications"]),
        "image": gaming_headphone["image"],
        "category": "gaming",
        "type": "gaming"
    },
    {
        "name": ps5_console["name"],
        "brand": ps5_console["brand"],
        "price": ps5_console["price"], 
        "specifications": "; ".join(ps5_console["specifications"]),
        "image": ps5_console["image"],
        "category": "gaming",
        "type": "gaming"
    }
]

# Insert individual products for search functionality
for product in individual_products:
    existing = collection.find_one({"name": product["name"], "type": "gaming"})
    if not existing:
        collection.insert_one(product)
        print(f"✅ Added individual product: {product['name']}")
    else:
        print(f"⚠️ Product already exists: {product['name']}")

print("\n🎮 Gaming products successfully added to the database!")
print("📱 Products added:")
print("   1. Gaming Headset with RGB lighting - $29.99")
print("   2. Sony PlayStation 5 Console - $499.99")