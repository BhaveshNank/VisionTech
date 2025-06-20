from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({"message": "Flask is working on Vercel!", "status": "success"})

@app.route('/test')
def test():
    return jsonify({"message": "Test endpoint working", "status": "success", "route": "/test"})

@app.route('/api/simple')
def api_simple():
    return jsonify({"message": "Simple API working", "status": "success", "route": "/api/simple"})

@app.route('/api/test')
def api_test():
    return jsonify({"message": "API test working", "status": "success", "route": "/api/test"})

# Catch all other routes for debugging
@app.route('/<path:path>')
def catch_all(path):
    return jsonify({
        "message": f"Route /{path} accessed", 
        "status": "success", 
        "available_routes": ["/", "/test", "/api/simple", "/api/test"]
    })

if __name__ == '__main__':
    app.run(debug=True)