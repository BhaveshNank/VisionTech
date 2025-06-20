from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    # Route all requests through Flask
    if path == '':
        return jsonify({"message": "Flask is working on Vercel!", "status": "success", "route": "/"})
    elif path == 'test':
        return jsonify({"message": "Test endpoint working", "status": "success", "route": "/test"})
    elif path == 'api/simple':
        return jsonify({"message": "Simple API working", "status": "success", "route": "/api/simple"})
    elif path == 'api/test':
        return jsonify({"message": "API test working", "status": "success", "route": "/api/test"})
    elif path.startswith('api/'):
        return jsonify({"message": f"API route /{path} accessed", "status": "success", "route": f"/{path}"})
    else:
        return jsonify({
            "message": f"Route /{path} accessed", 
            "status": "success", 
            "route": f"/{path}",
            "method": request.method,
            "available_routes": ["/", "/test", "/api/simple", "/api/test"]
        })

if __name__ == '__main__':
    app.run(debug=True)