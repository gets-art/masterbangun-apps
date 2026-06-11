'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { getUser } from '@/lib/auth';

export default function KonsumenDashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const user = getUser();

  useEffect(() => {
    api.get('/projects').then(async (pRes) => {
      setProjects(pRes.data);
      if (pRes.data.length > 0) {
        const proj = pRes.data[0];
        setSelectedProject(proj);
        const rRes = await api.get(`/daily-reports?projectId=${proj.id}`);
        setReports(rRes.data);
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleProjectChange = async (id: string) => {
    const proj = projects.find(p => p.id === id);
    setSelectedProject(proj);
    const rRes = await api.get(`/daily-reports?projectId=${id}`);
    setReports(rRes.data);
  };

  if (loading) return (
    <div>
      <div className="topbar"><div className="topbar-title">🏠 Proyek Saya</div></div>
      <div className="page-content">
        <div className="skeleton" style={{ height: 160, borderRadius: 14, marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 40, borderRadius: 8, marginBottom: 16 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 280, borderRadius: 14 }} />)}
        </div>
      </div>
    </div>
  );

  const approvedReports = reports.filter(r => r.status === 'APPROVED');

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar-title">🏠 Dashboard Pemilik</div>
          <div className="topbar-sub">Halo, {user?.name} — pantau progres rumah Anda</div>
        </div>
        {projects.length > 1 && (
          <select
            className="input"
            style={{ width: 'auto', padding: '8px 12px' }}
            value={selectedProject?.id || ''}
            onChange={e => handleProjectChange(e.target.value)}
          >
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        )}
      </div>

      <div className="page-content">
        {!selectedProject ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">🏠</div>
              <div className="empty-state-title">Belum ada proyek aktif</div>
              <div className="empty-state-desc">Silakan hubungi admin untuk dihubungkan ke proyek Anda</div>
            </div>
          </div>
        ) : (
          <>
            {/* Project overview card */}
            <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(13,17,27,0.98) 100%)', borderColor: 'rgba(245,158,11,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                    🏗️ Proyek Aktif
                  </div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 6px' }}>{selectedProject.name}</h2>
                  <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 12px' }}>📍 {selectedProject.address}</p>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <span className={`badge ${selectedProject.status === 'ACTIVE' ? 'badge-success' : 'badge-info'}`}>
                      {selectedProject.status === 'ACTIVE' ? '● Sedang Berjalan' : selectedProject.status}
                    </span>
                    <span className="badge badge-warning">
                      📸 {approvedReports.length} foto progres
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'center', minWidth: 140 }}>
                  <div style={{ fontSize: 52, fontWeight: 800, color: '#f59e0b', lineHeight: 1 }}>
                    {selectedProject.progressPercentage}
                    <span style={{ fontSize: 24 }}>%</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>Progres Keseluruhan</div>
                  <div className="progress-bar" style={{ height: 10, borderRadius: 8 }}>
                    <div className="progress-fill" style={{ width: `${selectedProject.progressPercentage}%`, borderRadius: 8 }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="stats-grid" style={{ marginBottom: 24 }}>
              {[
                { label: 'Laporan Harian', value: reports.length, icon: '📋', color: '#3b82f6' },
                { label: 'Foto Disetujui', value: approvedReports.filter(r => r.photos?.length > 0).length, icon: '🖼️', color: '#f59e0b' },
                { label: 'Hari Kerja', value: reports.length, icon: '📅', color: '#10b981' },
              ].map(s => (
                <div key={s.label} className="stat-card" style={{ '--stat-color': s.color } as React.CSSProperties}>
                  <div className="stat-icon" style={{ background: `${s.color}15`, fontSize: 18 }}>{s.icon}</div>
                  <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Galeri foto */}
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>📸 Galeri Progres Harian</h3>
              <span className="text-muted" style={{ fontSize: 13 }}>Foto yang sudah disetujui oleh manager</span>
            </div>

            {approvedReports.length === 0 ? (
              <div className="table-wrapper">
                <div className="empty-state">
                  <div className="empty-state-icon">🖼️</div>
                  <div className="empty-state-title">Belum ada foto progres</div>
                  <div className="empty-state-desc">Foto akan muncul setelah disetujui oleh manager proyek</div>
                </div>
              </div>
            ) : (
              <div className="photo-grid">
                {approvedReports.map((r) => (
                  <div key={r.id} className="photo-card">
                    {r.photos && r.photos.length > 0 ? (
                      <img
                        src={r.photos[0].photoUrl}
                        alt="Progress"
                        className="photo-card-img"
                        style={{ display: 'block' }}
                        onError={e => { (e.target as HTMLImageElement).parentElement!.innerHTML = '<div style="height:200px;display:flex;align-items:center;justify-content:center;color:#4b5563;font-size:13px;">📷 Foto tidak tersedia</div>'; }}
                      />
                    ) : (
                      <div className="photo-card-img">📷 Tidak ada foto</div>
                    )}
                    <div className="photo-card-body">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>
                          {new Date(r.reportDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </span>
                        <span className="text-primary" style={{ fontWeight: 700, fontSize: 15 }}>{r.progressPercentage}%</span>
                      </div>
                      {r.description && (
                        <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, lineHeight: 1.5 }}>{r.description}</p>
                      )}
                      <div style={{ fontSize: 11, color: '#4b5563', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>👤</span>
                        <span>{r.pengawas?.name || 'Pengawas'}</span>
                        <span>·</span>
                        <span>{r.weather === 'CERAH' ? '☀️' : r.weather === 'MENDUNG' ? '⛅' : '🌧️'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
