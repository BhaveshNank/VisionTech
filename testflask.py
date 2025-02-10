import requests

url = "http://localhost:5000/chat"
headers = {"Content-Type": "application/json"}
data = {"message": "Hello"}

response = requests.post(url, json=data, headers=headers)
print(response.status_code, response.json())  # Debug Output
