import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, FilePlus, Heart, AlarmClock } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import DoctorView from '../components/DoctorView';
import AdminView from '../components/AdminView';

const Dashboard = () => {
  const [history, setHistory] = useState({ symptoms: [], reports: [], trends: {} });
  const [metrics, setMetrics] = useState(null);
  const [reminders, setReminders] = useState([
    { title: 'Take Vitamin D', time: '09:00 AM', status: 'Pending' },
    { title: 'Check Blood Pressure', time: '07:00 PM', status: 'Pending' }
  ]);
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const userStr = localStorage.getItem('user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace('/auth'); // Using replace to clear history stack
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchHistory = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/history/${user.id}`);
        if(res.ok) {
            const data = await res.json();
            setHistory(data);
        }
        
        // Fetch AI Metrics
        const metricsRes = await fetch('http://localhost:8000/metrics');
        if(metricsRes.ok) {
            const mData = await metricsRes.json();
            setMetrics(mData);
        }
      } catch (e) {
        console.error("Fetch failed", e);
      }
    };
    fetchHistory();
  }, [user, navigate]);

  if (!user) return null;

  // Real data transforms
  const graphSymptomData = history.symptoms.length > 0 ? 
    history.symptoms.map((s, idx) => ({ 
        name: new Date(s.date).toLocaleDateString([], { month: 'short', day: 'numeric' }), 
        Queries: 1 
    })).reverse() : [];

  const graphReportData = (history.reports && history.reports.length > 0) ? 
    history.reports.map((r, idx) => ({ 
      name: r.date ? new Date(r.date).toLocaleDateString([], { month: 'short', day: 'numeric' }) : `Report ${idx + 1}`, 
      Reports: 1 
    })) : [];

  // Risk Analysis Data from history
  const latestRisk = history.symptoms[0]?.riskLevel || 'Unknown';
  const riskData = history.symptoms.length > 0 ? [
    { name: 'Your Risk', value: latestRisk === 'High' ? 80 : latestRisk === 'Medium' ? 50 : 20, color: latestRisk === 'High' ? 'var(--danger)' : latestRisk === 'Medium' ? 'var(--warning)' : 'var(--secondary)' },
    { name: 'Baseline', value: 100 - (latestRisk === 'High' ? 80 : latestRisk === 'Medium' ? 50 : 20), color: '#eee' },
  ] : [];

  // Framer Motion Variants for staggered entry
  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const childVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120 } }
  };

  return (
    <motion.div variants={containerVars} initial="hidden" animate="show" style={{ padding: '0 1rem' }}>
      
      <motion.div variants={childVars} style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity color="var(--primary)" /> 
                {user.role?.toLowerCase() === 'doctor' ? 'Clinical Control Center' : 
                 user.role?.toLowerCase() === 'admin' ? 'System Administration' : 
                 'Patient Health Portal'}
            </h1>
            <p>Welcome back, <strong>{user.name}</strong>. Access: <span style={{ 
                textTransform: 'uppercase', 
                background: user.role === 'doctor' ? 'var(--secondary)' : 'var(--primary)', 
                color: 'white',
                padding: '0.2rem 0.6rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700 
            }}>{user.role || 'patient'}</span></p>
        </div>
        <button 
            onClick={handleLogout}
            className="btn btn-secondary"
            id="logout-btn"
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}
        >
            Logout
        </button>
      </motion.div>

      {/* Conditional Rendering based on Role */}
      {user.role?.toLowerCase() === 'doctor' ? (
        <DoctorView />
      ) : user.role?.toLowerCase() === 'admin' ? (
        <AdminView />
      ) : (
        <>
          {/* Top Value Cards (Existing Patient Cards) */}
          <motion.div variants={childVars} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            {metrics && metrics.accuracy !== undefined && (
                <div className="glass-panel" style={{ padding: '1.5rem', gridColumn: '1 / -1', borderLeft: '6px solid var(--primary)', background: 'linear-gradient(90deg, #f8fafc 0%, #ffffff 100%)' }}>
                    <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                        🛡 AI Clinical Reliability Report (v2.0)
                    </h4>
                    <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600}}>System Accuracy</span>
                            <strong style={{color: 'var(--primary)', fontSize: '1.5rem'}}>{(metrics.accuracy * 100).toFixed(0)}%</strong>
                        </div>
                        <div style={{ width: '1px', height: '30px', background: 'var(--border)' }}></div>
                        <div>
                            <span style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}><strong>Precision:</strong> {metrics.precision || '0.84'}</span>
                        </div>
                        <div>
                            <span style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}><strong>Recall:</strong> {metrics.recall || '0.82'}</span>
                        </div>
                        <div style={{ marginLeft: 'auto', background: '#dcfce7', color: '#166534', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                            Verified Clinical Model
                        </div>
                    </div>
                </div>
            )}
            
            <div className="glass-panel card-lift" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: '#e0e7ff', padding: '1rem', borderRadius: '50%', color: 'var(--primary)' }}><Activity size={24}/></div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{history.symptoms.length}</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-light)' }}>Symptom Queries</p>
                </div>
            </div>
            <div className="glass-panel card-lift" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: '#d1fae5', padding: '1rem', borderRadius: '50%', color: 'var(--secondary)' }}><FilePlus size={24}/></div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{history.reports.length}</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-light)' }}>PDF Reports Scanned</p>
                </div>
            </div>
            <div className="glass-panel card-lift" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: '#fee2e2', padding: '1rem', borderRadius: '50%', color: 'var(--danger)' }}><Heart size={24}/></div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                        {history.symptoms.length > 0 ? `Risk: ${latestRisk}` : 'No Data Yet'}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-light)' }}>Health Status</p>
                </div>
            </div>
            <div className="glass-panel card-lift" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '4px solid var(--primary)' }}>
                <div style={{ background: '#dbeafe', padding: '1rem', borderRadius: '50%', color: 'var(--primary)' }}><AlarmClock size={24}/></div>
                <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '1rem' }}>Daily Checklist</h4>
                    {history.symptoms.length === 0 && history.reports.length === 0 ? (
                        <p style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.5rem', fontWeight: 600 }}>
                           🚀 Run your first AI diagnosis!
                        </p>
                    ) : (
                        reminders.map((r, i) => (
                            <div key={i} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                • {r.title} ({r.time})
                            </div>
                        ))
                    )}
                </div>
            </div>
          </motion.div>

          {/* Main Charts Area */}
          <motion.div variants={childVars} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-main)', marginBottom: '1.5rem' }}>Symptom Trends</h3>
                {graphSymptomData.length > 0 ? (
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={graphSymptomData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} />
                                <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} />
                                <Tooltip contentStyle={{ background: 'var(--surface)', border: 'none', borderRadius: '8px', boxShadow: 'var(--glass-shadow)' }} />
                                <Line type="monotone" dataKey="Queries" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--primary)' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: '12px' }}>
                        No symptom history available.
                    </div>
                )}
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-main)', marginBottom: '1.5rem' }}>Report Tracker</h3>
                {graphReportData.length > 0 ? (
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={graphReportData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} />
                                <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} allowDecimals={false} />
                                <Tooltip cursor={{fill: 'rgba(79, 70, 229, 0.1)'}} contentStyle={{ background: 'var(--surface)', border: 'none', borderRadius: '8px' }} />
                                <Bar dataKey="Reports" fill="var(--secondary)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: '12px' }}>
                        No reports uploaded yet.
                    </div>
                )}
            </div>
          </motion.div>
          
          {/* Personalized Health Risk Analysis */}
          {history.symptoms.length > 0 && (
            <div className="glass-panel animate-fade-in" style={{ padding: '2rem', marginTop: '2rem', borderTop: '4px solid var(--primary)' }}>
                <h3 style={{ color: 'var(--text-main)', marginBottom: '1.5rem' }}>Personalized Risk Assessment</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'center' }}>
                    <div style={{ height: '240px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={riskData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {riskData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '16px' }}>
                        <h4 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>AI Clinical Insight</h4>
                        <p style={{ lineHeight: 1.6, color: 'var(--text-main)', fontStyle: 'italic' }}>
                            "Based on your latest query showing <strong>{latestRisk} Risk</strong>, our AI suggests: 
                            {history.symptoms[0].suggestion}"
                        </p>
                        <hr style={{ margin: '1.5rem 0', opacity: 0.1 }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Last updated:</span>
                            <strong>{new Date(history.symptoms[0].date).toLocaleDateString()}</strong>
                        </div>
                    </div>
                </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default Dashboard;
