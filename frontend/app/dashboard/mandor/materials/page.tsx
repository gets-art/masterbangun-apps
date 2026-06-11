'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function MandorMaterials() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    projectId: '',
    materialName: '',
    quantity: 1,
    unit: 'buah',
    urgency: 'SEDANG',
    notes: '',
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([api.get('/materials'), api.get('/projects')])
      .then(([m, p]) => {
        setMaterials(m.data);
        setProjects(p.data);
        if (p.data.length > 0) setFormData(f => ({ ...f, projectId: p.data[0].id }));
      }).finally(() => setLoading(false));
  };

  useEffect(() => loadData(), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/materials', {
        projectId: formData.projectId,
        materialName: formData.materialName,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        urgency: formData.urgency,
        notes: formData.notes || undefined,
      });
      setShowModal(false);
      setFormData(f => ({ ...f, materialName: '', quantity: 1, notes: '' }));
      loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      alert(Array.isArray(msg) ? msg.join('\n') : msg || 'Gagal mengajukan material');
    } finally {
      setSubmitting(false);
    }
  };

  const urgencyClass: Record<string, string> = {
    RENDAH: 'badge-info',
    SEDANG: 'badge-warning',
    TINGGI: 'badge-danger',
  };

  const urgencyLabel: Record<string, string> = {
    RENDAH: '🟢 Rendah',
    SEDANG: '🟡 Sedang',
    TINGGI: '🔴 Tinggi',
  };

  if (loading) return (
    <div>
      <div className="topbar"><div className="topbar-title">📦 Material</div></div>
      <div className="page-content">
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 52, marginBottom: 8 }} />)}
      </div>
    </div>
  );

  const pending = materials.filter(m => m.status === 'PENDING').length;

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar-title">📦 Pengajuan Material</div>
          <div className="topbar-sub">{pending > 0 ? `${pending} pengajuan menunggu persetujuan` : 'Kelola kebutuhan material proyek'}</div>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ Ajukan Baru</button>
      </div>

      <div className="page-content">
        {materials.length === 0 ? (
          <div className="table-wrapper">
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <div className="empty-state-title">Belum ada pengajuan material</div>
              <div className="empty-state-desc">Klik "Ajukan Baru" untuk mengajukan material yang dibutuhkan</div>
            </div>
          </div>
        ) : (
          <div className="table-wrapper">
            <div className="table-header">
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>Riwayat Pengajuan</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <span className="badge badge-warning">{pending} Pending</span>
                <span className="badge badge-success">{materials.filter(m => m.status === 'APPROVED').length} Disetujui</span>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Jumlah</th>
                  <th>Urgensi</th>
                  <th>Proyek</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {materials.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 500 }}>{m.materialName || m.itemName}</td>
                    <td>{m.quantity} <span className="td-muted">{m.unit}</span></td>
                    <td>
                      <span className={`badge ${urgencyClass[m.urgency] || 'badge-info'}`}>
                        {urgencyLabel[m.urgency] || m.urgency}
                      </span>
                    </td>
                    <td className="td-muted">{m.project?.name || '-'}</td>
                    <td>
                      <span className={`badge ${
                        m.status === 'APPROVED' ? 'badge-success' :
                        m.status === 'PENDING' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {m.status === 'APPROVED' ? '✓ Disetujui' :
                         m.status === 'PENDING' ? '⏳ Menunggu' : '✕ Ditolak'}
                      </span>
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
          <div className="modal">
            <div className="modal-title">📦 Ajukan Material</div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Proyek</label>
                <select required className="input" value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})}>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Nama Material</label>
                <input
                  required type="text" className="input"
                  placeholder="Contoh: Semen Gresik 50kg, Besi Beton 10mm..."
                  value={formData.materialName}
                  onChange={e => setFormData({...formData, materialName: e.target.value})}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Jumlah</label>
                  <input
                    required type="number" min="1" className="input"
                    value={formData.quantity}
                    onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Satuan</label>
                  <select className="input" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                    <option value="buah">Buah</option>
                    <option value="sak">Sak</option>
                    <option value="kg">Kg</option>
                    <option value="ton">Ton</option>
                    <option value="liter">Liter</option>
                    <option value="m">Meter</option>
                    <option value="m2">M²</option>
                    <option value="m3">M³</option>
                    <option value="lonjor">Lonjor</option>
                    <option value="lembar">Lembar</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tingkat Urgensi</label>
                <select className="input" value={formData.urgency} onChange={e => setFormData({...formData, urgency: e.target.value})}>
                  <option value="RENDAH">🟢 Rendah — Tidak mendesak</option>
                  <option value="SEDANG">🟡 Sedang — Diperlukan segera</option>
                  <option value="TINGGI">🔴 Tinggi — Kritis / Proyek bisa terhenti</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Keterangan Tambahan</label>
                <textarea
                  className="input"
                  placeholder="Merek spesifik, spesifikasi, dsb..."
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  style={{ minHeight: 70 }}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? '⏳ Mengajukan...' : '📤 Ajukan Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
