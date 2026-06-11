'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { getUser } from '@/lib/auth';

export default function AdminDashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    Promise.all([api.get('/projects'), api.get('/users'), api.get('/attendance')])
      .then(([p, u, a]) => { setProjects(p.data); setUsers(u.data); setAttendance(a.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div>
      <div className="topbar"><div className="topbar-title">Dashboard Admin</div></div>
      <div className="page-content">
        <div className="stats-grid">
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 110 }} />)}
        </div>
      </div>
    </div>
  );

  const roleCount = (role: string) => users.filter(u => u.role === role).length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(a => a.attendanceDate === todayStr);

  const stats = [
    { label: 'Total Proyek', value: projects.length, icon: '🏗️', color: '#f59e0b' },
    { label: 'Proyek Aktif', value: projects.filter(p=>p.status==='ACTIVE').length, icon: '✅', color: '#10b981' },
    { label: 'Total User', value: users.length, icon: '👥', color: '#3b82f6' },
    { label: 'Absensi Hari Ini', value: todayAttendance.length, icon: '📅', color: '#8b5cf6' },
  ];

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar-title">📊 Dashboard Admin</div>
          <div className="topbar-sub">Selamat datang, {user?.name} — {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
      </div>
      <div className="page-content">
        <div className="stats-grid">
          {stats.map((s) => (
            <div key={s.label} className="stat-card" style={{ '--stat-color': s.color } as React.CSSProperties}>
              <div className="stat-icon" style={{ background: `${s.color}15`, fontSize: 20 }}>{s.icon}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* User roles breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div className="card">
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>👥 Distribusi User</h3>
            {[
              { role: 'MANAGER', label: 'Manager', color: '#f59e0b' },
              { role: 'PENGAWAS', label: 'Pengawas', color: '#3b82f6' },
              { role: 'MANDOR', label: 'Mandor', color: '#10b981' },
              { role: 'KONSUMEN', label: 'Konsumen', color: '#8b5cf6' },
            ].map(r => (
              <div key={r.role} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: r.color }} />
                  <span style={{ fontSize: 13 }}>{r.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="progress-bar" style={{ width: 80 }}>
                    <div className="progress-fill" style={{ width: `${users.length > 0 ? (roleCount(r.role) / users.length * 100) : 0}%`, background: r.color }} />
                  </div>
                  <span style={{ fontWeight: 700, color: r.color, minWidth: 20, textAlign: 'right' }}>{roleCount(r.role)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>🏗️ Status Proyek</h3>
            {[
              { status: 'ACTIVE', label: 'Sedang Berjalan', color: '#10b981' },
              { status: 'COMPLETED', label: 'Selesai', color: '#3b82f6' },
              { status: 'ON_HOLD', label: 'Ditunda', color: '#f59e0b' },
              { status: 'CANCELLED', label: 'Dibatalkan', color: '#ef4444' },
            ].map(r => {
              const count = projects.filter(p => p.status === r.status).length;
              return (
                <div key={r.status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: r.color }} />
                    <span style={{ fontSize: 13 }}>{r.label}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: r.color }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent users table */}
        <div className="table-wrapper">
          <div className="table-header">
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Daftar User</h3>
            <span className="badge badge-info">{users.length} total</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 15).map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 500 }}>{u.name}</td>
                  <td className="td-muted">{u.email}</td>
                  <td>
                    <span className={`badge ${
                      u.role === 'SUPER_ADMIN' ? 'badge-danger' :
                      u.role === 'MANAGER' ? 'badge-warning' :
                      u.role === 'PENGAWAS' ? 'badge-info' :
                      u.role === 'MANDOR' ? 'badge-success' : 'badge-purple'
                    }`}>{u.role}</span>
                  </td>
                  <td>
                    <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {u.isActive ? '● Aktif' : '○ Nonaktif'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
