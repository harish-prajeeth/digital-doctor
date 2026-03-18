import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Stethoscope, ShieldCheck, HeartPulse } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'patient' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = `http://localhost:5000/api/auth/${isLogin ? 'login' : 'register'}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.replace('/dashboard');
      } else {
        alert(data.message || 'Error occurred');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Is the backend running?');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '80vh', gap: '2rem', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      
      {/* Left Column: Illustration side */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem', display: window.innerWidth < 768 ? 'none' : 'flex' }}
      >
        <div style={{ position: 'relative', width: '300px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Simple CSS-based geometric illustration to avoid external image dependencies */}
            <div style={{ position: 'absolute', width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: '50%', opacity: 0.2, filter: 'blur(30px)' }}></div>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} style={{ position: 'absolute', width: '250px', height: '250px', border: '2px dashed var(--primary)', borderRadius: '50%', opacity: 0.5 }}></motion.div>
            <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '50%', boxShadow: 'var(--glass-shadow)', position: 'relative', zIndex: 10 }}>
                 <Stethoscope size={80} color="var(--primary)" />
            </div>
            
            {/* Floating Badges */}
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} style={{ position: 'absolute', top: '10%', right: '0', background: 'var(--surface)', padding: '0.75rem', borderRadius: '1rem', boxShadow: 'var(--glass-shadow)' }}>
                <ShieldCheck size={24} color="var(--secondary)" />
            </motion.div>
            <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }} style={{ position: 'absolute', bottom: '10%', left: '0', background: 'var(--surface)', padding: '0.75rem', borderRadius: '1rem', boxShadow: 'var(--glass-shadow)' }}>
                <HeartPulse size={24} color="var(--danger)" />
            </motion.div>
        </div>
        <h2 style={{ marginTop: '2rem', color: 'var(--primary)' }}>Smarter Healthcare</h2>
        <p style={{ color: 'var(--text-muted)' }}>Sign in to access your AI health diagnostic metrics, report history, and voice assistant trends securely.</p>
      </motion.div>

      {/* Right Column: Auth Form */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        className="glass-panel"
        style={{ flex: 1, maxWidth: '450px', width: '100%' }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-main)' }}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {!isLogin && (
            <input 
              type="text" 
              placeholder="Name" 
              required 
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          )}
          {!isLogin && (
            <div className="form-group" style={{ background: 'rgba(0,0,0,0.03)', padding: '1rem', borderRadius: '12px' }}>
                <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block', fontWeight: 600 }}>I am registering as a:</label>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {['patient', 'doctor', 'admin'].map(r => (
                        <label key={r} style={{ 
                            display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                            padding: '0.5rem 0.75rem', borderRadius: '8px', background: formData.role === r ? 'var(--primary)' : 'white',
                            color: formData.role === r ? 'white' : 'var(--text-main)', border: '1px solid var(--border)',
                            transition: 'all 0.2s', fontSize: '0.85rem', textTransform: 'capitalize'
                        }}>
                            <input 
                                type="radio" 
                                name="role" 
                                value={r} 
                                checked={formData.role === r}
                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                                style={{ display: 'none' }}
                            />
                            {r}
                        </label>
                    ))}
                </div>
            </div>
          )}
          <input 
            type="email" 
            placeholder="Email" 
            required 
            className="form-control"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <input 
            type="password" 
            placeholder="Password" 
            required 
            className="form-control"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          <button type="submit" className="btn btn-primary hover-glow" disabled={loading} style={{ width: '100%', padding: '1rem', marginTop: '1rem' }}>
            {loading ? <span className="loading-pulse">Processing...</span> : (isLogin ? 'Login Securely' : 'Register Securely')}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)', fontWeight: 500 }} onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
