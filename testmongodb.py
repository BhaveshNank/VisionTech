from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["ecommerce_db"]
collection = db["products"]

# Clear the existing database
collection.delete_many({})

# Enhanced structured data with essential specifications (8-10 per product)
data = [
    {
        "category": "laptop",
        "products": [
            {
                "name": "MacBook M4 Pro", 
                "brand": "Apple", 
                "price": 2399, 
                "specifications": [
                    "14.2-inch Liquid Retina XDR display", 
                    "Apple M4 Pro chip with 14-core CPU, 20-core GPU", 
                    "16GB unified memory", 
                    "512GB SSD storage", 
                    "ProMotion technology with 120Hz refresh rate",
                    "Three Thunderbolt 4 ports", 
                    "Up to 18 hours battery life",
                    "Backlit Magic Keyboard with Touch ID",
                    "Wi-Fi 6E and Bluetooth 5.3"
                ], 
                "image": "macbook_m4_pro.jpg"
            },
            {
                "name": "High-End Gaming Laptop", 
                "brand": "MSI", 
                "price": 2999, 
                "specifications": [
                    "17.3-inch QHD 240Hz display",
                    "Intel Core i9-14900HX processor",
                    "NVIDIA GeForce RTX 4090 16GB GDDR6",
                    "32GB DDR5 RAM",
                    "1TB NVMe PCIe Gen 4 SSD",
                    "Per-key RGB SteelSeries keyboard",
                    "Advanced cooling system with Cooler Boost Trinity+",
                    "Windows 11 Pro",
                    "Thunderbolt 4 support"
                ], 
                "image": "msi_gaming_laptop.jpg"
            },
            {
                "name": "LENOVO Yoga Slim 6 14\" Laptop", 
                "brand": "Lenovo", 
                "price": 899, 
                "specifications": [
                    "14-inch 2.2K (2240 x 1400) IPS display",
                    "Intel Core i5-13500H processor (12 cores, up to 4.7GHz)",
                    "8GB LPDDR5X RAM",
                    "512GB PCIe 4.0 NVMe SSD",
                    "Intel Iris Xe Graphics",
                    "Full-HD 1080p IR camera",
                    "Dolby Atmos speaker system",
                    "Backlit keyboard",
                    "Up to 14 hours battery life"
                ], 
                "image": "lenovo_yoga_slim_6.jpg"
            },
            {
                "name": "HP Pavilion SE 14\" Laptop", 
                "brand": "HP", 
                "price": 599, 
                "specifications": [
                    "14-inch Full HD (1920 x 1080) IPS display",
                    "Intel Core i3-N305 processor (8 cores, up to 3.8GHz)",
                    "8GB DDR4 RAM (3200MHz)",
                    "256GB PCIe NVMe M.2 SSD",
                    "Intel UHD Graphics",
                    "Windows 11 Home",
                    "Wi-Fi 6 and Bluetooth 5.3",
                    "720p HD camera",
                    "Up to 10 hours battery life"
                ], 
                "image": "hp_pavilion_se_14.jpg"
            },
            {
                "name": "SAMSUNG Galaxy Book2 Pro SE 15.6\" Laptop", 
                "brand": "Samsung", 
                "price": 1299, 
                "specifications": [
                    "15.6-inch Full HD (1920 x 1080) AMOLED display",
                    "Intel Core Ultra 7 155H processor",
                    "16GB LPDDR5X RAM",
                    "512GB PCIe Gen4 NVMe SSD",
                    "Intel Arc Graphics",
                    "1080p FHD webcam",
                    "AKG quad speakers with Dolby Atmos",
                    "Ultra-thin design: 11.7mm thickness",
                    "Weight: 1.11kg (2.45 lbs)",
                    "Up to 20 hours battery life"
                ], 
                "image": "samsung_galaxy_book2.jpg"
            },
            {
                "name": "Apple MacBook Air 13.6\" (2024)", 
                "brand": "Apple", 
                "price": 1099, 
                "specifications": [
                    "13.6-inch Liquid Retina display (2560 x 1664)",
                    "Apple M3 chip with 8-core CPU, 10-core GPU",
                    "16GB unified memory",
                    "256GB SSD storage",
                    "1080p FaceTime HD camera",
                    "Magic Keyboard with Touch ID",
                    "Four-speaker sound system",
                    "Up to 18 hours battery life",
                    "Fanless design",
                    "Weight: 1.24 kg (2.7 pounds)"
                ], 
                "image": "macbook_air_2024.jpg"
            },
            {
                "name": "Acer Aspire 5 Slim", 
                "brand": "Acer", 
                "price": 479, 
                "specifications": [
                    "15.6-inch Full HD (1920 x 1080) IPS display",
                    "AMD Ryzen 3 3350U Quad-Core Processor",
                    "4GB DDR4 RAM",
                    "128GB PCIe NVMe SSD",
                    "AMD Radeon Vega 6 Graphics",
                    "HD Webcam (720p)",
                    "Backlit keyboard",
                    "Wi-Fi 6 and Bluetooth 5.0",
                    "Up to 8 hours battery life"
                ], 
                "image": "acer_aspire_5.jpg"
            },
            {
                "name": "ASUS ROG Strix G16", 
                "brand": "ASUS", 
                "price": 1799, 
                "specifications": [
                    "16-inch QHD 240Hz display (2560 x 1600)",
                    "Intel Core i9-14900H processor",
                    "16GB DDR5 RAM",
                    "1TB SSD",
                    "NVIDIA RTX 4070 8GB GDDR6",
                    "ROG Intelligent Cooling thermal system",
                    "Per-key RGB keyboard",
                    "Windows 11 Pro",
                    "Wi-Fi 6E and Bluetooth 5.3",
                    "90Wh battery"
                ], 
                "image": "asus_rog_strix_g16.jpg"
            },
            {
                "name": "Dell XPS 13 Plus", 
                "brand": "Dell", 
                "price": 1399, 
                "specifications": [
                    "13.4-inch 3.5K (3456 x 2160) OLED touch display",
                    "Intel Core i7-1360P processor",
                    "16GB LPDDR5 RAM",
                    "512GB SSD",
                    "Intel Iris Xe Graphics",
                    "Zero-lattice keyboard with capacitive function row",
                    "Haptic touch trackpad",
                    "Dual Thunderbolt 4 ports",
                    "Windows 11 Home",
                    "52WHr battery"
                ], 
                "image": "dell_xps_13_plus.jpg"
            },
            {
                "name": "Microsoft Surface Laptop Studio 2", 
                "brand": "Microsoft", 
                "price": 2399, 
                "specifications": [
                    "14.4-inch PixelSense Flow touch display (2400 x 1600)",
                    "Intel Core i7-13800H processor",
                    "32GB RAM",
                    "1TB SSD",
                    "NVIDIA GeForce RTX 4060 GPU",
                    "Versatile 3-in-1 design (laptop, stage, and studio modes)",
                    "Surface Slim Pen 2 compatibility",
                    "120Hz refresh rate with Dolby Vision",
                    "Studio Mics and enhanced camera",
                    "Windows 11 Pro"
                ], 
                "image": "microsoft_surface_studio_2.jpg"
            }
        ]
    },
    {
        "category": "phone",
        "products": [
            {
                "name": "iPhone 16 Pro Max", 
                "brand": "Apple", 
                "price": 1299, 
                "specifications": [
                    "6.9-inch Super Retina XDR display with ProMotion",
                    "A18 Pro chip with 6-core CPU and 5-core GPU",
                    "48MP main camera with sensor-shift OIS",
                    "12MP ultra wide and 12MP telephoto cameras",
                    "Up to 8K video recording with Dolby Vision",
                    "Face ID facial recognition",
                    "Up to 29 hours video playback",
                    "5G connectivity",
                    "iOS 18",
                    "Ceramic Shield front"
                ], 
                "image": "iphone_16_pro_max.jpg"
            },
            {
                "name": "Samsung Galaxy S24 Ultra", 
                "brand": "Samsung", 
                "price": 1199, 
                "specifications": [
                    "6.8-inch Dynamic AMOLED 2X display (3088 x 1440)",
                    "120Hz adaptive refresh rate",
                    "Snapdragon 8 Gen 3 processor",
                    "200MP main camera",
                    "12MP ultra-wide, 50MP telephoto with 5x optical zoom",
                    "5000mAh battery with fast charging",
                    "S Pen included",
                    "Android 14 with One UI 6.1",
                    "IP68 water and dust resistance",
                    "8GB RAM with 256GB storage"
                ], 
                "image": "samsung_s24_ultra.jpg"
            },
            {
                "name": "OnePlus 13R", 
                "brand": "OnePlus", 
                "price": 499, 
                "specifications": [
                    "6.7-inch Fluid AMOLED display (2772 x 1240)",
                    "120Hz refresh rate",
                    "Snapdragon 8 Gen 3 processor",
                    "50MP Sony IMX890 main camera",
                    "8MP ultra-wide camera",
                    "16MP front camera",
                    "6000mAh battery",
                    "100W SUPERVOOC fast charging",
                    "OxygenOS 14 based on Android 14",
                    "8GB RAM with 128GB storage"
                ], 
                "image": "oneplus_13r.jpg"
            },
            {
                "name": "Xiaomi 14T Pro", 
                "brand": "Xiaomi", 
                "price": 699, 
                "specifications": [
                    "6.67-inch AMOLED display (2712 x 1220)",
                    "144Hz refresh rate with Dolby Vision",
                    "MediaTek Dimensity 9300+ processor",
                    "50MP main camera with OIS",
                    "12MP ultra-wide and 50MP telephoto cameras",
                    "5000mAh battery",
                    "120W HyperCharge",
                    "MIUI 15 based on Android 14",
                    "12GB RAM with 256GB storage",
                    "Corning Gorilla Glass Victus 2"
                ], 
                "image": "xiaomi_14t_pro.jpg"
            },
            {
                "name": "Google Pixel 9 Pro", 
                "brand": "Google", 
                "price": 999, 
                "specifications": [
                    "6.3-inch OLED display (2992 x 1344)",
                    "120Hz refresh rate",
                    "Google Tensor G4 chip",
                    "48MP main camera with Super Res Zoom",
                    "12MP ultra-wide camera",
                    "48MP telephoto camera with 5x optical zoom",
                    "5000mAh battery",
                    "Android 15 with 7 years of updates",
                    "12GB RAM with 128GB storage",
                    "Titan M2 security chip"
                ], 
                "image": "google_pixel_9_pro.jpg"
            },
            {
                "name": "Nothing Phone 3a", 
                "brand": "Nothing", 
                "price": 449, 
                "specifications": [
                    "6.7-inch AMOLED display (2400 x 1080)",
                    "120Hz refresh rate",
                    "Snapdragon 8s Gen 3 processor",
                    "50MP main camera with OIS",
                    "50MP ultra-wide camera",
                    "Glyph Interface with customizable light patterns",
                    "5000mAh battery",
                    "45W fast charging",
                    "Nothing OS 3.0 based on Android 14",
                    "8GB RAM with 128GB storage"
                ], 
                "image": "nothing_phone_3a.jpg"
            },
            {
                "name": "Motorola Razr 50 Ultra", 
                "brand": "Motorola", 
                "price": 899, 
                "specifications": [
                    "6.9-inch foldable OLED main display (2640 x 1080)",
                    "3.6-inch external OLED display",
                    "Snapdragon 8s Gen 3 processor",
                    "50MP main camera with OIS",
                    "13MP ultra-wide camera",
                    "32MP front camera",
                    "4000mAh battery",
                    "30W TurboPower charging",
                    "Android 14",
                    "8GB RAM with 256GB storage"
                ], 
                "image": "motorola_razr_50.jpg"
            },
            {
                "name": "Blackview BV9900 Pro", 
                "brand": "Blackview", 
                "price": 349, 
                "specifications": [
                    "5.84-inch FHD+ display (2280 x 1080)",
                    "MediaTek Helio P90 processor",
                    "48MP Sony IMX582 main camera",
                    "FLIR thermal imaging camera",
                    "8GB RAM with 128GB storage",
                    "IP68/IP69K/MIL-STD-810G rugged certification",
                    "4380mAh battery",
                    "Wireless charging support",
                    "Android 10",
                    "NFC support"
                ], 
                "image": "blackview_bv9900.jpg"
            },
            {
                "name": "Sony Xperia 1 VI", 
                "brand": "Sony", 
                "price": 1099, 
                "specifications": [
                    "6.5-inch 4K HDR OLED display (3840 x 1644)",
                    "120Hz refresh rate",
                    "Snapdragon 8 Gen 3 processor",
                    "48MP main camera with ZEISS optics",
                    "12MP ultra-wide and 12MP telephoto cameras",
                    "3.5mm headphone jack",
                    "5000mAh battery",
                    "30W fast charging",
                    "Android 14",
                    "12GB RAM with 256GB storage"
                ], 
                "image": "sony_xperia_1_vi.jpg"
            },
            {
                "name": "Realme GT Neo 6", 
                "brand": "Realme", 
                "price": 599, 
                "specifications": [
                    "6.78-inch AMOLED display (2780 x 1264)",
                    "144Hz refresh rate",
                    "Snapdragon 8+ Gen 1 processor",
                    "50MP Sony IMX890 main camera with OIS",
                    "8MP ultra-wide camera",
                    "16MP front camera",
                    "5500mAh battery",
                    "100W SuperDart Charge",
                    "Realme UI 5.0 based on Android 14",
                    "8GB RAM with 256GB storage"
                ], 
                "image": "realme_gt_neo_6.jpg"
            }
        ]
    },
    {
        "category": "tv",
        "products": [
            {
                "name": "Samsung 65-inch QLED", 
                "brand": "Samsung", 
                "price": 1499, 
                "specifications": [
                    "65-inch 4K UHD display (3840 x 2160)",
                    "Quantum Processor with AI upscaling",
                    "Quantum HDR 32x",
                    "Motion Rate 240",
                    "Anti-reflection screen",
                    "Object Tracking Sound Lite",
                    "Gaming Hub with cloud gaming support",
                    "Tizen smart TV platform",
                    "Voice assistant compatibility",
                    "4 HDMI ports, 2 USB ports"
                ], 
                "image": "samsung_65_qled.jpg"
            },
            {
                "name": "LG OLED CX 55-inch", 
                "brand": "LG", 
                "price": 1799, 
                "specifications": [
                    "55-inch 4K OLED display (3840 x 2160)",
                    "α9 Gen3 AI Processor",
                    "Dolby Vision IQ and Dolby Atmos",
                    "120Hz refresh rate",
                    "NVIDIA G-SYNC compatibility",
                    "Filmmaker Mode",
                    "webOS smart platform",
                    "4 HDMI 2.1 ports",
                    "ThinQ AI with voice assistants",
                    "Infinite contrast ratio"
                ], 
                "image": "lg_oled_cx_55.jpg"
            },
            {
                "name": "Sony Bravia 8 OLED", 
                "brand": "Sony", 
                "price": 2299, 
                "specifications": [
                    "65-inch 4K OLED display (3840 x 2160)",
                    "Cognitive Processor XR",
                    "XR OLED Contrast Pro",
                    "Acoustic Surface Audio+",
                    "BRAVIA CAM compatibility",
                    "Google TV operating system",
                    "4 HDMI 2.1 ports (2 with 4K/120Hz)",
                    "ATSC 3.0 tuner",
                    "Sony Perfect for PlayStation 5 features",
                    "Dolby Vision and Dolby Atmos support"
                ], 
                "image": "sony_bravia_8.jpg"
            },
            {
                "name": "TCL 6-Series QLED", 
                "brand": "TCL", 
                "price": 999, 
                "specifications": [
                    "65-inch 4K QLED display (3840 x 2160)",
                    "Mini-LED backlight technology",
                    "Up to 240 Contrast Control Zones",
                    "Quantum Dot technology",
                    "Dolby Vision, HDR10, HDR10+ and HLG",
                    "120Hz refresh rate",
                    "Variable Refresh Rate for gaming",
                    "Google TV platform",
                    "4 HDMI ports (2 with HDMI 2.1)",
                    "Voice remote with Google Assistant"
                ], 
                "image": "tcl_6_series_qled.jpg"
            },
            {
                "name": "Hisense U8K Mini-LED", 
                "brand": "Hisense", 
                "price": 1299, 
                "specifications": [
                    "65-inch 4K Mini-LED display (3840 x 2160)",
                    "Up to 1500 nits peak brightness",
                    "Full Array Local Dimming Pro",
                    "144Hz refresh rate",
                    "Quantum Dot Color",
                    "Dolby Vision, HDR10+, HLG",
                    "IMAX Enhanced certification",
                    "HDMI 2.1 ports with ALLM and VRR",
                    "Google TV with hands-free voice control",
                    "Game Mode Pro with FreeSync Premium"
                ], 
                "image": "hisense_u8k_mini_led.jpg"
            },
            {
                "name": "Vizio P-Series Quantum", 
                "brand": "Vizio", 
                "price": 899, 
                "specifications": [
                    "65-inch 4K UHD display (3840 x 2160)",
                    "Quantum Color technology",
                    "Full Array LED with local dimming",
                    "Up to 1200 nits brightness",
                    "120Hz refresh rate",
                    "HDR10, HDR10+, Dolby Vision, HLG",
                    "ProGaming Engine with VRR",
                    "SmartCast platform with Apple AirPlay 2",
                    "Voice remote with voice assistant integration",
                    "4 HDMI 2.1 ports"
                ], 
                "image": "vizio_p_series.jpg"
            },
            {
                "name": "Philips Ambilight OLED", 
                "brand": "Philips", 
                "price": 1699, 
                "specifications": [
                    "65-inch 4K OLED display (3840 x 2160)",
                    "3-sided Ambilight technology",
                    "P5 Perfect Picture Engine",
                    "Dolby Atmos and Dolby Vision",
                    "120Hz refresh rate",
                    "Android TV smart platform",
                    "HDMI 2.1 ports with VRR and ALLM",
                    "DTS Play-Fi compatible",
                    "Works with Alexa and Google Assistant",
                    "4-sided anti-reflection coating"
                ], 
                "image": "philips_ambilight_oled.jpg"
            },
            {
                "name": "Sharp Aquos XLED", 
                "brand": "Sharp", 
                "price": 1999, 
                "specifications": [
                    "70-inch 8K display (7680 x 4320)",
                    "Quantum Dot technology",
                    "HDR10, Dolby Vision, HLG",
                    "AI picture optimization",
                    "Harman Kardon audio system",
                    "Android TV 11.0",
                    "Built-in voice assistant",
                    "4 HDMI ports, 3 USB ports",
                    "Bluetooth audio",
                    "Hands-free voice control"
                ], 
                "image": "sharp_aquos_xled.jpg"
            },
            {
                "name": "Panasonic JZ2000 OLED", 
                "brand": "Panasonic", 
                "price": 2199, 
                "specifications": [
                    "65-inch 4K OLED Pro HDR display (3840 x 2160)",
                    "Master HDR OLED Professional Edition panel",
                    "360° Soundscape Pro with upward-firing speakers",
                    "HCX Pro AI Processor",
                    "Dolby Vision IQ and Dolby Atmos",
                    "Filmmaker Mode with Intelligent Sensing",
                    "My Home Screen 6.0",
                    "4 HDMI ports with HDMI 2.1 features",
                    "Game Mode Extreme with low latency",
                    "Voice control compatibility"
                ], 
                "image": "panasonic_jz2000_oled.jpg"
            },
            {
                "name": "Toshiba Fire TV", 
                "brand": "Toshiba", 
                "price": 499, 
                "specifications": [
                    "55-inch 4K UHD display (3840 x 2160)",
                    "Direct LED backlighting",
                    "Dolby Vision HDR and HDR10",
                    "DTS Virtual:X audio",
                    "Fire TV built-in",
                    "Alexa Voice Remote included",
                    "60Hz refresh rate",
                    "Auto Low Latency Mode for gaming",
                    "4 HDMI ports, 2 USB ports",
                    "Bluetooth audio streaming"
                ], 
                "image": "toshiba_fire_tv.jpg"
            }
        ]
    }
]

# Insert new data into MongoDB
collection.insert_many(data)
print("✅ Database has been populated successfully!")