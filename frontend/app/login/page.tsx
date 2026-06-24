'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { setAuth, getRedirectPath } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      setAuth(res.data.access_token, res.data.user);
      router.push(getRedirectPath(res.data.user.role));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login gagal. Periksa email dan password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f1117 0%, #1a1d27 50%, #0f1117 100%)',
      padding: '20px',
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', top: '-20%', right: '-10%', width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', left: '-10%', width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
      </div>

      <div style={{
        background: 'rgba(26,29,39,0.9)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        padding: '48px',
        width: '100%',
        maxWidth: '420px',
        position: 'relative',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '64px', height: '64px', background: 'rgba(245,158,11,0.15)',
            borderRadius: '16px', marginBottom: '16px',
          }}>
            <span style={{ fontSize: '28px' }}>🏗️</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#f1f5f9', margin: '0 0 6px' }}>
            MasterBangun
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            Platform Manajemen Proyek Konstruksi
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="input"
              placeholder="email@masterbangun.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              id="login-email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              id="login-password"
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#ef4444', padding: '12px 16px', borderRadius: '8px',
              fontSize: '14px', marginBottom: '16px',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            id="login-btn"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '15px', marginTop: '8px' }}
          >
            {loading ? '⏳ Masuk...' : '🔐 Masuk'}
          </button>
        </form>

        <div style={{
          marginTop: '32px', padding: '16px',
          background: 'rgba(255,255,255,0.03)', borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <p style={{ color: '#64748b', fontSize: '12px', margin: '0 0 8px', fontWeight: 600 }}>DEMO LOGIN:</p>
          {[
            { role: 'Manager', email: 'manager@masterbangun.com', pass: 'manager123' },
            { role: 'Super Admin', email: 'superadmin@masterbangun.com', pass: 'admin123' },
            { role: 'Admin Proyek', email: 'admin@masterbangun.com', pass: 'admin123' },
            { role: 'Pengawas', email: 'pengawas@masterbangun.com', pass: 'pengawas123' },
            { role: 'Mandor', email: 'mandor@masterbangun.com', pass: 'mandor123' },
            { role: 'Konsumen', email: 'konsumen@example.com', pass: 'konsumen123' },
            { role: 'Arsitek', email: 'arsitek@masterbangun.com', pass: 'arsitek123' },
            { role: 'Estimator', email: 'estimator@masterbangun.com', pass: 'estimator123' },
            { role: 'Drafter', email: 'drafter@masterbangun.com', pass: 'drafter123' },
          ].map((d) => (
            <button
              key={d.role}
              onClick={() => { setEmail(d.email); setPassword(d.pass); }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#64748b', fontSize: '12px', padding: '2px 0',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#f59e0b')}
              onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
            >
              <strong style={{ color: '#94a3b8' }}>{d.role}:</strong> {d.email}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
