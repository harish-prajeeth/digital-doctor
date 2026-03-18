import os
import json
import random
import re
import sys
import os

# Add parent directory to path so we can import knowledge.medical_api
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from knowledge.medical_api import fetch_medical_knowledge

# Load intents data
data_file_path = os.path.join(os.path.dirname(__file__), 'medical_chatbot_data.json')
with open(data_file_path, 'r', encoding='utf-8') as f:
    intents = json.load(f)

# Extract corpus of patterns and map them to their corresponding intent tags
corpus = []
tags = []
for intent in intents:
    for pattern in intent['patterns']:
        corpus.append(pattern.lower())
        tags.append(intent['tag'])

# Initialize and fit TF-IDF Vectorizer
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(corpus)

def check_emergency(message):
    # Phase 1: Emergency Detection Logic
    dangerous_keywords = [
        r"chest pain.*breathing", r"breathing.*chest pain",
        r"can't breathe", r"heart attack", r"stroke",
        r"coughing blood", r"severe bleeding", r"unconscious",
        r"suicide", r"kill myself", r"severe allergic"
    ]
    for pattern in dangerous_keywords:
        if re.search(pattern, message):
            return "⚠️ Possible emergency detected. Please contact emergency services (e.g., 911) or visit the nearest emergency room immediately."
    return None

def generate_response(user_message):
    message = user_message.lower()
    
    # 1. Check for Emergency
    emergency_response = check_emergency(message)
    if emergency_response:
        return emergency_response
    
    # 2. Vectorize the user's message
    message_vec = vectorizer.transform([message])
    
    # 3. Calculate cosine similarity with the whole pattern corpus
    similarities = cosine_similarity(message_vec, X)
    
    # 4. Find the best match
    best_match_idx = similarities.argmax()
    best_match_score = similarities[0, best_match_idx]
    
    # If the score is high enough, return a response from that intent
    confidence_threshold = 0.3
    if best_match_score > confidence_threshold:
        best_tag = tags[best_match_idx]
        for intent in intents:
            if intent['tag'] == best_tag:
                return random.choice(intent['responses'])
    
    # Fallback if no matching pattern is confident enough
    # Call the real medical API
    api_response = fetch_medical_knowledge(message)
    return f"I'm an AI assistant. {api_response}"
