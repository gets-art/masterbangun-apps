'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { getUser } from '@/lib/auth';

export default function KonsumenGallery() {
  const [projects, setProjects] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    api.get('/projects').then(async res => {
      setProjects(res.data);
      if (res.data.length > 0) {
        const pid = res.data[0].id;
        setSelectedProject(pid);
        await loadPhotos(pid);
      }
    }).finally(() => setLoading(false));
  }, []);

  const loadPhotos = async (projectId: string) => {
    try {
      // Try dedicated consumer photos endpoint
      const res = await api.get(`/photos/consumer/${projectId}`);
      setPhotos(res.data);
    } catch {
      // Fallback: get approved daily reports with photos
      const rRes = await api.get(`/daily-reports?projectId=${projectId}`);
      const allPhotos: any[] = [];
      rRes.data.filter((r: any) => r.status === 'APPROVED' && r.photos?.length > 0).forEach((r: any) => {
        r.photos.forEach((p: any) => {
          allPhotos.push({
            ...p,
            reportDate: r.reportDate,
            progressPercentage: r.progressPercentage,
            pengawasName: r.pengawas?.name,
            projectName: r.project?.name,
          });
        });
      });
      setPhotos(allPhotos);
    }
  };

  const handleProjectChange = async (id: string) => {
    setSelectedProject(id);
    setLoading(true);
    await loadPhotos(id);
    setLoading(false);
  };

  if (loading) return (
    <div>
      <div className="topbar"><div className="topbar-title">🖼️ Galeri Progres</div></div>
      <div className="page-content">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 280, borderRadius: 14 }} />)}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar-title">🖼️ Galeri Progres Proyek</div>
          <div className="topbar-sub">Foto dokumentasi yang sudah disetujui manager</div>
        </div>
        {projects.length > 1 && (
          <select
            className="input"
            style={{ width: 'auto' }}
            value={selectedProject}
            onChange={e => handleProjectChange(e.target.value)}
          >
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        )}
      </div>

      <div className="page-content">
        {photos.length === 0 ? (
          <div className="table-wrapper">
            <div className="empty-state">
              <div className="empty-state-icon">🖼️</div>
              <div className="empty-state-title">Belum ada foto progres</div>
              <div className="empty-state-desc">Foto akan muncul setelah laporan harian disetujui oleh manager proyek</div>
            </div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <span className="text-secondary" style={{ fontSize: 13 }}>{photos.length} foto dokumentasi</span>
              <span className="badge badge-success">✓ Semua sudah disetujui</span>
            </div>
            <div className="photo-grid">
              {photos.map((photo: any) => (
                <div key={photo.id} className="photo-card">
                  {photo.photoUrl ? (
                    <img
                      src={photo.photoUrl.startsWith('http') ? photo.photoUrl : `http://localhost:3000${photo.photoUrl}`}
                      alt={photo.caption || 'Foto progres'}
                      style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block', background: '#0e1118' }}
                      onError={e => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const parent = (e.target as HTMLImageElement).parentElement;
                        if (parent) parent.innerHTML = '<div style="height:200px;display:flex;align-items:center;justify-content:center;color:#4b5563;font-size:13px;background:#0e1118;">📷 Foto tidak tersedia</div>';
                      }}
                    />
                  ) : (
                    <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', background: '#0e1118', fontSize: 13 }}>
                      📷 Tidak ada foto
                    </div>
                  )}
                  <div className="photo-card-body">
                    {photo.caption && (
                      <p style={{ fontSize: 13, marginBottom: 8, color: '#cbd5e1' }}>{photo.caption}</p>
                    )}
                    <div style={{ fontSize: 12, color: '#4b5563', display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {photo.reportDate && (
                        <span>📅 {new Date(photo.reportDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      )}
                      {photo.progressPercentage !== undefined && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                          <div className="progress-bar" style={{ flex: 1 }}>
                            <div className="progress-fill" style={{ width: `${photo.progressPercentage}%` }} />
                          </div>
                          <span style={{ fontWeight: 700, color: '#f59e0b', fontSize: 13 }}>{photo.progressPercentage}%</span>
                        </div>
                      )}
                      {photo.pengawasName && (
                        <span>👤 {photo.pengawasName}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
