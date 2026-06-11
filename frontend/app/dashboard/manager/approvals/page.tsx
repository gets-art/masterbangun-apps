'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function ManagerApprovals() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);

  const loadData = () => {
    setLoading(true);
    api.get('/daily-reports').then(res => setReports(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => loadData(), []);

  const handlePhotoApprove = async (reportId: string, photoId: string) => {
    try {
      // share = approve photo to be visible to consumer
      await api.patch(`/photos/${photoId}/share`);
      loadData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handlePhotoDelete = async (reportId: string, photoId: string) => {
    if (!confirm('Hapus foto ini dari laporan?')) return;
    try {
      await api.delete(`/photos/${photoId}`);
      loadData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  // Get reports that have photos with submitted status
  const reportsWithPhotos = reports.filter(r => r.photos && r.photos.length > 0);

  if (loading) return (
    <div>
      <div className="topbar">
        <div className="topbar-title">🖼️ Approval Foto</div>
      </div>
      <div className="page-content">
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 120, marginBottom: 12, borderRadius: 14 }} />)}
      </div>
    </div>
  );

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar-title">🖼️ Approval Foto Konsumen</div>
          <div className="topbar-sub">Review dan setujui foto untuk ditampilkan ke pemilik</div>
        </div>
        <span className="badge badge-info">{reportsWithPhotos.length} laporan dengan foto</span>
      </div>

      <div className="page-content">
        {reportsWithPhotos.length === 0 ? (
          <div className="table-wrapper">
            <div className="empty-state">
              <div className="empty-state-icon">🖼️</div>
              <div className="empty-state-title">Belum ada foto untuk direview</div>
              <div className="empty-state-desc">Foto akan muncul ketika pengawas menambahkan dokumentasi laporan harian</div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {reportsWithPhotos.map(r => (
              <div key={r.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                      {r.project?.name || 'Proyek -'} · {new Date(r.reportDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </h3>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span className="badge badge-info">
                        {r.weather === 'CERAH' ? '☀️ Cerah' : r.weather === 'MENDUNG' ? '⛅ Mendung' : '🌧️ Hujan'}
                      </span>
                      <span className="badge badge-purple">Progress: {r.progressPercentage}%</span>
                      <span className="text-secondary" style={{ fontSize: 12 }}>oleh {r.pengawas?.name}</span>
                    </div>
                    {r.description && (
                      <p style={{ marginTop: 8, fontSize: 13, color: '#94a3b8' }}>{r.description}</p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                  {r.photos.map((photo: any) => (
                    <div key={photo.id} style={{
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 12, overflow: 'hidden',
                      transition: 'all 0.2s',
                    }}>
                      <div style={{ position: 'relative' }}>
                        <img
                          src={photo.photoUrl}
                          alt={photo.caption || 'Foto lapangan'}
                          style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block', background: '#0e1118' }}
                          onError={e => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';
                            (e.target as HTMLImageElement).style.background = '#1a1d27';
                          }}
                        />
                        {photo.approvedByManager && (
                          <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(16,185,129,0.9)', color: 'white', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6 }}>
                            ✓ Disetujui
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '10px 12px' }}>
                        {photo.caption && (
                          <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>{photo.caption}</p>
                        )}
                        <div style={{ display: 'flex', gap: 6 }}>
                          {!photo.approvedByManager ? (
                            <button
                              onClick={() => handlePhotoApprove(r.id, photo.id)}
                              className="btn-primary"
                              style={{ flex: 1, fontSize: 12, padding: '6px 10px', justifyContent: 'center' }}
                            >
                              ✓ Setujui ke Konsumen
                            </button>
                          ) : (
                            <span className="badge badge-success" style={{ flex: 1, justifyContent: 'center' }}>✓ Sudah disetujui</span>
                          )}
                          <button
                            onClick={() => handlePhotoDelete(r.id, photo.id)}
                            className="btn-icon"
                            title="Hapus foto"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
