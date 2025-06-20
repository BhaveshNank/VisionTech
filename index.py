import os
import sys

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app import app
    print("✅ Successfully imported Flask app")
except Exception as e:
    print(f"❌ Error importing app: {e}")
    raise

# This is the entry point for Vercel
if __name__ == "__main__":
    app.run()