import React, { useState, useRef } from 'react';
import { Mic, Send, Volume2 } from 'lucide-react';

const AiChatPage = () => {
  const [messages, setMessages] = useState([{ sender: 'bot', text: 'Hello! I am your AI Medical Voice Assistant. You can speak or type to me.' }]);
  const [inputStr, setInputStr] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleSendText = async () => {
    if (!inputStr.trim()) return;
    const userMsg = inputStr;
    setInputStr('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_AI_URL || '/ai-service'}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { sender: 'bot', text: data.response }]);
    } catch (e) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Error connecting to AI service.' }]);
    }
    setLoading(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = event => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await sendAudioToBackend(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (e) {
      console.error(e);
      alert('Microphone access denied or not available.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioToBackend = async (blob) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('audio', blob, 'recording.wav');

    try {
      const res = await fetch(`${import.meta.env.VITE_AI_URL || '/ai-service'}/voice-chat`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const transcript = res.headers.get('X-Transcript');
        const botResponse = res.headers.get('X-Bot-Response');
        const audioBlob = await res.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setMessages(prev => [
            ...prev, 
            { sender: 'user', text: `🎤 ${transcript || 'Audio sent'}` },
            { sender: 'bot', text: botResponse || 'Audio response generated', audioUrl }
        ]);
      } else {
        setMessages(prev => [...prev, { sender: 'bot', text: 'Error processing voice.' }]);
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Network error processing voice.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="glass-panel" style={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>
      <h1>Voice AI Assistant</h1>
      
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: 'var(--surface)', borderRadius: '1rem', marginBottom: '1rem', border: '1px solid var(--border)' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left', marginBottom: '1rem' }}>
            <div style={{ display: 'inline-block', padding: '1rem', borderRadius: '1rem', background: msg.sender === 'user' ? 'var(--primary)' : 'var(--border)', color: msg.sender === 'user' ? '#fff' : 'var(--text-main)', maxWidth: '70%' }}>
              {msg.text}
              {msg.audioUrl && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Volume2 size={16} />
                      <audio controls src={msg.audioUrl} style={{ width: '200px', height: '30px' }} autoPlay />
                  </div>
              )}
            </div>
          </div>
        ))}
        {loading && <div style={{ textAlign: 'center', color: 'var(--text-light)' }}><div className="spinner"></div> AI is thinking...</div>}
      </div>

      <div style={{ display: 'flex', gap: '1rem', background: 'var(--surface)', padding: '1rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
        <input 
            type="text" 
            value={inputStr}
            onChange={(e) => setInputStr(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
            placeholder="Type your message..."
            style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)' }}
        />
        <button onClick={handleSendText} className="btn btn-primary"><Send size={18} /></button>
        <button 
            onMouseDown={startRecording} 
            onMouseUp={stopRecording} 
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            className={`btn ${isRecording ? 'btn-danger' : 'btn-secondary'}`}
            style={{ background: isRecording ? 'var(--danger)' : '', color: isRecording ? '#fff' : '' }}
        >
            <Mic size={18} /> {isRecording ? 'Recording...' : 'Hold to Speak'}
        </button>
      </div>
    </div>
  );
};

export default AiChatPage;
