'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function AdminTukang() {
  const [tukang, setTukang] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ name: '', phone: '', skill: '', type: 'HARIAN', dailyRate: '', contractValue: '', contractDesc: '' });
  const [currentUser, setCurrentUser] = useState<any>(null);

  const loadTukang = () => {
    setLoading(true);
    api.get('/tukang').then(res => setTukang(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTukang();
    const u = localStorage.getItem('user');
    if (u) setCurrentUser(JSON.parse(u));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        phone: formData.phone || undefined,
        skill: formData.skill || undefined,
        dailyRate: formData.type === 'HARIAN' && formData.dailyRate ? Number(formData.dailyRate) : undefined,
        contractValue: formData.type === 'BORONGAN' && formData.contractValue ? Number(formData.contractValue) : undefined,
        contractDesc: formData.type === 'BORONGAN' ? (formData.contractDesc || undefined) : undefined,
      };
      await api.post('/tukang', payload);
      setShowModal(false);
      setFormData({ name: '', phone: '', skill: '', type: 'HARIAN', dailyRate: '', contractValue: '', contractDesc: '' });
      loadTukang();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal registrasi tukang');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = tukang.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase()) || (t.skill || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div>
      <div className="topbar"><div className="topbar-title">Data Tukang</div></div>
      <div className="page-content">
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 52, marginBottom: 8, borderRadius: 8 }} />)}
      </div>
    </div>
  );

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar-title">👷 Data Tukang</div>
          <div className="topbar-sub">{tukang.length} tukang terdaftar</div>
        </div>
        {['SUPER_ADMIN', 'ADMIN_PROYEK'].includes(currentUser?.role) && (
          <button className="btn-primary" onClick={() => setShowModal(true)}>+ Registrasi Tukang</button>
        )}
      </div>

      <div className="page-content">
        <div className="table-wrapper">
          <div className="table-header">
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                className="input"
                placeholder="Cari nama atau keahlian..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <span className="badge badge-info">{filtered.length} tukang</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Nama Tukang</th>
                <th>Keahlian</th>
                <th>Tipe</th>
                <th>Tarif / Kontrak Global</th>
                <th>No. Telepon</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600 }}>{t.name}</td>
                  <td>
                    {t.skill ? (
                      <span className="badge badge-info" style={{ fontSize: 12 }}>{t.skill}</span>
                    ) : <span className="td-muted">—</span>}
                  </td>
                  <td><span className={`badge ${t.type === 'BORONGAN' ? 'badge-primary' : 'badge-warning'}`}>{t.type}</span></td>
                  <td>
                    {t.type === 'HARIAN' && t.dailyRate ? `Rp ${t.dailyRate.toLocaleString('id-ID')}/hari` : ''}
                    {t.type === 'BORONGAN' && t.contractValue ? `Rp ${t.contractValue.toLocaleString('id-ID')}` : ''}
                    {!t.dailyRate && !t.contractValue && <span className="td-muted">—</span>}
                  </td>
                  <td className="td-muted">{t.phone || '—'}</td>
                  <td>
                    <span className={`badge ${t.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {t.isActive ? '● Aktif' : '○ Nonaktif'}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6}>
                  <div className="empty-state"><div className="empty-state-icon">👷</div><div className="empty-state-title">Tidak ada tukang</div></div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-title">👷 Registrasi Tukang Baru</div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nama Lengkap</label>
                <input required type="text" className="input" placeholder="Ahmad Fauzi" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">No. Telepon / WA</label>
                <input type="tel" className="input" placeholder="08xx-xxxx-xxxx" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Keahlian / Spesialisasi</label>
                <input required type="text" className="input" placeholder="Contoh: Tukang Bata, Tukang Besi, Finishing..." value={formData.skill} onChange={e => setFormData({...formData, skill: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Tipe Tukang</label>
                <select className="input" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="HARIAN">Harian</option>
                  <option value="BORONGAN">Borongan</option>
                </select>
              </div>
              {formData.type === 'HARIAN' && (
                <div className="form-group">
                  <label className="form-label">Tarif Harian (Rp)</label>
                  <input type="number" className="input" value={formData.dailyRate} onChange={e => setFormData({...formData, dailyRate: e.target.value})} />
                </div>
              )}
              {formData.type === 'BORONGAN' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Nilai Kontrak Global (Rp)</label>
                    <input type="number" className="input" value={formData.contractValue} onChange={e => setFormData({...formData, contractValue: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Deskripsi Kontrak</label>
                    <input type="text" className="input" value={formData.contractDesc} onChange={e => setFormData({...formData, contractDesc: e.target.value})} />
                  </div>
                </>
              )}
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? '⏳ Menyimpan...' : '👷 Daftarkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
