import React, { useState } from 'react';
import { analyzeReport } from '../services/api';
import { UploadCloud, FileText, CheckCircle2, Loader2, FileSearch } from 'lucide-react';

export default function Reports() {
  const [user] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setLoading(true);
    setError('');

    // Read file as base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = reader.result;
        const data = await analyzeReport(base64String, file.name, user?.id);
        setResult(data.analysis);
      } catch (err) {
        setError('Failed to analyze the report. Make sure the file is a readable PDF and backend is running.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => {
      setError('Error reading file.');
      setLoading(false);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 className="text-center" style={{ marginBottom: '2rem' }}>Medical Report Analyzer</h2>

      <div className="glass-panel text-center" style={{ marginBottom: '2rem', padding: '3rem 2rem' }}>
        <div style={{
          border: '2px dashed #cbd5e1',
          borderRadius: '16px',
          padding: '3rem',
          background: '#f8fafc',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative'
        }}>
          <input
            type="file"
            accept=".pdf,.txt"
            onChange={handleFileChange}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
          />
          <UploadCloud size={64} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <h3>Upload your health report</h3>
          <p className="text-muted mt-2">PDF files up to 10MB are supported for intelligent analysis.</p>

          {file && (
            <div className="mt-4" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#e0e7ff', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 500 }}>
              <FileText size={18} /> {file.name}
            </div>
          )}
        </div>

        {error && (
          <p style={{ color: 'var(--danger)', marginTop: '1rem' }}>{error}</p>
        )}

        <button
          className="btn btn-primary mt-4"
          onClick={handleUpload}
          disabled={!file || loading}
          style={{ width: '100%', maxWidth: '300px' }}
        >
          {loading ? <Loader2 className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> : 'Analyze Document'}
        </button>
      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>

      {result && (
        <div className="glass-panel animate-fade-in" style={{ borderLeft: '6px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
            <FileSearch size={24} /> <h3>Analysis Result</h3>
          </div>

          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
            <p className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} color="var(--secondary)" /> AI Summary
            </p>
            <p style={{ color: 'var(--text-main)', fontSize: '1.1rem', margin: '0.5rem 0 0 0' }}>{result.summary}</p>
          </div>

          <div>
            <p className="form-label">Key Medical Terms Identified</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {result.key_terms && result.key_terms.length > 0 ? (
                result.key_terms.map((term, i) => (
                  <span key={i} style={{ background: '#e2e8f0', color: '#475569', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 500 }}>
                    {term}
                  </span>
                ))
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>No standard terms identified in the document structure.</span>
              )}
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <p className="form-label">Text Preview (Extracted)</p>
            <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-muted)', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
              {result.text_preview}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
