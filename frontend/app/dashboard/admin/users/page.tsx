'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'PENGAWAS', phone: '' });

  const loadUsers = () => {
    setLoading(true);
    api.get('/users').then(res => setUsers(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => loadUsers(), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/users', formData);
      setShowModal(false);
      setFormData({ name: '', email: '', password: '', role: 'PENGAWAS', phone: '' });
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menambahkan user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await api.patch(`/users/${id}`, { isActive: !isActive });
      loadUsers();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Gagal mengubah status user');
    }
  };

  const filtered = users.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = !filterRole || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const roleLabel: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN_PROYEK: 'Admin Proyek',
    MANAGER: 'Manager',
    PENGAWAS: 'Pengawas',
    MANDOR: 'Mandor',
    KONSUMEN: 'Konsumen',
  };

  const roleBadgeClass: Record<string, string> = {
    SUPER_ADMIN: 'badge-danger',
    ADMIN_PROYEK: 'badge-purple',
    MANAGER: 'badge-warning',
    PENGAWAS: 'badge-info',
    MANDOR: 'badge-success',
    KONSUMEN: 'badge-info',
  };

  if (loading) return (
    <div>
      <div className="topbar"><div className="topbar-title">Kelola User</div></div>
      <div className="page-content">
        {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 52, marginBottom: 8, borderRadius: 8 }} />)}
      </div>
    </div>
  );

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar-title">👥 Kelola User</div>
          <div className="topbar-sub">{users.length} user terdaftar</div>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ Tambah User</button>
      </div>

      <div className="page-content">
        <div className="table-wrapper">
          <div className="table-header" style={{ flexWrap: 'wrap', gap: 12 }}>
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                className="input"
                placeholder="Cari nama atau email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="input"
              style={{ width: 'auto' }}
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
            >
              <option value="">Semua Role</option>
              {Object.entries(roleLabel).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
            <span className="badge badge-info">{filtered.length} ditampilkan</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td className="td-muted">{u.email}</td>
                  <td>
                    <span className={`badge ${roleBadgeClass[u.role] || 'badge-info'}`}>
                      {roleLabel[u.role] || u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {u.isActive ? '● Aktif' : '○ Nonaktif'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleActive(u.id, u.isActive)}
                      className={u.isActive ? 'btn-danger' : 'badge badge-success'}
                      style={{ fontSize: 12, padding: '5px 12px', cursor: 'pointer', border: 'none' }}
                    >
                      {u.isActive ? '⏸ Nonaktifkan' : '▶ Aktifkan'}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Tidak ada user yang cocok</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-title">👤 Tambah User Baru</div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nama Lengkap</label>
                <input required type="text" className="input" placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input required type="email" className="input" placeholder="email@domain.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">No. Telepon (Opsional)</label>
                <input type="tel" className="input" placeholder="08xx-xxxx-xxxx" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input required type="password" minLength={6} className="input" placeholder="Minimal 6 karakter" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Role / Jabatan</label>
                <select className="input" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="MANAGER">Manager Operasional</option>
                  <option value="ADMIN_PROYEK">Admin Proyek</option>
                  <option value="PENGAWAS">Pengawas Lapangan</option>
                  <option value="MANDOR">Mandor</option>
                  <option value="KONSUMEN">Konsumen / Pemilik</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? '⏳ Menyimpan...' : '✅ Tambah User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
