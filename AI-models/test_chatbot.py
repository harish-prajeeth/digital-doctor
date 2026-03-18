from chatbot.medical_chatbot import generate_response

def test_queries():
    test_cases = [
        "Hi, how are you?",
        "My head is throbbing with pain",
        "I have a lot of wheezing when I try to breathe",
        "What is normal high blood pressure?",
        "My tummy hurts really badly",
        "I can't smell anything at all",
        "What is the capital of France?" # Should hit fallback
    ]

    print("--- Testing new Medical ML Chatbot ---")
    for query in test_cases:
        print(f"\nUser: {query}")
        response = generate_response(query)
        print(f"Bot : {response}")

if __name__ == "__main__":
    test_queries()
