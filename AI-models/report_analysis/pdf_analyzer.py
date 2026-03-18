import base64
import io
import PyPDF2
from transformers import pipeline

# Load a lighter summarization model from Hugging Face
# fallback to "sshleifer/distilbart-cnn-12-6" which is small, or standard summarizer.
# For a real medical assistant we'd use bioBERT, but standard BART works for demo.
# Note: Initial loading of pipeline will download ~1.2GB model if not cached.
try:
    summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")
except Exception as e:
    print(f"Warning: Could not load HuggingFace pipeline. {e}")
    summarizer = None


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
    
    # Hugging Face Summarization
    if summarizer and len(text) > 50:
        try:
            # chunk text to max 500 chars to avoid memory overload for local demo
            chunk = text[:1000]
            result = summarizer(chunk, max_length=50, min_length=10, do_sample=False)
            summary_result = result[0]['summary_text']
        except Exception as e:
            print(f"Summarization error: {e}")
            summary_result = f"Report mentions: {', '.join(found_keywords)}"
    else:
        if found_keywords:
             summary_result = f"Report mentions: {', '.join(found_keywords)}."
             
    # Create an "AI Explanation" mimicking a real medical assistant
    mock_explanation = "Normal values found."
    if "hemoglobin" in found_keywords:
        mock_explanation = "Low hemoglobin detected. Possible condition: Anemia. Recommendation: Increase iron intake."
    elif "glucose" in found_keywords:
        mock_explanation = "High glucose detected. Possible condition: Pre-diabetes. Recommendation: Limit sugar."

    return {
        "text_preview": text[:200] + "..." if len(text) > 200 else text,
        "key_terms": found_keywords,
        "summary": summary_result,
        "ai_explanation": mock_explanation,
        "model_used": "Hugging Face Transformers"
    }
