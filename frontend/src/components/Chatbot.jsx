import React, { useState, useRef, useEffect } from 'react';
import { chatWithBot } from '../services/api';
import { Send, X, User, Bot, Loader2, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Chatbot({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Load History from Backend
    const loadHistory = async () => {
        if (!user) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/chat/history/${user.id}`);
            if (res.ok) {
                const data = await res.json();
                if (data.length > 0) {
                    // Flatten messages from the latest session
                    setMessages(data[0].messages);
                } else {
                    setMessages([{ role: 'bot', text: 'Hello! I am your AI Medical Assistant. How can I help you today?', sender: 'bot' }]);
                }
            }
        } catch (e) {
            console.error("History load failed", e);
        }
    };
    loadHistory();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    const newUserMsg = { sender: 'user', text: userMsg, role: 'user' };
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setLoading(true);

    try {
      // 1. Save User Message to Backend
      await fetch(`${import.meta.env.VITE_API_URL || '/api'}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, sender: 'user', text: userMsg })
      });

      // 2. Get AI Response
      const data = await chatWithBot(userMsg);
      
      // 3. Simulate "AI is typing"
      setTyping(true);
      setLoading(false);
      setTimeout(async () => {
          setTyping(false);
          const botMsg = { sender: 'bot', text: data.response, role: 'bot' };
          setMessages(prev => [...prev, botMsg]);

          // 4. Save Bot Message
          await fetch(`${import.meta.env.VITE_API_URL || '/api'}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, sender: 'bot', text: data.response })
          });
      }, 1500);

    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', sender: 'bot', text: 'Sorry, I am having trouble connecting to the server.' }]);
      setLoading(false);
    }
  };

  const handleQuickAction = (text) => {
    setInput(text);
    // Auto-submit after a tiny delay for better UX
    setTimeout(() => {
        const fakeEvent = { preventDefault: () => {} };
        // We need to pass the text directly because state might not update fast enough
        handleSendManual(text);
    }, 100);
  };

  const handleSendManual = async (manualInput) => {
    if (!manualInput.trim()) return;
    const userMsg = manualInput.trim();
    const newUserMsg = { sender: 'user', text: userMsg, role: 'user' };
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setLoading(true);

    try {
      await fetch(`${import.meta.env.VITE_API_URL || '/api'}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, sender: 'user', text: userMsg })
      });
      const data = await chatWithBot(userMsg);
      setTyping(true);
      setLoading(false);
      setTimeout(async () => {
          setTyping(false);
          const botMsg = { sender: 'bot', text: data.response, role: 'bot' };
          setMessages(prev => [...prev, botMsg]);
          await fetch(`${import.meta.env.VITE_API_URL || '/api'}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, sender: 'bot', text: data.response })
          });
      }, 1500);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', sender: 'bot', text: 'Connection error.' }]);
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      style={{
      position: 'fixed',
      bottom: '90px',
      right: '2rem',
      width: '380px',
      height: '550px',
      background: 'white',
      borderRadius: '20px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      zIndex: 1000,
      border: '1px solid #e5e7eb'
    }}>
      {/* Header */}
      <div style={{
        background: 'var(--primary)',
        color: 'white',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: '700' }}>
          <Bot size={22} /> AI Medical Agent
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: msg.sender === 'user' ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'flex-start',
                    flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
                }}
              >
                <div style={{
                  width: '34px', height: '34px', borderRadius: '50%',
                  background: msg.sender === 'user' ? 'var(--secondary)' : 'var(--primary)',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {msg.sender === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div style={{
                  background: msg.sender === 'user' ? '#e0f2fe' : 'white',
                  padding: '0.8rem 1.1rem',
                  borderRadius: '16px',
                  borderTopRightRadius: msg.sender === 'user' ? '4px' : '16px',
                  borderTopLeftRadius: msg.sender === 'bot' ? '4px' : '16px',
                  maxWidth: '80%',
                  fontSize: '0.95rem',
                  color: '#334155',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                  border: '1px solid #f1f5f9'
                }}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
        </AnimatePresence>
        
        {loading && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
             <Loader2 size={16} className="spinner" /> AI is connecting...
          </div>
        )}
        
        {typing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 600 }}
          >
             <Bot size={16} /> AI is typing...
             <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.2, repeat: Infinity }}>.</motion.span>
             <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}>.</motion.span>
             <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}>.</motion.span>
          </motion.div>
        )}

        {messages.length < 3 && !typing && !loading && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {['Check my symptoms', 'Analyze my report', 'What causes headaches?', 'Daily health tips'].map(action => (
                    <button 
                        key={action}
                        onClick={() => handleQuickAction(action)}
                        style={{
                            background: 'white', border: '1px solid var(--primary)', color: 'var(--primary)',
                            padding: '0.4rem 0.8rem', borderRadius: '12px', fontSize: '0.8rem',
                            cursor: 'pointer', transition: 'all 0.2s', fontWeight: 500
                        }}
                        onMouseEnter={(e) => { e.target.style.background = 'var(--primary)'; e.target.style.color = 'white'; }}
                        onMouseLeave={(e) => { e.target.style.background = 'white'; e.target.style.color = 'var(--primary)'; }}
                    >
                        {action}
                    </button>
                ))}
            </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '1.25rem', borderTop: '1px solid #f1f5f9', background: 'white' }}>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Describe your symptoms..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ borderRadius: '24px', padding: '0.8rem 1.4rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}
          />
          <button type="submit" disabled={!input.trim() || loading || typing} style={{
            background: 'var(--primary)', color: 'white', border: 'none',
            width: '48px', height: '48px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: (!input.trim() || loading || typing) ? 'not-allowed' : 'pointer',
            opacity: (!input.trim() || loading || typing) ? 0.6 : 1,
            transition: 'all 0.2s',
            boxShadow: '0 4px 10px rgba(79, 70, 229, 0.2)'
          }}>
            <Send size={20} />
          </button>
        </form>
      </div>

      <style>{`
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </motion.div>
  );
}
