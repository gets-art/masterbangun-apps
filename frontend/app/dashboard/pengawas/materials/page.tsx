'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function PengawasMaterials() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    api.get('/materials').then(res => setMaterials(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => loadData(), []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      await api.patch(`/materials/${id}/${action}`);
      loadData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const urgencyLabel: Record<string, string> = {
    RENDAH: 'Rendah',
    SEDANG: 'Sedang',
    TINGGI: 'Tinggi',
  };

  const urgencyClass: Record<string, string> = {
    RENDAH: 'badge-info',
    SEDANG: 'badge-warning',
    TINGGI: 'badge-danger',
  };

  const pending = materials.filter(m => m.status === 'PENDING');

  if (loading) return (
    <div>
      <div className="topbar">
        <div className="topbar-title">📦 Material</div>
      </div>
      <div className="page-content">
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 52, marginBottom: 8 }} />)}
      </div>
    </div>
  );

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar-title">📦 Review Material</div>
          <div className="topbar-sub">Kelola pengajuan material dari mandor</div>
        </div>
        {pending.length > 0 && (
          <span className="badge badge-danger">{pending.length} pending persetujuan</span>
        )}
      </div>

      <div className="page-content">
        {materials.length === 0 ? (
          <div className="table-wrapper">
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <div className="empty-state-title">Belum ada pengajuan material</div>
              <div className="empty-state-desc">Mandor belum mengajukan permintaan material</div>
            </div>
          </div>
        ) : (
          <div className="table-wrapper">
            <div className="table-header">
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>Pengajuan Material</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <span className="badge badge-warning">{pending.length} Pending</span>
                <span className="badge badge-success">{materials.filter(m => m.status === 'APPROVED').length} Disetujui</span>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Proyek</th>
                  <th>Material</th>
                  <th>Jumlah</th>
                  <th>Urgensi</th>
                  <th>Mandor</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {materials.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 500 }}>{m.project?.name || '-'}</td>
                    <td>{m.materialName || m.itemName || '-'}</td>
                    <td>{m.quantity} {m.unit || 'pcs'}</td>
                    <td>
                      <span className={`badge ${urgencyClass[m.urgency] || 'badge-info'}`}>
                        {urgencyLabel[m.urgency] || m.urgency || '-'}
                      </span>
                    </td>
                    <td className="td-muted">{m.mandor?.name || '-'}</td>
                    <td>
                      <span className={`badge ${
                        m.status === 'APPROVED' ? 'badge-success' :
                        m.status === 'PENDING' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {m.status === 'APPROVED' ? 'Disetujui' : m.status === 'PENDING' ? 'Menunggu' : 'Ditolak'}
                      </span>
                    </td>
                    <td>
                      {m.status === 'PENDING' ? (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={() => handleAction(m.id, 'approve')}
                            className="badge badge-success"
                            style={{ cursor: 'pointer', border: 'none', padding: '5px 12px' }}
                          >
                            ✓ Setujui
                          </button>
                          <button
                            onClick={() => handleAction(m.id, 'reject')}
                            className="badge badge-danger"
                            style={{ cursor: 'pointer', border: 'none', padding: '5px 12px' }}
                          >
                            ✕ Tolak
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted" style={{ fontSize: 12 }}>—</span>
                      )}
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
