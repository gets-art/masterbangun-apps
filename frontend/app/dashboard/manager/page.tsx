'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { getUser } from '@/lib/auth';

export default function ManagerDashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    Promise.all([
      api.get('/projects'),
      api.get('/daily-reports'),
      api.get('/materials'),
    ]).then(([p, r, m]) => {
      setProjects(p.data);
      setReports(r.data);
      setMaterials(m.data);
    }).finally(() => setLoading(false));
  }, []);

  const active = projects.filter(p => p.status === 'ACTIVE');
  const pending = reports.filter(r => r.status === 'SUBMITTED');
  const pendingMaterials = materials.filter(m => m.status === 'PENDING');

  if (loading) return (
    <div>
      <div className="topbar"><div className="topbar-title">Dashboard Manager</div></div>
      <div className="page-content">
        <div className="stats-grid">{[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 110 }} />)}</div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar-title">📊 Dashboard Manager</div>
          <div className="topbar-sub">
            Selamat datang, {user?.name} — {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {pending.length > 0 && (
            <span className="badge badge-danger">🔔 {pending.length} laporan pending</span>
          )}
          {pendingMaterials.length > 0 && (
            <span className="badge badge-warning">📦 {pendingMaterials.length} material pending</span>
          )}
        </div>
      </div>

      <div className="page-content">
        <div className="stats-grid">
          {[
            { label: 'Proyek Aktif', value: active.length, icon: '🏗️', color: '#f59e0b' },
            { label: 'Laporan Pending', value: pending.length, icon: '📋', color: '#ef4444' },
            { label: 'Material Pending', value: pendingMaterials.length, icon: '📦', color: '#f59e0b' },
            { label: 'Total Selesai', value: projects.filter(p=>p.status==='COMPLETED').length, icon: '✅', color: '#10b981' },
          ].map((s) => (
            <div key={s.label} className="stat-card" style={{ '--stat-color': s.color } as React.CSSProperties}>
              <div className="stat-icon" style={{ background: `${s.color}15`, fontSize: 20 }}>{s.icon}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Active projects */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>🏗️ Proyek Aktif</h3>
            <span className="badge badge-success">{active.length} berjalan</span>
          </div>
          {active.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🏗️</div>
              <div style={{ color: '#64748b' }}>Tidak ada proyek aktif saat ini</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {active.map((p, i) => (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 0',
                  borderBottom: i < active.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  gap: 16,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                    <p style={{ fontSize: 12, color: '#64748b' }}>📍 {p.address}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="progress-bar" style={{ width: 100 }}>
                        <div className="progress-fill" style={{ width: `${p.progressPercentage}%` }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#f59e0b', minWidth: 36 }}>{p.progressPercentage}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent reports */}
        <div className="table-wrapper">
          <div className="table-header">
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>📋 Laporan Harian Terbaru</h3>
            {pending.length > 0 && <span className="badge badge-warning">{pending.length} perlu ditinjau</span>}
          </div>
          {reports.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">📋</div><div className="empty-state-title">Belum ada laporan</div></div>
          ) : (
            <table>
              <thead>
                <tr><th>Tanggal</th><th>Proyek</th><th>Pengawas</th><th>Progress</th><th>Status</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                {reports.slice(0, 10).map((r) => (
                  <tr key={r.id}>
                    <td>{r.reportDate}</td>
                    <td style={{ fontWeight: 500 }}>{r.project?.name || '-'}</td>
                    <td className="td-muted">{r.pengawas?.name || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar"><div className="progress-fill" style={{ width: `${r.progressPercentage}%` }} /></div>
                        <span style={{ fontSize: 12 }}>{r.progressPercentage}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        r.status === 'APPROVED' ? 'badge-success' :
                        r.status === 'SUBMITTED' ? 'badge-warning' :
                        r.status === 'REVISION' ? 'badge-danger' : 'badge-info'
                      }`}>{
                        r.status === 'APPROVED' ? '✓ Disetujui' :
                        r.status === 'SUBMITTED' ? '⏳ Review' :
                        r.status === 'REVISION' ? '↩ Revisi' : 'Draft'
                      }</span>
                    </td>
                    <td>
                      {r.status === 'SUBMITTED' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={async () => { await api.patch(`/daily-reports/${r.id}/approve`); setReports(prev => prev.map(x => x.id === r.id ? {...x, status: 'APPROVED'} : x)); }}
                            className="badge badge-success" style={{ cursor: 'pointer', border: 'none', padding: '5px 12px' }}>
                            ✓ Setujui
                          </button>
                          <button onClick={async () => { await api.patch(`/daily-reports/${r.id}/revision`); setReports(prev => prev.map(x => x.id === r.id ? {...x, status: 'REVISION'} : x)); }}
                            className="badge badge-danger" style={{ cursor: 'pointer', border: 'none', padding: '5px 12px' }}>
                            ↩ Revisi
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
