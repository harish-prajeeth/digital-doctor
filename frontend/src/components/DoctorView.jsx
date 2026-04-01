import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Video, FileText, ClipboardList, TrendingUp, X, Activity } from 'lucide-react';

const DoctorView = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetail, setPatientDetail] = useState(null);
  const [consultationOpen, setConsultationOpen] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || '/api'}/doctor/patients`)
      .then(res => res.json())
      .then(data => setPatients(data))
      .catch(e => console.error(e));
  }, []);

  const openPatientProfile = async (p) => {
    setSelectedPatient(p);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/doctor/patient/${p.id}`);
      if (res.ok) setPatientDetail(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: selectedPatient ? '1.2fr 1fr' : '1fr', gap: '2rem', transition: 'all 0.4s' }}>
        
        {/* Patient List */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>Patient Records</h3>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="text" placeholder="Search Patients..." className="form-control" style={{ paddingLeft: '2.5rem', width: '250px' }} />
            </div>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '1rem' }}>Patient Name</th>
                <th style={{ padding: '1rem' }}>Latest Condition</th>
                <th style={{ padding: '1rem' }}>Risk Level</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.length > 0 ? patients.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s', cursor: 'pointer' }} onClick={() => openPatientProfile(p)}>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{p.name}</td>
                  <td style={{ padding: '1rem' }}>{p.predictedCondition || 'Healthy'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                        fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px', 
                        background: p.riskLevel === 'High' ? '#fee2e2' : '#fef3c7', 
                        color: p.riskLevel === 'High' ? '#b91c1c' : '#b45309' 
                    }}>{p.riskLevel}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>View Profile</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No patients found in active history.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Patient Profile Detail Side Panel */}
        <AnimatePresence>
          {selectedPatient && patientDetail && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="glass-panel" 
              style={{ padding: '1.5rem', maxHeight: '80vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileText color="var(--primary)" /> Medical History</h3>
                <button onClick={() => setSelectedPatient(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
              </div>

              <div style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--bg-gradient)', borderRadius: '12px' }}>
                <p style={{ margin: 0, fontSize: '0.8rem' }}>Patient ID: {selectedPatient.id}</p>
                <h4 style={{ margin: '0.2rem 0' }}>{selectedPatient.name}</h4>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => setConsultationOpen(true)}><Video size={16}/> Start Consultation</button>
                </div>
              </div>

              <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><TrendingUp size={18}/> AI Diagnosis History</h4>
              {patientDetail.symptoms?.length > 0 ? patientDetail.symptoms.map((s, i) => (
                <div key={i} style={{ padding: '0.75rem', borderLeft: '3px solid var(--primary)', background: 'rgba(79, 70, 229, 0.05)', marginBottom: '0.75rem', borderRadius: '0 8px 8px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <strong>{s.predictedCondition} {s.confidence ? `(${s.confidence.toFixed(0)}%)` : ''}</strong>
                        <span style={{ color: 'var(--text-muted)' }}>{new Date(s.date).toLocaleDateString()}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', margin: '0.3rem 0 0 0' }}>Symptoms: {s.symptoms?.join(', ') || 'N/A'}</p>
                </div>
              )) : (
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No diagnosis history available.</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Consultation Panel / Video Mock UI */}
      {consultationOpen && (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ 
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                zIndex: 2000, background: 'rgba(0,0,0,0.8)', padding: '2rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
        >
            <div className="glass-panel" style={{ width: '100%', maxWidth: '1000px', height: '80vh', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', overflow: 'hidden' }}>
                {/* Video Area */}
                <div style={{ background: '#000', borderRadius: '12px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ color: 'white', textAlign: 'center' }}>
                        <Users size={64} style={{ opacity: 0.3 }} />
                        <p style={{ marginTop: '1rem' }}>Patient: {selectedPatient?.name}</p>
                        <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>Connecting Securely via Bio-Encypted Link...</p>
                    </div>
                    <div style={{ position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '1rem' }}>
                        <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TrendingUp color="white"/></div>
                        <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setConsultationOpen(false)}><X color="white"/></div>
                    </div>
                </div>

                {/* Consultation Info */}
                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
                    <div>
                        <h4 style={{ marginBottom: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={18}/> Live Vitals</h4>
                        <div style={{ fontSize: '0.85rem' }}>HR: 72 bpm | BP: 120/80 | SpO2: 98%</div>
                    </div>
                    <div>
                        <h4 style={{ marginBottom: '0.75rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ClipboardList size={18}/> Doctor Notes</h4>
                        <textarea className="form-control" placeholder="Type clinical notes here..." style={{ height: '120px', fontSize: '0.9rem' }}></textarea>
                    </div>
                    <div style={{ background: 'var(--bg-gradient)', padding: '1rem', borderRadius: '12px' }}>
                        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>AI Suggested Advice</h4>
                        <p style={{ fontSize: '0.8rem', margin: 0 }}>Patient shows consistent symptoms of {selectedPatient?.predictedCondition || 'Healthy status'}. AI recommends regular monitoring.</p>
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%', marginTop: 'auto' }} onClick={() => setConsultationOpen(false)}>Save & Finish</button>
                </div>
            </div>
        </motion.div>
      )}
    </div>
  );
};

export default DoctorView;
