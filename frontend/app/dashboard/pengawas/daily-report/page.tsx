'use client';
import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';

export default function PengawasDailyReport() {
  const [reports, setReports] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    projectId: '',
    reportDate: new Date().toISOString().split('T')[0],
    weather: 'CERAH',
    description: '',
    progressPercentage: 0,
    notes: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([api.get('/daily-reports'), api.get('/projects')])
      .then(([r, p]) => {
        setReports(r.data);
        setProjects(p.data);
        if (p.data.length > 0) setFormData(f => ({ ...f, projectId: p.data[0].id }));
      }).finally(() => setLoading(false));
  };

  useEffect(() => loadData(), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description) return alert('Deskripsi lapangan wajib diisi!');
    setSubmitting(true);
    try {
      let photoUrl: string | undefined;

      if (photo) {
        const form = new FormData();
        form.append('file', photo);
        const uploadRes = await api.post('/upload/photo', form);
        photoUrl = uploadRes.data.url;
      }

      await api.post('/daily-reports', {
        projectId: formData.projectId,
        reportDate: formData.reportDate,
        weather: formData.weather,
        description: formData.description,
        progressPercentage: Number(formData.progressPercentage),
        notes: formData.notes || undefined,
        photoUrls: photoUrl ? [photoUrl] : undefined,
      });

      setShowModal(false);
      setPhoto(null);
      setFormData(f => ({
        ...f,
        description: '',
        progressPercentage: 0,
        notes: ''
      }));
      loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      alert(Array.isArray(msg) ? msg.join('\n') : msg || 'Gagal mengirim laporan');
    } finally {
      setSubmitting(false);
    }
  };

  const statusLabel: Record<string, string> = {
    DRAFT: 'Draft',
    SUBMITTED: 'Dikirim',
    APPROVED: 'Disetujui',
    REVISION: 'Perlu Revisi',
  };

  if (loading) return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar-title">Laporan Harian</div>
          <div className="topbar-sub">Pengawas Lapangan</div>
        </div>
      </div>
      <div className="page-content">
        {[1,2,3].map(i => (
          <div key={i} className="skeleton" style={{ height: 52, marginBottom: 8, borderRadius: 8 }} />
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar-title">📋 Laporan Harian</div>
          <div className="topbar-sub">Buat dan kelola laporan progres lapangan</div>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Buat Laporan
        </button>
      </div>

      <div className="page-content">
        {reports.length === 0 ? (
          <div className="table-wrapper">
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-title">Belum ada laporan harian</div>
              <div className="empty-state-desc">Klik tombol "Buat Laporan" untuk menambahkan laporan baru</div>
            </div>
          </div>
        ) : (
          <div className="table-wrapper">
            <div className="table-header">
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>Riwayat Laporan</h3>
              <span className="badge badge-info">{reports.length} laporan</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Proyek</th>
                  <th>Cuaca</th>
                  <th>Progress</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 500 }}>
                      {new Date(r.reportDate).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="td-muted">{r.project?.name || '-'}</td>
                    <td>
                      <span>{r.weather === 'CERAH' ? '☀️ Cerah' : r.weather === 'MENDUNG' ? '⛅ Mendung' : '🌧️ Hujan'}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${r.progressPercentage}%` }} />
                        </div>
                        <span style={{ fontSize: 12, minWidth: 32 }}>{r.progressPercentage}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        r.status === 'APPROVED' ? 'badge-success' :
                        r.status === 'SUBMITTED' ? 'badge-warning' :
                        r.status === 'REVISION' ? 'badge-danger' : 'badge-info'
                      }`}>{statusLabel[r.status] || r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 540 }}>
            <div className="modal-title">📋 Buat Laporan Harian</div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Proyek</label>
                <select required className="input" value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})}>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Tanggal Laporan</label>
                  <input type="date" className="input" value={formData.reportDate} onChange={e => setFormData({...formData, reportDate: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Kondisi Cuaca</label>
                  <select className="input" value={formData.weather} onChange={e => setFormData({...formData, weather: e.target.value})}>
                    <option value="CERAH">☀️ Cerah</option>
                    <option value="MENDUNG">⛅ Mendung</option>
                    <option value="HUJAN">🌧️ Hujan</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Progres Bangunan — {formData.progressPercentage}%</label>
                <div style={{ padding: '4px 0' }}>
                  <input
                    type="range" min="0" max="100"
                    value={formData.progressPercentage}
                    onChange={e => setFormData({...formData, progressPercentage: Number(e.target.value)})}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#4b5563', marginTop: 2 }}>
                    <span>0%</span><span>50%</span><span>100%</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Deskripsi Pekerjaan Hari Ini *</label>
                <textarea
                  required
                  className="input"
                  placeholder="Contoh: Pengecoran lantai 2, pemasangan besi tulang kolom..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  style={{ minHeight: 90 }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Catatan Tambahan</label>
                <textarea
                  className="input"
                  placeholder="Kendala, catatan khusus, dsb..."
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  style={{ minHeight: 70 }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Foto Dokumentasi (Opsional)</label>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={e => e.target.files?.[0] && setPhoto(e.target.files[0])}
                  style={{ display: 'none' }}
                />
                {!photo ? (
                  <div className="photo-upload" onClick={() => fileInputRef.current?.click()}>
                    <div className="photo-upload-icon">📷</div>
                    <div className="photo-upload-text">Upload Foto Progress</div>
                    <div className="photo-upload-hint">JPG, PNG — Maks. 10MB</div>
                  </div>
                ) : (
                  <div className="photo-preview">
                    <img src={URL.createObjectURL(photo)} alt="Preview" />
                    <button type="button" className="photo-preview-retake" onClick={() => { setPhoto(null); fileInputRef.current && (fileInputRef.current.value = ''); }}>
                      Ganti Foto
                    </button>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => { setShowModal(false); setPhoto(null); }}>
                  Batal
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? '⏳ Menyimpan...' : '📤 Kirim Laporan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
