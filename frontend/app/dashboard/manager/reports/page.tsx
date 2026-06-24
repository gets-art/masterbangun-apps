'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
export default function ManagerReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  const loadData = () => {
    setLoading(true);
    api.get('/daily-reports').then(res => setReports(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => loadData(), []);

  const handleAction = async (id: string, action: 'approve' | 'revision') => {
    try {
      await api.patch(`/daily-reports/${id}/${action}`);
      setReports(prev => prev.map(r => r.id === id ? {
        ...r,
        status: action === 'approve' ? 'APPROVED' : 'REVISION'
      } : r));
    } catch (e: any) {
      alert(e.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const filtered = filterStatus ? reports.filter(r => r.status === filterStatus) : reports;
  const pendingCount = reports.filter(r => r.status === 'SUBMITTED').length;

  const statusLabel: Record<string, string> = {
    DRAFT: 'Draft',
    SUBMITTED: '⏳ Menunggu Review',
    APPROVED: '✓ Disetujui',
    REVISION: '↩ Perlu Revisi',
  };

  if (loading) return (
    <div>
      <div className="topbar"><div className="topbar-title">Laporan Harian</div></div>
      <div className="page-content">
        {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 52, marginBottom: 8 }} />)}
      </div>
    </div>
  );

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar-title">📋 Approval Laporan Harian</div>
          <div className="topbar-sub">Review dan setujui laporan dari pengawas lapangan</div>
        </div>
        {pendingCount > 0 && (
          <span className="badge badge-warning">🔔 {pendingCount} perlu ditinjau</span>
        )}
      </div>

      <div className="page-content">
        <div className="table-wrapper">
          <div className="table-header" style={{ flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['', 'SUBMITTED', 'APPROVED', 'REVISION', 'DRAFT'].map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  style={{ 
                    padding: '6px 14px', fontSize: 12, cursor: 'pointer', borderRadius: 20,
                    border: '1px solid',
                    borderColor: filterStatus === s ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                    background: filterStatus === s ? 'rgba(245,158,11,0.15)' : 'transparent',
                    color: filterStatus === s ? '#f59e0b' : '#94a3b8',
                    transition: 'all 0.2s'
                  }}
                >
                  {s === '' ? 'Semua' : statusLabel[s]}
                  {s === 'SUBMITTED' && pendingCount > 0 ? ` (${pendingCount})` : ''}
                </button>
              ))}
            </div>
            <span className="badge badge-info">{filtered.length} laporan</span>
          </div>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-title">Tidak ada laporan</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Proyek</th>
                  <th>Pengawas</th>
                  <th>Cuaca</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 500 }}>
                      {new Date(r.reportDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ fontWeight: 600 }}>{r.project?.name || '-'}</td>
                    <td className="td-muted">{r.pengawas?.name || '-'}</td>
                    <td>
                      {r.weather === 'CERAH' ? '☀️' : r.weather === 'MENDUNG' ? '⛅' : '🌧️'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${r.progressPercentage}%` }} />
                        </div>
                        <span style={{ fontSize: 12 }}>{r.progressPercentage}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        r.status === 'APPROVED' ? 'badge-success' :
                        r.status === 'SUBMITTED' ? 'badge-warning' :
                        r.status === 'REVISION' ? 'badge-danger' : 'badge-info'
                      }`}>{statusLabel[r.status] || r.status}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button
                          onClick={() => setSelectedReport(r)}
                          className="badge badge-info"
                          style={{ cursor: 'pointer', border: 'none', padding: '5px 12px' }}
                        >
                          👁️ Detail
                        </button>
                        {r.status === 'SUBMITTED' && (
                          <>
                            <button
                              onClick={() => handleAction(r.id, 'approve')}
                              className="badge badge-success"
                              style={{ cursor: 'pointer', border: 'none', padding: '5px 12px' }}
                            >
                              ✓ Setujui
                            </button>
                            <button
                              onClick={() => handleAction(r.id, 'revision')}
                              className="badge badge-danger"
                              style={{ cursor: 'pointer', border: 'none', padding: '5px 12px' }}
                            >
                              ↩ Revisi
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-title">
              📋 Detail Laporan Harian
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                <span className="badge badge-info">📅 {new Date(selectedReport.reportDate).toLocaleDateString('id-ID')}</span>
                <span className="badge badge-purple">📈 Progress: {selectedReport.progressPercentage}%</span>
                <span className="badge badge-warning">👤 {selectedReport.pengawas?.name}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, fontSize: 13, color: '#e2e8f0' }}>
                <strong style={{ color: '#94a3b8', display: 'block', marginBottom: 4 }}>Deskripsi Pekerjaan:</strong>
                {selectedReport.description}
              </div>
              {selectedReport.notes && (
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, fontSize: 13, color: '#e2e8f0', marginTop: 8 }}>
                  <strong style={{ color: '#94a3b8', display: 'block', marginBottom: 4 }}>Catatan:</strong>
                  {selectedReport.notes}
                </div>
              )}
            </div>

            <strong style={{ color: '#94a3b8', display: 'block', marginBottom: 8, fontSize: 13 }}>Dokumentasi Foto Awal ({selectedReport.photos?.length || 0}):</strong>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, maxHeight: 150, overflowY: 'auto', paddingRight: 4 }}>
              {selectedReport.photos && selectedReport.photos.length > 0 ? selectedReport.photos.map((p: any) => (
                <div key={p.id} style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <img 
                    src={getImageUrl(p.photoUrl)} 
                    alt="Dokumentasi" 
                    style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }}
                    onError={e => { (e.target as HTMLImageElement).parentElement!.innerHTML = '<div style="height:120px;display:flex;align-items:center;justify-content:center;color:#4b5563;font-size:11px;background:#0e1118;text-align:center;">Gagal memuat</div>'; }}
                  />
                  {p.caption && <div style={{ padding: '4px 8px', fontSize: 11, background: '#131722', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.caption}</div>}
                </div>
              )) : (
                <div style={{ gridColumn: '1 / -1', color: '#64748b', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Tidak ada foto awal terlampir</div>
              )}
            </div>

            {selectedReport.photoSessions && selectedReport.photoSessions.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <strong style={{ color: '#94a3b8', display: 'block', marginBottom: 8, fontSize: 13 }}>Sesi Foto Tambahan ({selectedReport.photoSessions.length}):</strong>
                <div style={{ maxHeight: 200, overflowY: 'auto', paddingRight: 4 }}>
                  {selectedReport.photoSessions.map((s: any) => (
                    <div key={s.id} style={{ marginBottom: 12, padding: 12, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{s.title || 'Sesi Tanpa Judul'}</div>
                      {s.description && <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>{s.description}</div>}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
                        {s.photos?.map((p: any) => (
                          <div key={p.id} style={{ position: 'relative' }}>
                            <img src={getImageUrl(p.photoUrl)} style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 4 }} alt="Foto sesi" />
                            {p.caption && <div style={{ position: 'absolute', bottom: 0, width: '100%', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 10, padding: 2, textAlign: 'center', borderBottomLeftRadius: 4, borderBottomRightRadius: 4 }}>{p.caption}</div>}
                          </div>
                        ))}
                        {(!s.photos || s.photos.length === 0) && <div style={{ fontSize: 12, color: '#64748b' }}>Belum ada foto</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button onClick={() => setSelectedReport(null)} className="btn-secondary">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
