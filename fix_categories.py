from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client['ecommerce_db']
collection = db['products']

# First, let's see what we currently have
print("Current gaming products:")
gaming_products = list(collection.find({"category": "gaming"}))
for product in gaming_products:
    print(f"- {product.get('name', 'Unknown')}")

# Create separate Audio category with just the headphone
audio_headphone = {
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
    "category": "audio"
}

# PS5 stays in gaming
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

# Remove existing gaming category documents
collection.delete_many({"category": "gaming"})

# Remove individual gaming products
collection.delete_many({"type": "gaming"})

# Create new Audio category
audio_category_doc = {
    "category": "audio",
    "products": [audio_headphone]
}
collection.insert_one(audio_category_doc)

# Create new Gaming category with only PS5
gaming_category_doc = {
    "category": "gaming", 
    "products": [ps5_console]
}
collection.insert_one(gaming_category_doc)

# Also add individual product documents for search functionality
individual_audio = {
    "name": audio_headphone["name"],
    "brand": audio_headphone["brand"],
    "price": audio_headphone["price"],
    "specifications": "; ".join(audio_headphone["specifications"]),
    "image": audio_headphone["image"],
    "category": "audio",
    "type": "audio"
}

individual_gaming = {
    "name": ps5_console["name"],
    "brand": ps5_console["brand"],
    "price": ps5_console["price"],
    "specifications": "; ".join(ps5_console["specifications"]),
    "image": ps5_console["image"],
    "category": "gaming",
    "type": "gaming"
}

collection.insert_one(individual_audio)
collection.insert_one(individual_gaming)

print("\n✅ Categories fixed!")
print("🎧 Audio category: Gaming Headphone - $29.99")
print("🎮 Gaming category: Sony PlayStation 5 - $499.99")