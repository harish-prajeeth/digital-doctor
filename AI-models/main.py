from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import uvicorn

from symptom_prediction.model import predict_disease
from report_analysis.pdf_analyzer import analyze_pdf_text
from chatbot.medical_chatbot import generate_response
from voice.voice_handler import speech_to_text_from_file, text_to_speech_to_file

import os
import shutil
import uuid
import json

app = FastAPI(title="AI Medical Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load disease info for the knowledge retrieval feature
disease_info_path = os.path.join(os.path.dirname(__file__), 'knowledge', 'disease_info.json')
with open(disease_info_path, 'r') as f:
    DISEASE_KNOWLEDGE = json.load(f)

class SymptomRequest(BaseModel):
    symptoms: List[str]

class ChatRequest(BaseModel):
    message: str

class ReportRequest(BaseModel):
    fileData: str
    fileName: str

@app.get("/health")
def health_check():
    return {"status": "AI Service is running"}

@app.post("/predict-disease")
def predict(request: SymptomRequest):
    try:
        result = predict_disease(request.symptoms)
        return {"prediction": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-report")
def analyze_report(request: ReportRequest):
    try:
        result = analyze_pdf_text(request.fileData)
        return {"analysis": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/disease-info/{disease_name}")
def get_disease_info(disease_name: str):
    info = DISEASE_KNOWLEDGE.get(disease_name)
    if not info:
        raise HTTPException(status_code=404, detail="Disease info not found")
    return info

@app.get("/metrics")
def get_metrics():
    from symptom_prediction.model import get_model_metrics
    return get_model_metrics()

@app.post("/chat")
def chat(request: ChatRequest):
    try:
        response = generate_response(request.message)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from fastapi.responses import FileResponse

@app.post("/voice-chat")
async def voice_chat(audio: UploadFile = File(...)):
    try:
        # Save temp audio file from user
        temp_input_path = f"temp_{uuid.uuid4().hex}.wav"
        with open(temp_input_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)
            
        # 1. Speech to Text
        user_text = speech_to_text_from_file(temp_input_path)
        
        # Cleanup input audio
        if os.path.exists(temp_input_path):
            os.remove(temp_input_path)
            
        # 2. Get Chatbot Response
        bot_text_response = generate_response(user_text)
        
        # 3. Text to Speech
        output_audio_path = text_to_speech_to_file(bot_text_response)
        
        # We can return the file directly or a JSON with text + URL.
        # Returning JSON for simplicity, the frontend can fetch the audio if needed, 
        # or we return the audio file with a custom header for the text.
        return FileResponse(
            path=output_audio_path,
            media_type="audio/mpeg",
            headers={"X-Transcript": user_text, "X-Bot-Response": bot_text_response}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
