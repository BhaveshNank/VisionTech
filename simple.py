from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({"message": "Flask is working on Vercel!", "status": "success"})

@app.route('/test')
def test():
    return jsonify({"message": "Test endpoint working", "status": "success"})

@app.route('/api/simple')
def api_simple():
    return jsonify({"message": "Simple API working", "status": "success"})

if __name__ == '__main__':
    app.run(debug=True)