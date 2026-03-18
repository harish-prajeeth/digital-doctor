import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, HeartPulse } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="animate-fade-in" style={{ padding: '2rem 0' }}>
      <div className="text-center" style={{ marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3.5rem', background: '-webkit-linear-gradient(45deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Your AI Health Companion
        </h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Analyze symptoms, understand medical reports, and get instant health insights powered by advanced Artificial Intelligence.
        </p>
        <div className="d-flex justify-center gap-4 text-center" style={{ justifyContent: 'center'}}>
          <Link to="/diagnosis" className="btn btn-primary hover-glow">Try Symptom Checker</Link>
          <Link to="/reports" className="btn btn-secondary hover-glow">Upload Report</Link>
        </div>
      </div>

      <div className="d-flex justify-between gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div className="glass-panel text-center card-lift">
          <div style={{ background: '#e0e7ff', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--primary)' }}>
            <Zap size={28} />
          </div>
          <h3>Instant Analysis</h3>
          <p className="mt-2">Our AI models process your symptoms and reports in milliseconds to give you immediate insights.</p>
        </div>
        <div className="glass-panel text-center card-lift">
          <div style={{ background: '#d1fae5', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--secondary)' }}>
            <ShieldCheck size={28} />
          </div>
          <h3>Privacy First</h3>
          <p className="mt-2">Your medical data is processed securely and with strict confidentiality.</p>
        </div>
        <div className="glass-panel text-center card-lift">
          <div style={{ background: '#fee2e2', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--danger)' }}>
            <HeartPulse size={28} />
          </div>
          <h3>24/7 Availability</h3>
          <p className="mt-2">Access health insights and chat with our medical bot anytime, anywhere.</p>
        </div>
      </div>
      <div style={{ marginTop: '4rem', padding: '2.5rem', background: 'var(--bg-gradient)', borderRadius: '1.5rem', border: '1px solid var(--border)', boxShadow: 'var(--glass-shadow)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <HeartPulse size={30} /> Tip of the Day
        </h2>
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
            <motion.p 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-main)', fontStyle: 'italic', lineHeight: 1.6 }}
            >
                "{[
                    "Drink at least 2–3 liters of water daily to maintain hydration and cognitive function.",
                    "Integrate 30 minutes of physical activity into your routine to boost your heart health.",
                    "Prioritize 7-9 hours of restful sleep to allow your immune system to recharge.",
                    "Practice mindful breathing for 5 minutes daily to reduce stress levels.",
                    "Include a variety of colorful vegetables in your meals for a diverse nutrient profile."
                ][new Date().getDay() % 5]}"
            </motion.p>
        </div>
        
        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
            <h4 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-muted)' }}>Foundational Health Pillars</h4>
            <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <li style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>💧 <strong>Hydration:</strong> Essential for energy and brain health.</li>
              <li style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>🚶‍♂️ <strong>Activity:</strong> Brisk walking builds heart strength.</li>
              <li style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>😴 <strong>Sleep:</strong> Crucial for immunity and mental clarity.</li>
            </ul>
        </div>
      </div>
    </div>
  );
}
