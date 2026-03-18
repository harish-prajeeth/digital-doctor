import speech_recognition as sr
import pyttsx3
import os
import uuid

# Initialize TTS Engine
engine = pyttsx3.init()
voices = engine.getProperty('voices')
# Try to set a female voice for the assistant
for voice in voices:
    if "female" in voice.name.lower() or "zira" in voice.name.lower():
        engine.setProperty('voice', voice.id)
        break

engine.setProperty('rate', 150) # Speed of speech

def speech_to_text_from_file(file_path):
    """
    Converts speech from an audio file (.wav format) into text using Google STT.
    """
    recognizer = sr.Recognizer()
    try:
        with sr.AudioFile(file_path) as source:
            audio_data = recognizer.record(source)
            # Use Google Speech Recognition
            text = recognizer.recognize_google(audio_data)
            return text
    except sr.UnknownValueError:
        return "Sorry, I could not understand the audio."
    except sr.RequestError as e:
        return f"Could not request results from Google Speech Recognition service; {e}"
    except Exception as e:
        return f"Error processing audio file: {e}"

def text_to_speech_to_file(text, output_dir="temp_audio"):
    """
    Converts text to speech and saves it as a .mp3 or .wav file.
    Returns the file path.
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    filename = f"response_{uuid.uuid4().hex}.mp3"
    file_path = os.path.join(output_dir, filename)
    
    # Save the generated speech to a file
    engine.save_to_file(text, file_path)
    engine.runAndWait()
    
    return file_path
