import spacy

nlp = spacy.load("en_core_web_sm")

def extract_keywords(query):
    doc = nlp(query.lower())
    return [token.text for token in doc if token.is_alpha and not token.is_stop]

def is_product_query(message):
    product_keywords = ["buy", "find", "show", "need", "want", "search", "product", "price", "phone", "laptop", "tv", "macbook", "headphones"]
    message = message.lower()
    return any(word in message for word in product_keywords)
