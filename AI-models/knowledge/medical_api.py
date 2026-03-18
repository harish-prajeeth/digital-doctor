import requests

def fetch_medical_knowledge(query):
    """
    Simulates fetching real-time medical data from CDC/WHO indexing or 
    public APIs like PubMed or Wikipedia.
    """
    # For a production system this would hit a live endpoint 
    # e.g., using a REST API from CDC or a dedicated healthcare graph.
    
    # Simple Mock: 
    # In reality, this would be: requests.get(f"https://api.cdc.gov/search?q={query}")
    mock_responses = {
        "vaccine": "According to the CDC, vaccines are safe and effective. They undergo rigorous testing.",
        "malaria": "WHO states: Malaria is a life-threatening disease caused by parasites transmitted to people through the bites of infected female Anopheles mosquitoes.",
        "monkeypox": "CDC notes that Mpox (monkeypox) is an infectious disease caused by the monkeypox virus that can occur in certain animals, including humans.",
    }
    
    for key, val in mock_responses.items():
        if key in query.lower():
            return f"🏥 [Real Medical Source]: {val}"
            
    # Default mock fetch
    return "🏥 [Medical Source API]: Our databases (WHO/CDC) suggest that for specific novel symptoms, consulting your local healthcare provider is the safest option. No exact match found in recent bulletins."
