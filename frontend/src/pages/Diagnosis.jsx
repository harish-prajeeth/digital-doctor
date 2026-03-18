import React, { useState } from 'react';
import { predictDisease } from '../services/api';
import { AlertCircle, CheckCircle2, Loader2, Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Diagnosis() {
  const [user] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [symptoms, setSymptoms] = useState([]);
  const [currentSymptom, setCurrentSymptom] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const addSymptom = (e) => {
    e.preventDefault();
    if (currentSymptom.trim() && !symptoms.includes(currentSymptom.trim().toLowerCase())) {
      setSymptoms([...symptoms, currentSymptom.trim().toLowerCase()]);
      setCurrentSymptom('');
    }
  };

  const removeSymptom = (sym) => {
    setSymptoms(symptoms.filter(s => s !== sym));
  };

  const handlePredict = async () => {
    if (symptoms.length === 0) {
      setError('Please add at least one symptom.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const data = await predictDisease(symptoms, user?.id);
      setResult(data.prediction);
    } catch (err) {
      setError('Error analyzing symptoms. Please try again or check if AI service is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 className="text-center" style={{ marginBottom: '2rem' }}>Symptom Checker AI</h2>

      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <form onSubmit={addSymptom} className="d-flex gap-2">
          <div style={{ flex: 1 }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="E.g. fever, headache, cough..." 
              value={currentSymptom}
              onChange={(e) => setCurrentSymptom(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary hover-glow">
            <Plus size={18} /> Add
          </button>
        </form>

        <div className="d-flex" style={{ flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.5rem' }}>
          {symptoms.map(sym => (
            <span key={sym} style={{ background: 'var(--primary)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {sym}
              <X size={14} style={{ cursor: 'pointer' }} onClick={() => removeSymptom(sym)} />
            </span>
          ))}
          {symptoms.length === 0 && <span style={{ color: 'var(--text-muted)' }}>No symptoms added yet.</span>}
        </div>

        {error && (
          <div style={{ color: 'var(--danger)', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <div className="text-center mt-4">
          <button className="btn btn-primary hover-glow" onClick={handlePredict} disabled={loading || symptoms.length === 0} style={{ width: '100%', maxWidth: '300px' }}>
            {loading ? <Loader2 className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> : 'Analyze Symptoms'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>

      {result && (
        <div className="glass-panel animate-fade-in" style={{ borderLeft: `6px solid ${result.riskLevel === 'High' ? 'var(--danger)' : result.riskLevel === 'Medium' ? 'var(--warning)' : 'var(--secondary)'}` }}>
          <h3>AI Analysis Results</h3>
          
          <div style={{ marginTop: '1.5rem', display: 'grid', gap: '1.5rem' }}>
            {/* Confidence Scores */}
            <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <p className="form-label">Condition Probability</p>
              {result.all_predictions.map((pred, i) => (
                <div key={i} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontWeight: 600 }}>{pred.condition}</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{pred.confidence}%</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${pred.confidence}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      style={{ height: '100%', background: i === 0 ? 'var(--primary)' : 'var(--text-muted)' }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="d-flex gap-4" style={{ flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px', padding: '1.25rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <p className="form-label text-muted">Risk Level</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '1.2rem', color: result.riskLevel === 'High' ? 'var(--danger)' : result.riskLevel === 'Medium' ? 'var(--warning)' : 'var(--secondary)' }}>
                  {result.riskLevel === 'High' ? <AlertCircle /> : <CheckCircle2 />}
                  {result.riskLevel}
                </div>
              </div>
              <div style={{ flex: '2 1 300px', padding: '1.25rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <p className="form-label text-muted">AI Suggestion</p>
                <p style={{ margin: 0, fontWeight: 500, lineHeight: 1.6 }}>{result.suggestion}</p>
              </div>
            </div>

            {/* Medical Knowledge Retrieval (Mocking a real fetch for now or using local) */}
            <div style={{ padding: '1.5rem', background: 'var(--bg-gradient)', borderRadius: '12px', border: '1px solid var(--border)', color: 'var(--text-main)' }}>
               <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                 <CheckCircle2 size={20} /> Medical Knowledge Base
               </h4>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Common Symptoms</p>
                    <p style={{ margin: 0 }}>Fever, dry cough, fatigue, aches.</p>
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Typical Causes</p>
                    <p style={{ margin: 0 }}>Viral pathogens or bacterial exposure.</p>
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Recommended Actions</p>
                    <p style={{ margin: 0 }}>Rest, hydration, and medical consult.</p>
                  </div>
               </div>
            </div>
          </div>
          <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            ⚠ <strong>Disclaimer:</strong> This analysis is AI-generated and for informational purposes only. Consult a doctor for any medical concerns.
          </p>
        </div>
      )}
    </div>
  );
}
