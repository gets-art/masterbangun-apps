'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function AdminProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  
  // Manage Team Modal State
  const [manageProject, setManageProject] = useState<any>(null);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [availableTukangs, setAvailableTukangs] = useState<any[]>([]);
  const [projectTukangs, setProjectTukangs] = useState<any[]>([]);
  const [projectUsers, setProjectUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedTukang, setSelectedTukang] = useState('');
  const [loadingManage, setLoadingManage] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    startDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE',
    normalStartHour: '08:00',
    normalEndHour: '17:00',
  });

  const loadProjects = () => {
    setLoading(true);
    api.get('/projects').then(res => setProjects(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => loadProjects(), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/projects', formData);
      setShowModal(false);
      setFormData({ name: '', address: '', startDate: new Date().toISOString().split('T')[0], status: 'ACTIVE', normalStartHour: '08:00', normalEndHour: '17:00' });
      loadProjects();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menambahkan proyek');
    } finally {
      setSubmitting(false);
    }
  };

  const openManageModal = async (project: any) => {
    setManageProject(project);
    setLoadingManage(true);
    try {
      const [uRes, tRes, ptRes, puRes] = await Promise.all([
        api.get('/users'),
        api.get('/tukang'),
        api.get(`/projects/${project.id}/tukang`),
        api.get(`/projects/${project.id}`)
      ]);
      setAvailableUsers(uRes.data);
      setAvailableTukangs(tRes.data);
      setProjectTukangs(ptRes.data);
      setProjectUsers(puRes.data.userAssignments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingManage(false);
    }
  };

  const handleAssignUser = async () => {
    if (!selectedUser) return;
    try {
      await api.post(`/projects/${manageProject.id}/assign-user`, { userId: selectedUser });
      setSelectedUser('');
      openManageModal(manageProject); // reload data
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal assign user');
    }
  };

  const handleAssignTukang = async () => {
    if (!selectedTukang) return;
    try {
      await api.post(`/projects/${manageProject.id}/assign-tukang`, { tukangId: selectedTukang });
      setSelectedTukang('');
      openManageModal(manageProject); // reload data
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal assign tukang');
    }
  };

  const filtered = projects.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.address.toLowerCase().includes(search.toLowerCase()));

  if (loading) return (
    <div>
      <div className="topbar"><div className="topbar-title">Manajemen Proyek</div></div>
      <div className="page-content">
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 60, marginBottom: 8, borderRadius: 8 }} />)}
      </div>
    </div>
  );

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar-title">🏗️ Manajemen Proyek</div>
          <div className="topbar-sub">{projects.length} proyek terdaftar</div>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ Tambah Proyek</button>
      </div>

      <div className="page-content">
        {/* Stats mini */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Aktif', value: projects.filter(p=>p.status==='ACTIVE').length, color: '#10b981', badge: 'badge-success' },
            { label: 'Selesai', value: projects.filter(p=>p.status==='COMPLETED').length, color: '#3b82f6', badge: 'badge-info' },
            { label: 'Ditunda', value: projects.filter(p=>p.status==='ON_HOLD').length, color: '#f59e0b', badge: 'badge-warning' },
          ].map(s => (
            <span key={s.label} className={`badge ${s.badge}`} style={{ fontSize: 13, padding: '6px 12px' }}>
              {s.value} {s.label}
            </span>
          ))}
        </div>

        <div className="table-wrapper">
          <div className="table-header">
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input className="input" placeholder="Cari proyek..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <span className="badge badge-info">{filtered.length} proyek</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Nama Proyek</th>
                <th>Alamat</th>
                <th>Mulai</th>
                <th>Progress</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td className="td-muted" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.address}</td>
                  <td className="td-muted">{p.startDate ? new Date(p.startDate).toLocaleDateString('id-ID') : '-'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="progress-bar" style={{ width: 80 }}>
                        <div className="progress-fill" style={{ width: `${p.progressPercentage}%` }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{p.progressPercentage}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${
                      p.status === 'ACTIVE' ? 'badge-success' :
                      p.status === 'COMPLETED' ? 'badge-info' :
                      p.status === 'ON_HOLD' ? 'badge-warning' : 'badge-danger'
                    }`}>{
                      p.status === 'ACTIVE' ? '● Aktif' :
                      p.status === 'COMPLETED' ? '✓ Selesai' :
                      p.status === 'ON_HOLD' ? '⏸ Ditunda' : '✕ Dibatalkan'
                    }</span>
                  </td>
                  <td>
                    <button onClick={() => openManageModal(p)} className="badge badge-purple" style={{ border: 'none', cursor: 'pointer', padding: '6px 12px' }}>👥 Kelola Tim</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6}><div className="empty-state"><div className="empty-state-icon">🏗️</div><div className="empty-state-title">Tidak ada proyek</div></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-title">🏗️ Tambah Proyek Baru</div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nama Proyek</label>
                <input required type="text" className="input" placeholder="Contoh: Rumah Pak Budi — Depok" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Alamat Lokasi</label>
                <textarea required className="input" placeholder="Alamat lengkap lokasi proyek..." value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Tanggal Mulai</label>
                  <input type="date" className="input" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="input" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="ACTIVE">Aktif (Sedang Berjalan)</option>
                    <option value="ON_HOLD">Ditunda</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Jam Kerja Mulai</label>
                  <input type="time" className="input" value={formData.normalStartHour} onChange={e => setFormData({...formData, normalStartHour: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Jam Kerja Selesai</label>
                  <input type="time" className="input" value={formData.normalEndHour} onChange={e => setFormData({...formData, normalEndHour: e.target.value})} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? '⏳ Menyimpan...' : '🏗️ Buat Proyek'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {manageProject && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setManageProject(null)}>
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-title">👥 Kelola Tim: {manageProject.name}</div>
            {loadingManage ? <p style={{ color: '#94a3b8' }}>Memuat data...</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                
                {/* Section Assign User */}
                <div style={{ background: '#1e212b', padding: 16, borderRadius: 8 }}>
                  <h4 style={{ margin: '0 0 12px', color: '#f8fafc' }}>Staf & Pengurus (Mandor, Pengawas, dll)</h4>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <select className="input" value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
                      <option value="">Pilih User...</option>
                      {availableUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                    </select>
                    <button onClick={handleAssignUser} className="btn-primary" style={{ whiteSpace: 'nowrap' }}>+ Tambahkan</button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {projectUsers.map((pu: any) => (
                      <span key={pu.userId} className="badge badge-info">{pu.user.name} ({pu.user.role})</span>
                    ))}
                    {projectUsers.length === 0 && <span style={{ color: '#64748b', fontSize: 13 }}>Belum ada pengurus</span>}
                  </div>
                </div>

                {/* Section Assign Tukang */}
                <div style={{ background: '#1e212b', padding: 16, borderRadius: 8 }}>
                  <h4 style={{ margin: '0 0 12px', color: '#f8fafc' }}>Tukang Lapangan</h4>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <select className="input" value={selectedTukang} onChange={e => setSelectedTukang(e.target.value)}>
                      <option value="">Pilih Tukang...</option>
                      {availableTukangs.map(t => <option key={t.id} value={t.id}>{t.name} ({t.specialty})</option>)}
                    </select>
                    <button onClick={handleAssignTukang} className="btn-primary" style={{ whiteSpace: 'nowrap' }}>+ Tambahkan</button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {projectTukangs.map((pt: any) => (
                      <span key={pt.tukang.id} className="badge badge-success">{pt.tukang.name}</span>
                    ))}
                    {projectTukangs.length === 0 && <span style={{ color: '#64748b', fontSize: 13 }}>Belum ada tukang</span>}
                  </div>
                </div>

              </div>
            )}
            <div className="modal-actions" style={{ marginTop: 24 }}>
              <button type="button" className="btn-secondary" onClick={() => setManageProject(null)}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
