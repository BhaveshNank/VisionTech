from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/test')
def test():
    return jsonify({"message": "Flask API is working on Vercel!", "status": "success"})

@app.route('/api/products')
def products():
    return jsonify([
        {"id": "1", "name": "iPhone 16 Pro Max", "price": "$1299"},
        {"id": "2", "name": "MacBook M4 Pro", "price": "$2399"}
    ])

if __name__ == '__main__':
    app.run(debug=True)