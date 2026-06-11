'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { getUser } from '@/lib/auth';

export default function PengawasDashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
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
    });
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayReports = reports.filter(r => r.reportDate === todayStr);
  const pendingReports = reports.filter(r => r.status === 'SUBMITTED');
  const pendingMaterials = materials.filter(m => m.status === 'PENDING');

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar-title">📊 Dashboard Pengawas</div>
          <div className="topbar-sub">
            Halo, {user?.name} — {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
        {pendingMaterials.length > 0 && (
          <span className="badge badge-warning">📦 {pendingMaterials.length} material perlu ditinjau</span>
        )}
      </div>

      <div className="page-content">
        <div className="stats-grid">
          {[
            { label: 'Proyek Saya', value: projects.length, icon: '🏗️', color: '#f59e0b' },
            { label: 'Laporan Hari Ini', value: todayReports.length, icon: '📋', color: '#3b82f6' },
            { label: 'Review Pending', value: pendingReports.length, icon: '⏳', color: '#ef4444' },
            { label: 'Material Pending', value: pendingMaterials.length, icon: '📦', color: '#f59e0b' },
          ].map((s) => (
            <div key={s.label} className="stat-card" style={{ '--stat-color': s.color } as React.CSSProperties}>
              <div className="stat-icon" style={{ background: `${s.color}15`, fontSize: 20 }}>{s.icon}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', marginBottom: 24 }}>
          {[
            { href: '/dashboard/pengawas/daily-report', icon: '📋', title: 'Buat Laporan Harian', desc: 'Submit laporan progres dengan foto dokumentasi', color: '#3b82f6' },
            { href: '/dashboard/pengawas/overtime', icon: '⏰', title: 'Approval Lembur', desc: 'Review dan setujui lembur tukang di lapangan', color: '#f59e0b' },
            { href: '/dashboard/pengawas/materials', icon: '📦', title: 'Review Material', desc: 'Kelola pengajuan material dari mandor', color: '#10b981', badge: pendingMaterials.length },
          ].map(m => (
            <a key={m.href} href={m.href} className="card card-hover" style={{ textDecoration: 'none', display: 'block', borderColor: `${m.color}20` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${m.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                  {m.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, color: m.color }}>{m.title}</h3>
                    {m.badge ? <span className="badge badge-warning" style={{ fontSize: 10 }}>{m.badge}</span> : null}
                  </div>
                  <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>{m.desc}</p>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Projects list */}
        {projects.length > 0 && (
          <div className="table-wrapper">
            <div className="table-header">
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>🏗️ Proyek yang Diawasi</h3>
            </div>
            <table>
              <thead>
                <tr><th>Nama Proyek</th><th>Alamat</th><th>Progress</th><th>Status</th></tr>
              </thead>
              <tbody>
                {projects.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td className="td-muted">{p.address}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar"><div className="progress-fill" style={{ width: `${p.progressPercentage}%` }} /></div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#f59e0b' }}>{p.progressPercentage}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${p.status === 'ACTIVE' ? 'badge-success' : 'badge-info'}`}>
                        {p.status === 'ACTIVE' ? '● Aktif' : p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
