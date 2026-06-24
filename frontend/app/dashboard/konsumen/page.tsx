'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { getUser } from '@/lib/auth';
import { getImageUrl } from '@/lib/utils';

export default function KonsumenDashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const user = getUser();

  useEffect(() => {
    api.get('/projects').then(async (pRes) => {
      setProjects(pRes.data);
      if (pRes.data.length > 0) {
        const proj = pRes.data[0];
        setSelectedProject(proj);
        try {
          const rRes = await api.get(`/daily-reports?projectId=${proj.id}`);
          setReports(rRes.data);
          const docRes = await api.get(`/documents/consumer/${proj.id}`);
          setDocuments(docRes.data);
        } catch (err) {
          console.error("Failed fetching data", err);
        }
      }
    }).catch(err => console.error(err)).finally(() => setLoading(false));
  }, []);

  const handleProjectChange = async (id: string) => {
    const proj = projects.find(p => p.id === id);
    setSelectedProject(proj);
    try {
      const rRes = await api.get(`/daily-reports?projectId=${id}`);
      setReports(rRes.data);
      const docRes = await api.get(`/documents/consumer/${id}`);
      setDocuments(docRes.data);
    } catch (err) {
      console.error("Failed fetching data", err);
    }
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

            {/* Galeri foto -> Timeline Proyek */}
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>⏳ Timeline Perjalanan Proyek</h3>
              <span className="text-muted" style={{ fontSize: 13 }}>Rekam jejak progres dari awal hingga akhir</span>
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
            <div style={{ paddingLeft: 24, paddingRight: 8, marginLeft: 12, borderLeft: '2px solid #334155', display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 24 }}>
              
              {/* Timeline Start */}
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: -33, top: 0, width: 16, height: 16, borderRadius: '50%', background: '#10b981', border: '3px solid #0f172a' }} />
                <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>Mulai Pekerjaan</div>
                <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 15 }}>
                  {selectedProject.startDate ? new Date(selectedProject.startDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                </div>
              </div>

              {/* Laporan Harian Nodes */}
              {approvedReports.map((r) => (
                <div key={r.id} style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: -32, top: 2, width: 14, height: 14, borderRadius: '50%', background: '#f59e0b', border: '3px solid #0f172a' }} />
                  <div style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155', overflow: 'hidden', transition: 'transform 0.2s' }} className="card-hover">
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15, color: '#f8fafc', marginBottom: 4 }}>
                          {new Date(r.reportDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <div style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>👤 {r.pengawas?.name || 'Pengawas'}</span>
                          <span>•</span>
                          <span>{r.weather === 'CERAH' ? '☀️ Cerah' : r.weather === 'MENDUNG' ? '⛅ Mendung' : '🌧️ Hujan'}</span>
                        </div>
                      </div>
                      <div className="badge badge-warning" style={{ fontSize: 14, padding: '6px 12px' }}>
                        Progress: {r.progressPercentage}%
                      </div>
                    </div>
                    
                    {r.description && (
                      <div style={{ padding: '16px 20px', color: '#cbd5e1', fontSize: 14, lineHeight: 1.6, borderBottom: r.photos?.length ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                        {r.description}
                      </div>
                    )}

                    {r.photos && r.photos.length > 0 && (
                      <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                        {r.photos.map((p: any, i: number) => (
                          <div key={i} style={{ aspectRatio: '4/3', borderRadius: 8, overflow: 'hidden', background: '#0f172a' }}>
                            <img
                              src={getImageUrl(p.photoUrl)}
                              alt="Progress"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={e => { (e.target as HTMLImageElement).parentElement!.innerHTML = '<div style="height:100%;display:flex;align-items:center;justify-content:center;color:#4b5563;font-size:13px;">📷 Error</div>'; }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Timeline End */}
              <div style={{ position: 'relative', marginTop: 12 }}>
                <div style={{ position: 'absolute', left: -33, top: 0, width: 16, height: 16, borderRadius: '50%', background: '#3b82f6', border: '3px solid #0f172a' }} />
                <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>Target Selesai</div>
                <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 15 }}>
                  {selectedProject.estimatedEndDate ? new Date(selectedProject.estimatedEndDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Belum ditentukan'}
                </div>
                {selectedProject.extensionNote && (
                  <div style={{ marginTop: 12, padding: '12px 16px', background: 'rgba(245, 158, 11, 0.1)', color: '#fcd34d', borderRadius: 8, fontSize: 13, borderLeft: '3px solid #f59e0b', lineHeight: 1.5 }}>
                    <strong style={{ color: '#f59e0b', display: 'block', marginBottom: 4 }}>Catatan Perubahan Jadwal:</strong>
                    {selectedProject.extensionNote}
                  </div>
                )}
              </div>

            </div>
            )}
            {/* Dokumen Proyek */}
            <div style={{ marginTop: 32, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>📁 Dokumen Proyek</h3>
              <span className="text-muted" style={{ fontSize: 13 }}>File dan dokumen penting</span>
            </div>

            {documents.length === 0 ? (
              <div className="table-wrapper">
                <div className="empty-state">
                  <div className="empty-state-icon">📁</div>
                  <div className="empty-state-title">Belum ada dokumen</div>
                  <div className="empty-state-desc">Dokumen proyek akan muncul di sini jika dibagikan oleh admin</div>
                </div>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Nama Dokumen</th>
                      <th>Kategori</th>
                      <th>Versi</th>
                      <th>Tanggal</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map(d => (
                      <tr key={d.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{d.title}</div>
                          {d.notes && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{d.notes}</div>}
                        </td>
                        <td><span className="badge badge-purple">{d.category}</span></td>
                        <td><span className="badge badge-warning">v{d.version}</span></td>
                        <td className="td-muted">{new Date(d.createdAt).toLocaleDateString('id-ID')}</td>
                        <td>
                          <a href={getImageUrl(d.fileUrl)} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '4px 8px', fontSize: 12, textDecoration: 'none' }}>
                            ⬇️ Unduh
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
