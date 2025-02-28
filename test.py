# import requests

# url = "http://127.0.0.1:5000/chat"  # Your Flask endpoint
# data = {"message": "I need a laptop"}  # The expected JSON request

# headers = {"Content-Type": "application/json"}

# response = requests.post(url, json=data, headers=headers)

# print(response.status_code)
# print(response.json())


# Checking gemini model 
import requests
import json

# Replace this with your actual Gemini API key
API_KEY = "GEMINI_KEY_HERE"

# Gemini API endpoint
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={API_KEY}"

# Sample payload to check the model
payload = {
    "contents": [
        {
            "role": "user",
            "parts": [
                {
                    "text": "Tell me which Gemini model is being used for this request."
                }
            ]
        }
    ]
}

headers = {"Content-Type": "application/json"}

# Send request to Gemini API
response = requests.post(ENDPOINT, headers=headers, json=payload)

# Check response
if response.status_code == 200:
    response_data = response.json()
    print("✅ Response from Gemini API:")
    print(json.dumps(response_data, indent=4))
else:
    print(f"❌ Error: Unable to fetch model details. Status Code: {response.status_code}")
    print(response.text)
