'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function ManagerMaterials() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    api.get('/materials').then(res => setMaterials(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => loadData(), []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      await api.patch(`/materials/${id}/${action}`);
      loadData();
    } catch (e) {
      alert('Terjadi kesalahan');
    }
  };

  if (loading) return <div style={{ padding: 32, color: '#64748b' }}>Memuat data...</div>;

  return (
    <div>
      <div className="topbar">
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Persetujuan Material</h2>
      </div>
      <div className="page-content">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Proyek</th><th>Item</th><th>Jumlah</th><th>Urgensi</th><th>Diminta Oleh</th><th>Catatan</th><th>Status</th><th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {materials.map(m => (
                <tr key={m.id}>
                  <td style={{ fontWeight: 500 }}>{m.project?.name || '-'}</td>
                  <td style={{ fontWeight: 600 }}>{m.materialName}</td>
                  <td>{m.quantity} {m.unit}</td>
                  <td>
                    <span className={`badge ${
                      m.urgency === 'TINGGI' ? 'badge-danger' : 
                      m.urgency === 'SEDANG' ? 'badge-warning' : 'badge-info'
                    }`}>{m.urgency}</span>
                  </td>
                  <td style={{ color: '#94a3b8' }}>{m.mandor?.name || '-'}</td>
                  <td style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={m.notes}>
                    {m.notes || '-'}
                  </td>
                  <td>
                    <span className={`badge ${
                      m.status === 'APPROVED' ? 'badge-success' :
                      m.status === 'PENDING' ? 'badge-warning' : 'badge-danger'
                    }`}>{m.status}</span>
                  </td>
                  <td>
                    {m.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => handleAction(m.id, 'approve')} className="badge badge-success" style={{ cursor: 'pointer', border: 'none' }}>Setujui</button>
                        <button onClick={() => handleAction(m.id, 'reject')} className="badge badge-danger" style={{ cursor: 'pointer', border: 'none' }}>Tolak</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {materials.length === 0 && <p style={{ padding: 20, color: '#64748b', margin: 0 }}>Belum ada pengajuan material</p>}
        </div>
      </div>
    </div>
  );
}
