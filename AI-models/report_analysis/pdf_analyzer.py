import base64
import io
import PyPDF2

def extract_text_from_pdf_b64(b64_string):
    try:
        if "base64," in b64_string:
            b64_string = b64_string.split("base64,")[1]
            
        pdf_bytes = base64.b64decode(b64_string)
        pdf_file = io.BytesIO(pdf_bytes)
        reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            if page.extract_text():
                text += page.extract_text() + " "
        return text.strip()
    except Exception as e:
        print(f"Error parsing PDF: {e}")
        return ""

def analyze_pdf_text(b64_data):
    text = extract_text_from_pdf_b64(b64_data)
    
    if not text:
        text = str(b64_data)
        
    # Standard keyword extraction as baseline
    keywords = ["glucose", "blood pressure", "cholesterol", "wbc", "rbc", "hemoglobin", "platelets", "hba1c"]
    found_keywords = [kw for kw in keywords if kw.lower() in text.lower()]
    
    summary_result = "No medical terms identified."
    if found_keywords:
        summary_result = f"Report mentions: {', '.join(found_keywords)}."
             
    # Create an "AI Explanation" mimicking a real medical assistant
    mock_explanation = "Normal values found."
    if "hemoglobin" in found_keywords:
        mock_explanation = "Anomalous hemoglobin detected. Possible condition: Anemia. Recommendation: Increase iron intake."
    elif "glucose" in found_keywords:
        mock_explanation = "Elevated glucose detected. Possible condition: Metabolic concern. Recommendation: Limit sugar."

    return {
        "text_preview": text[:200] + "..." if len(text) > 200 else text,
        "key_terms": found_keywords,
        "summary": summary_result,
        "ai_explanation": mock_explanation,
        "model_used": "RuleBased Engine"
    }
