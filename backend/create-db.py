import sqlite3
import json
import hashlib

def create_database():
    print("Reading products.json...")
    with open("products.json", "r") as f:
        products = json.load(f)

    print("Connecting to database...")
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    print("Dropping and creating tables...")

    # Drop and recreate product table
    cursor.execute("DROP TABLE IF EXISTS products")
    cursor.execute("""
        CREATE TABLE products (
            id INTEGER PRIMARY KEY,
            name TEXT,
            description TEXT,
            category TEXT,
            price REAL,
            subcategory TEXT,
            type TEXT
        )
    """)

    # Keep chat_history if exists (optional)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_message TEXT,
            bot_reply TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Users table for authentication
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    """)

    print("Inserting product data...")
    for product in products:
        cursor.execute("""
            INSERT INTO products (id, name, description, category, price, subcategory, type)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            product["id"],
            product["name"],
            product["description"],
            product["category"],
            product["price"],
            product.get("subcategory", "Unknown"),
            product.get("type", "Unknown")
        ))

    conn.commit()
    conn.close()
    print("✅ Database created successfully!")

if __name__ == "__main__":
    print("Running create_database()...")
    create_database()
