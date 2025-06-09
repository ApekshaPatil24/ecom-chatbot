from flask import Flask, request, jsonify, session
from flask_cors import CORS
import sqlite3
import hashlib
import re

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # change this to a strong secret in production

# CORS to allow frontend to send cookies for session management
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

def extract_keywords(text):
    # Example: get all words longer than 3 characters
    return [word for word in re.findall(r'\b\w{4,}\b', text.lower())]

def get_db_connection():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    return conn
@app.route('/')
def index():
    return "Ecom Chatbot Flask Backend is Running!"
    

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    hashed_password = hashlib.sha256(password.encode()).hexdigest()

    conn = get_db_connection()
    try:
        conn.execute("INSERT INTO users (email, password) VALUES (?, ?)", (email, hashed_password))
        conn.commit()
        return jsonify({"message": "Registration successful!"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "Email already exists"}), 409
    finally:
        conn.close()

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    conn = get_db_connection()

    # First, check if the email exists
    user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()

    if not user:
        conn.close()
        return jsonify({"error": "Email not found. Please register first."}), 404

    hashed_password = hashlib.sha256(password.encode()).hexdigest()

    if user["password"] != hashed_password:
        conn.close()
        return jsonify({"error": "Incorrect password"}), 401

    conn.close()
    session['user_id'] = user['id']
    session['email'] = user['email']
    return jsonify({"message": "Login successful!"})


@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully!"})

@app.route('/me', methods=['GET'])
def get_current_user():
    if 'user_id' in session:
        return jsonify({"user_id": session['user_id'], "email": session['email']})
    return jsonify({"error": "Not logged in"}), 401



# -------------------- ≡ƒñû Chatbot Route --------------------

def parse_price_filter(text):
    price_pattern = re.compile(r"(under|below|less than|max|max price|<=|<)\s*\$?(\d+)", re.I)
    match = price_pattern.search(text)
    if match:
        return "<=", float(match.group(2))
    price_pattern2 = re.compile(r"(above|over|more than|min|min price|>=|>)\s*\$?(\d+)", re.I)
    match2 = price_pattern2.search(text)
    if match2:
        return ">=", float(match2.group(2))
    return None, None

@app.route("/chat", methods=["POST"])
def chat():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized. Please log in."}), 401

    user_input = request.json.get("message")
    subcategory = request.json.get("subcategory")
    typ = request.json.get("type")

    if not user_input:
        return jsonify({"error": "No message provided"}), 400

    keywords = extract_keywords(user_input)
 # This line must be at the same indent level as above lines
    price_operator, price_value = parse_price_filter(user_input)

    products = search_products(
        keywords=keywords,
        category="electronics",
        subcategory=subcategory,
        typ=typ,
        price_operator=price_operator,
        price_value=price_value,
    )

    if products:
        product_info_text = "Here are some products matching your query:\n" + "\n".join(
            [f"- {p['name']}: {p['description']} (Price: Γé╣{p['price']})" for p in products]
        )
    else:
        product_info_text = ""

    if not keywords and not subcategory and not typ:
        reply = "Hi! Ask me about a product, like 'smartphones' or ' headphones' or any electronic iteam from above category."
    elif products:
        reply = f"I found {len(products)} products related to your search.\n\n{product_info_text}"
    else:
        reply = "Sorry, no matching products found. Try different keywords or filters."

    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO chat_history (user_message, bot_reply) VALUES (?, ?)",
        (user_input, reply)
    )
    conn.commit()
    conn.close()

    return jsonify({"reply": reply, "products": products})

# -------------------- ≡ƒÆ¼ Chat Utilities --------------------

def search_products(keywords, category, subcategory=None, typ=None, price_operator=None, price_value=None):
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    query = "SELECT * FROM products WHERE category = ?"
    values = [category]

    if subcategory and subcategory.lower() != "all":
        query += " AND subcategory = ?"
        values.append(subcategory)

    if typ and typ.lower() != "all":
        query += " AND type = ?"
        values.append(typ)

    if price_operator and price_value is not None:
        query += f" AND price {price_operator} ?"
        values.append(price_value)

    if keywords:
        keyword_clauses = " OR ".join(["name LIKE ? OR description LIKE ?" for _ in keywords])
        query += " AND (" + keyword_clauses + ")"
        for word in keywords:
            values.extend([f"%{word}%", f"%{word}%"])

    cursor.execute(query, values)
    results = cursor.fetchall()
    conn.close()

    return [
        {
            "id": row[0],
            "name": row[1],
            "description": row[2],
            "category": row[3],
            "subcategory": row[5],
            "type": row[6],
            "price": row[4]
        }
        for row in results
    ]

@app.route("/chat/history", methods=["GET"])
def get_chat_history():
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    cursor.execute("SELECT user_message, bot_reply, timestamp FROM chat_history ORDER BY id ASC")
    rows = cursor.fetchall()
    conn.close()

    history = [
        {"user_message": row[0], "bot_reply": row[1], "timestamp": row[2]}
        for row in rows
    ]
    return jsonify(history)

@app.route("/chat/reset", methods=["POST"])
def reset_chat():
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    cursor.execute("DELETE FROM chat_history")
    conn.commit()
    conn.close()
    return jsonify({"message": "Chat history cleared"})

@app.route("/order", methods=["POST"])
def place_order():
    data = request.json
    user_email = data.get("userEmail")
    cart = data.get("cart")

    # Optionally: Save to DB or simulate
    print(f"User {user_email} placed an order:", cart)

    return jsonify({"message": f"≡ƒ¢ì∩╕Å Order confirmed for {len(cart)} items! Thank you."})
# -------------------- ≡ƒÜÇ Run App --------------------
if __name__ == "__main__":
    app.run(debug=True)
