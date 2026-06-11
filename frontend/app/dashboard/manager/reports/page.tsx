'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function ManagerReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

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
                  className={filterStatus === s ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '6px 14px', fontSize: 12 }}
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
                      {r.status === 'SUBMITTED' && (
                        <div style={{ display: 'flex', gap: 6 }}>
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
