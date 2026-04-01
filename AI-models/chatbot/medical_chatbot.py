import os
import json
import random
import re
import sys

# Add parent directory to path so we can import knowledge.medical_api
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from knowledge.medical_api import fetch_medical_knowledge

# Load intents data
data_file_path = os.path.join(os.path.dirname(__file__), 'medical_chatbot_data.json')
with open(data_file_path, 'r', encoding='utf-8') as f:
    intents = json.load(f)

def clean_text(text):
    return re.sub(r'[^a-zA-Z0-9\s]', '', text.lower()).strip()

def check_emergency(message):
    dangerous_keywords = [
        r"chest pain.*breathing", r"breathing.*chest pain",
        r"can't breathe", r"heart attack", r"stroke",
        r"coughing blood", r"severe bleeding", r"unconscious",
        r"suicide", r"kill myself", r"severe allergic"
    ]
    for pattern in dangerous_keywords:
        if re.search(pattern, message.lower()):
            return "⚠️ Possible emergency detected. Please contact emergency services (e.g., 911) or visit the nearest emergency room immediately."
    return None

def generate_response(user_message):
    message = clean_text(user_message)
    
    # 1. Check for Emergency
    emergency_response = check_emergency(user_message)
    if emergency_response:
        return emergency_response
    
    # 2. Simple Keyword Matching (Alternative to Scikit-Learn TF-IDF)
    best_intent = None
    max_overlap = 0
    
    user_words = set(message.split())
    
    for intent in intents:
        for pattern in intent['patterns']:
            pattern_words = set(clean_text(pattern).split())
            overlap = len(user_words.intersection(pattern_words))
            if overlap > max_overlap:
                max_overlap = overlap
                best_intent = intent
                
    # 3. If a match is found with reasonable overlap, return a response
    if best_intent and max_overlap > 0:
        return random.choice(best_intent['responses'])
    
    # 4. Fallback to Medical API knowledge
    api_response = fetch_medical_knowledge(user_message)
    return f"I'm an AI assistant. {api_response}"
