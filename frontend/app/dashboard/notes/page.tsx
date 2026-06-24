'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { getUser } from '@/lib/auth';

export default function NotesPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  // Modals
  const [showAdd, setShowAdd] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState('');
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [submitting, setSubmitting] = useState(false);

  const user = getUser();

  useEffect(() => {
    api.get('/projects').then(res => {
      setProjects(res.data);
      if (res.data.length > 0) {
        setSelectedProjectId(res.data[0].id);
      } else {
        setLoading(false);
      }
    });
  }, []);

  const loadNotes = () => {
    setLoading(true);
    api.get(`/notes/project/${selectedProjectId}?archived=${showArchived}`)
      .then(res => setNotes(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!selectedProjectId) return;
    loadNotes();
  }, [selectedProjectId, showArchived]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;
    setSubmitting(true);
    try {
      if (isEditing) {
        await api.patch(`/notes/${editId}`, { title: formData.title, content: formData.content });
      } else {
        await api.post('/notes', { ...formData, projectId: selectedProjectId });
      }
      setShowAdd(false);
      setIsEditing(false);
      setEditId('');
      setFormData({ title: '', content: '' });
      loadNotes();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Gagal menyimpan catatan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditNote = (note: any) => {
    setFormData({ title: note.title, content: note.content });
    setEditId(note.id);
    setIsEditing(true);
    setShowAdd(true);
  };

  const handleTogglePin = async (id: string) => {
    try {
      await api.patch(`/notes/${id}/pin`);
      loadNotes();
    } catch (e: any) {
      alert('Gagal menyematkan catatan');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus permanen catatan ini?')) return;
    try {
      await api.delete(`/notes/${id}`);
      loadNotes();
    } catch (e: any) {
      alert('Gagal menghapus catatan');
    }
  };

  const handleArchiveToggle = async (id: string, currentlyArchived: boolean) => {
    if (!confirm(currentlyArchived ? 'Batal arsipkan catatan ini?' : 'Yakin ingin mengarsipkan catatan ini?')) return;
    try {
      if (currentlyArchived) await api.patch(`/notes/${id}/unarchive`);
      else await api.patch(`/notes/${id}/archive`);
      loadNotes();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengubah status arsip');
    }
  };

  // Only manager, super admin, admin proyek can pin/delete
  const canManage = ['MANAGER', 'SUPER_ADMIN', 'ADMIN_PROYEK'].includes(user?.role || '');

  if (loading && projects.length === 0) return (
    <div>
      <div className="topbar"><div className="topbar-title">Catatan Proyek</div></div>
      <div className="page-content">Loading...</div>
    </div>
  );

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar-title">📝 Catatan Proyek</div>
          <div className="topbar-sub">Catatan penting, notulensi meeting, dan pengingat proyek</div>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>
          + Tambah Catatan
        </button>
      </div>

      <div className="page-content">
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <label className="form-label" style={{ marginBottom: 0 }}>Pilih Proyek:</label>
          <select className="input" value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} style={{ width: 300, background: '#1e293b' }}>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button 
            className={`btn-secondary ${showArchived ? 'active' : ''}`} 
            onClick={() => setShowArchived(!showArchived)}
            style={{ padding: '8px 12px', background: showArchived ? '#3b82f6' : '#1e293b', color: showArchived ? 'white' : '#94a3b8' }}
          >
            {showArchived ? '📂 Sembunyikan Arsip' : '📂 Tampilkan Arsip'}
          </button>
        </div>

        {loading ? (
          <div>Memuat catatan...</div>
        ) : notes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <div className="empty-state-title">Belum ada catatan</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {notes.map(note => (
              <div key={note.id} style={{ 
                background: '#1e293b', 
                borderRadius: 12, 
                border: note.isPinned ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.05)',
                display: 'flex', flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: note.isPinned ? '0 4px 12px rgba(245,158,11,0.1)' : 'none'
              }}>
                {note.isPinned && (
                  <div style={{ position: 'absolute', top: 0, right: 0, background: '#f59e0b', color: '#fff', fontSize: 10, padding: '2px 8px', borderBottomLeftRadius: 8, fontWeight: 600 }}>
                    📌 PINNED
                  </div>
                )}
                <div style={{ padding: 16, flex: 1 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f8fafc', marginBottom: 8, paddingRight: note.isPinned ? 60 : 0 }}>{note.title}</h3>
                  <div style={{ whiteSpace: 'pre-wrap', fontSize: 13, color: '#cbd5e1', lineHeight: 1.5, marginBottom: 12 }}>
                    {note.content}
                  </div>
                </div>
                <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600 }}>
                      {note.user?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#e2e8f0', fontWeight: 500 }}>{note.user?.name}</div>
                      <div style={{ fontSize: 10, color: '#64748b' }}>{new Date(note.createdAt).toLocaleDateString('id-ID')}</div>
                    </div>
                  </div>
                  {canManage && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button onClick={() => handleTogglePin(note.id)} title={note.isPinned ? 'Unpin' : 'Pin'} style={{ background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.7, fontSize: 14 }}>
                        {note.isPinned ? '⭐' : '📌'}
                      </button>
                      <button onClick={() => handleEditNote(note)} title="Edit" style={{ background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.7, fontSize: 14 }}>
                        ✏️
                      </button>
                      <button onClick={() => handleArchiveToggle(note.id, note.isArchived)} title={note.isArchived ? "Batal Arsip" : "Arsipkan"} style={{ background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.7, fontSize: 14 }}>
                        {note.isArchived ? '📦 Batal' : '📦'}
                      </button>
                      <button onClick={() => handleDelete(note.id)} title="Hapus" style={{ background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.7, fontSize: 14 }}>
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={e => {
          if (e.target === e.currentTarget) {
            setShowAdd(false);
            setIsEditing(false);
          }
        }}>
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-title">{isEditing ? '✏️ Edit Catatan Proyek' : '📝 Tambah Catatan Proyek'}</div>
            <form onSubmit={handleAddNote}>
              <div className="form-group">
                <label className="form-label">Judul Catatan</label>
                <input required type="text" className="input" placeholder="Misal: Hasil Rapat Koordinasi 12 Okt" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Isi Catatan</label>
                <textarea required className="input" placeholder="Tulis catatan lengkap di sini..." value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} style={{ minHeight: 150 }} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => {
                  setShowAdd(false);
                  setIsEditing(false);
                }}>Batal</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? '⏳ Menyimpan...' : (isEditing ? '💾 Simpan Perubahan' : '💾 Simpan Catatan')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
