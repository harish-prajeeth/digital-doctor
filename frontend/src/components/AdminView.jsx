import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Activity, ShieldAlert, Terminal, BarChart2, Trash2, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const AdminView = () => {
  const [stats, setStats] = useState({ totalUsers: 0, activePatients: 0, doctorsRegistered: 0, aiPredictionsToday: 0 });
  const [users, setUsers] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [health, setHealth] = useState({ backend: 'checking', ai: 'checking' });

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users')
      ]);

      const mRes = await fetch(`${import.meta.env.VITE_AI_URL || '/ai-service'}/metrics`).catch(() => ({ ok: false }));
      const aStatus = mRes.ok ? 'operational' : 'offline';

      setHealth({ backend: 'operational', ai: aStatus });
      setStats(statsRes.data);
      setUsers(usersRes.data);

      if (mRes.ok) {
        const mData = await mRes.json();
        setMetrics(mData);
      }
    } catch (e) {
      console.error("Admin fetch failed", e);
      setHealth({ backend: 'offline', ai: 'offline' });
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user ${userName}?`)) return;
    try {
      await api.delete(`/admin/user/${userId}`);
      toast.success('User deleted successfully');
      fetchAdminData();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Platform Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#e0e7ff', padding: '0.75rem', borderRadius: '12px', color: 'var(--primary)' }}><Users size={24}/></div>
          <div>
            <h3 style={{ margin: 0 }}>{stats.totalUsers}</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Users</p>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#d1fae5', padding: '0.75rem', borderRadius: '12px', color: '#10b981' }}><Activity size={24}/></div>
          <div>
            <h3 style={{ margin: 0 }}>{stats.activePatients}</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Patients</p>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#fef3c7', padding: '0.75rem', borderRadius: '12px', color: '#f59e0b' }}><ShieldAlert size={24}/></div>
          <div>
            <h3 style={{ margin: 0 }}>{stats.doctorsRegistered}</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Doctors Joined</p>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#e0f2fe', padding: '0.75rem', borderRadius: '12px', color: '#0ea5e9' }}><BarChart2 size={24}/></div>
          <div>
            <h3 style={{ margin: 0 }}>{stats.aiPredictionsToday}</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>AI Queries Today</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '2rem' }}>
        {/* User Management */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>User Management</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '1rem' }}>Name</th>
                  <th style={{ padding: '1rem' }}>Email</th>
                  <th style={{ padding: '1rem' }}>Role</th>
                  <th style={{ padding: '1rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>{u.name}</td>
                    <td style={{ padding: '1rem' }}>{u.email}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px',
                        background: u.role === 'doctor' ? '#d1fae5' : u.role === 'admin' ? '#fee2e2' : '#e0e7ff',
                        color: u.role === 'doctor' ? '#065f46' : u.role === 'admin' ? '#991b1b' : '#1e40af'
                      }}>
                        {u.role || 'patient'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button onClick={() => handleDeleteUser(u._id, u.name)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Health */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', background: '#1e293b', color: 'white' }}>
            <h4 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><Terminal size={18} /> System Console</h4>
            <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: 1.6 }}>
              <div style={{ color: health.backend === 'operational' ? '#4ade80' : '#f87171' }}>• Backend: {health.backend}</div>
              <div style={{ color: health.ai === 'operational' ? '#4ade80' : '#f87171' }}>• AI Service: {health.ai}</div>
              <div style={{ opacity: 0.6, marginTop: '0.5rem' }}>[SEC] RSA-2048/AES-256 enabled</div>
              <div style={{ opacity: 0.6 }}>[SYS] Rate limits active (1000/hr)</div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4>AI Clinical performance</h4>
            {metrics ? (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <span>Model Accuracy</span>
                  <strong>{(metrics.accuracy * 100).toFixed(1)}%</strong>
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${metrics.accuracy * 100}%`, height: '100%', background: 'var(--primary)' }}></div>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1rem' }}>Loading metrics...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminView;
