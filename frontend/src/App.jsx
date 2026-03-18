import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Activity, Stethoscope, FileText, MessageSquare, Home as HomeIcon } from 'lucide-react';
import Home from './pages/Home';
import Diagnosis from './pages/Diagnosis';
import Reports from './pages/Reports';
import Chatbot from './components/Chatbot';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import AiChatPage from './pages/AiChatPage';
import { User, Moon, Sun, Mic, AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// Wrapper for page transitions
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

function App() {
  const [chatOpen, setChatOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Apply dark mode to body element globally
  React.useEffect(() => {
    if (darkMode) document.body.classList.add('dark');
    else document.body.classList.remove('dark');
  }, [darkMode]);

  return (
    <Router>
      <div className="app-container">
        {/* Navigation */}
        <nav className="navbar">
          <Link to="/" className="nav-logo">
            <Activity color="var(--primary)" size={28} />
            <span>Digital Doctor</span>
          </Link>
          <div className="nav-links d-flex align-center gap-4">
            <Link to="/" className="nav-link d-flex align-center gap-2"><HomeIcon size={18} /> Home</Link>
            <Link to="/diagnosis" className="nav-link d-flex align-center gap-2"><Stethoscope size={18} /> Symptom AI</Link>
            <Link to="/reports" className="nav-link d-flex align-center gap-2"><FileText size={18} /> Reports</Link>
            <Link to="/ai-chat" className="nav-link d-flex align-center gap-2"><Mic size={18} /> Voice AI</Link>
            <Link to="/dashboard" className="nav-link d-flex align-center gap-2"><User size={18} /> Dashboard</Link>
            <button onClick={() => setDarkMode(!darkMode)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="main-content">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
              <Route path="/auth" element={<PageWrapper><Auth /></PageWrapper>} />
              <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
              <Route path="/diagnosis" element={<PageWrapper><Diagnosis /></PageWrapper>} />
              <Route path="/reports" element={<PageWrapper><Reports /></PageWrapper>} />
              <Route path="/ai-chat" element={<PageWrapper><AiChatPage /></PageWrapper>} />
            </Routes>
          </AnimatePresence>
        </main>
        
        {/* Global Medical Disclaimer Footer */}
        <footer style={{ 
          padding: '2.5rem 1rem', 
          background: 'var(--glass-bg)', 
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid var(--glass-border)', 
          textAlign: 'center',
          marginTop: 'auto'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              color: 'var(--warning)', 
              fontWeight: 700,
              marginBottom: '0.75rem',
              fontSize: '0.9rem'
            }}>
              <AlertCircle size={18} /> MEDICAL DISCLAIMER
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              ⚠ <strong>Notice:</strong> This AI system provides informational guidance only. 
              It does not replace professional medical advice. 
              Consult a qualified healthcare provider for diagnosis or treatment.
            </p>
            <p style={{ marginTop: '1.25rem', fontSize: '0.75rem', color: 'var(--text-light)', opacity: 0.7 }}>
              © 2026 AI Medical Intelligence System. Healthcare Research Prototype.
            </p>
          </div>
        </footer>

        {/* Global Chatbot Floating Action */}
        <div 
          className="chatbot-fab hover-glow" 
          onClick={() => setChatOpen(!chatOpen)}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            background: 'var(--primary)',
            color: 'white',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
            zIndex: 1000,
            transition: 'transform 0.3s ease'
          }}
        >
          <MessageSquare size={24} />
        </div>

        {chatOpen && <Chatbot onClose={() => setChatOpen(false)} />}
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;
