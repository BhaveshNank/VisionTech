from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/hello')
def hello():
    return jsonify({"message": "Hello from Vercel!", "status": "working"})

@app.route('/api/test')
def test():
    return jsonify({"message": "Simple test working", "status": "success"})

# For Vercel
def handler(request):
    return app(request.environ, request.start_response)

if __name__ == '__main__':
    app.run(debug=True)