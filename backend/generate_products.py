import json
import random

# Only electronics category for now
category = "electronics"

# Define subcategories and their types
subcategories = {
    "Smartphone": ["iPhone", "Samsung", "OnePlus", "Google Pixel", "Xiaomi"],
    "Laptop": ["MacBook", "Dell", "HP", "Lenovo", "Asus"],
    "Headphones": ["Bose", "Sony", "Beats", "Sennheiser", "JBL"],
    "Tablet": ["iPad", "Samsung Tab", "Amazon Fire", "Lenovo Tab", "Microsoft Surface"],
}

products = []
product_id = 1

# For each subcategory and type, generate some products
for subcat, types in subcategories.items():
    for typ in types:
        # Generate multiple products per type
        for i in range(1, 5):  # 4 products per type for variety
            name = f"{typ} {subcat} Model {i}"
            description = f"A high-quality {name} in electronics > {subcat} > {typ}."
            price = round(random.uniform(100, 1500), 2)

            products.append({
                "id": product_id,
                "name": name,
                "description": description,
                "category": category,
                "subcategory": subcat,
                "type": typ,
                "price": price
            })
            product_id += 1

with open("products.json", "w") as f:
    json.dump(products, f, indent=2)

print("Γ£à Generated products.json with electronics > subcategory > type hierarchy")
