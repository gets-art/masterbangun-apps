'use client';
import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import { getUser } from '@/lib/auth';

const categories = ['GAMBAR_KERJA', 'DENAH', 'GAMBAR_3D', 'RAB', 'KONTRAK', 'INVOICE', 'LAPORAN', 'LAINNYA'];
const categoryLabels: Record<string, string> = {
  GAMBAR_KERJA: 'Gambar Kerja',
  DENAH: 'Denah',
  GAMBAR_3D: 'Gambar 3D',
  RAB: 'RAB',
  KONTRAK: 'Kontrak',
  INVOICE: 'Invoice',
  LAPORAN: 'Laporan',
  LAINNYA: 'Lainnya',
};

export default function DocumentsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const getAllowedCategories = () => {
    const role = currentUser?.role;
    if (['SUPER_ADMIN', 'ADMIN_PROYEK', 'MANAGER'].includes(role)) {
      return ['KONTRAK', 'INVOICE', 'LAPORAN', 'LAINNYA'];
    }
    if (role === 'ARSITEK') {
      return ['DENAH', 'GAMBAR_3D', 'LAINNYA'];
    }
    if (role === 'DRAFTER') {
      return ['GAMBAR_KERJA', 'LAINNYA'];
    }
    if (role === 'ESTIMATOR') {
      return ['RAB', 'LAINNYA'];
    }
    return ['LAPORAN', 'LAINNYA']; // PENGAWAS, MANDOR, etc
  };

  // Associations Data
  const [projectUsers, setProjectUsers] = useState<any[]>([]);
  const [projectTukangs, setProjectTukangs] = useState<any[]>([]);
  const [materialReqs, setMaterialReqs] = useState<any[]>([]);

  // Modals
  const [showUpload, setShowUpload] = useState(false);
  const [showHistoryId, setShowHistoryId] = useState('');
  const [historyDocs, setHistoryDocs] = useState<any[]>([]);
  
  const [showCommentsId, setShowCommentsId] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');

  // Upload Form
  const [uploadData, setUploadData] = useState({ 
    title: '', category: 'GAMBAR_KERJA', notes: '', parentId: '',
    relatedUserId: '', relatedTukangId: '', materialReqId: ''
  });
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [editDocId, setEditDocId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (!selectedProjectId) return;
    setLoading(true);
    
    // Load documents
    api.get(`/documents/project/${selectedProjectId}?archived=${showArchived}`)
      .then(res => setDocuments(res.data))
      .finally(() => setLoading(false));

    // Load associations
    api.get(`/projects/${selectedProjectId}`).then(res => {
      setProjectUsers(res.data.userAssignments?.map((a: any) => a.user) || []);
      setProjectTukangs(res.data.tukangAssignments?.map((a: any) => a.tukang) || []);
      setMaterialReqs(res.data.materialRequests || []);
    }).catch(console.error);

  }, [selectedProjectId, showArchived]);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setCurrentUser(JSON.parse(u));
  }, []);

  const loadHistory = async (id: string) => {
    try {
      const res = await api.get(`/documents/${id}/history`);
      setHistoryDocs(res.data);
      setShowHistoryId(id);
    } catch (e: any) {
      alert('Gagal memuat history');
    }
  };

  const loadComments = async (id: string) => {
    try {
      const res = await api.get(`/documents/${id}/comments`);
      setComments(res.data);
      setShowCommentsId(id);
    } catch (e: any) {
      alert('Gagal memuat komentar');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await api.post(`/documents/${showCommentsId}/comments`, { content: newComment });
      setComments(prev => [...prev, res.data]);
      setNewComment('');
    } catch (e: any) {
      alert('Gagal mengirim komentar');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditingMetadata) {
        await api.patch(`/documents/${editDocId}`, {
          fileName: uploadData.title,
          category: uploadData.category,
          description: uploadData.notes,
          relatedUserId: uploadData.relatedUserId || null,
          relatedTukangId: uploadData.relatedTukangId || null,
          materialReqId: uploadData.materialReqId || null,
        });
        setIsEditingMetadata(false);
        setEditDocId('');
        setShowUpload(false);
        setUploadData({ title: '', category: 'GAMBAR_KERJA', notes: '', parentId: '', relatedUserId: '', relatedTukangId: '', materialReqId: '' });
        api.get(`/documents/project/${selectedProjectId}?archived=${showArchived}`).then(res => setDocuments(res.data));
        return;
      }

      if (!file) {
        setSubmitting(false);
        return alert('Pilih file dokumen!');
      }

      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes = await api.post('/upload/document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const payload = {
        projectId: selectedProjectId,
        fileName: uploadData.title,
        fileUrl: uploadRes.data.url,
        fileSize: file.size,
        fileType: file.type || file.name.split('.').pop() || 'unknown',
        category: uploadData.category,
        description: uploadData.notes,
        relatedUserId: uploadData.relatedUserId || null,
        relatedTukangId: uploadData.relatedTukangId || null,
        materialReqId: uploadData.materialReqId || null,
      };

      if (uploadData.parentId) {
        await api.post(`/documents/${uploadData.parentId}/versions`, payload);
      } else {
        await api.post('/documents', payload);
      }

      setShowUpload(false);
      setFile(null);
      setUploadData({ title: '', category: 'GAMBAR_KERJA', notes: '', parentId: '', relatedUserId: '', relatedTukangId: '', materialReqId: '' });
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // Reload docs
      const res = await api.get(`/documents/project/${selectedProjectId}?archived=${showArchived}`);
      setDocuments(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal upload/simpan dokumen');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditMetadata = (d: any) => {
    setUploadData({
      title: d.fileName,
      category: d.category,
      notes: d.description || '',
      parentId: '',
      relatedUserId: d.relatedUserId || '',
      relatedTukangId: d.relatedTukangId || '',
      materialReqId: d.materialReqId || '',
    });
    setEditDocId(d.id);
    setIsEditingMetadata(true);
    setShowUpload(true);
  };

  const handleArchiveToggle = async (id: string, currentlyArchived: boolean) => {
    if (!confirm(currentlyArchived ? 'Batal arsipkan dokumen ini?' : 'Yakin ingin mengarsipkan dokumen ini?')) return;
    try {
      if (currentlyArchived) await api.patch(`/documents/${id}/unarchive`);
      else await api.patch(`/documents/${id}/archive`);
      api.get(`/documents/project/${selectedProjectId}?archived=${showArchived}`).then(res => setDocuments(res.data));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengubah status arsip');
    }
  };

  const filtered = documents.filter(d => (!filterCategory || d.category === filterCategory) && !d.parentId);

  if (loading && projects.length === 0) return (
    <div>
      <div className="topbar"><div className="topbar-title">Dokumen Proyek</div></div>
      <div className="page-content">Loading...</div>
    </div>
  );

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar-title">📁 Dokumen Proyek</div>
          <div className="topbar-sub">Kelola file, gambar kerja, dan dokumen legalitas</div>
        </div>
        <button className="btn-primary" onClick={() => { 
          const allowed = getAllowedCategories();
          setUploadData(f => ({ ...f, parentId: '', category: allowed[0] || 'LAINNYA' })); 
          setShowUpload(true); 
        }}>
          + Upload Dokumen
        </button>
      </div>

      <div className="page-content">
        <div style={{ marginBottom: 20 }}>
          <label className="form-label">Pilih Proyek:</label>
          <select className="input" value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} style={{ maxWidth: 400 }}>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="table-wrapper">
          <div className="table-header" style={{ flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button
                onClick={() => setFilterCategory('')}
                className={`badge ${!filterCategory ? 'badge-primary' : 'badge-info'}`}
                style={{ cursor: 'pointer', border: 'none' }}
              >Semua</button>
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => setFilterCategory(c)}
                  className={`badge ${filterCategory === c ? 'badge-primary' : 'badge-info'}`}
                  style={{ cursor: 'pointer', border: 'none' }}
                >{categoryLabels[c]}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button 
                className={`btn-secondary ${showArchived ? 'active' : ''}`} 
                onClick={() => setShowArchived(!showArchived)}
                style={{ padding: '8px 12px', background: showArchived ? '#3b82f6' : '#1e293b', color: showArchived ? 'white' : '#94a3b8' }}
              >
                {showArchived ? '📂 Sembunyikan Arsip' : '📂 Tampilkan Arsip'}
              </button>
              <span className="badge badge-info">{filtered.length} Dokumen Utama</span>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 20 }}>Memuat dokumen...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📁</div>
              <div className="empty-state-title">Belum ada dokumen</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Dokumen</th>
                  <th>Kategori</th>
                  <th>Versi</th>
                  <th>Diupload Oleh</th>
                  <th>Tanggal</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>{d.fileName}</div>
                      {d.description && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{d.description}</div>}
                      <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                        {d.relatedUser && <span className="badge badge-purple" style={{ fontSize: 10, padding: '2px 6px' }}>👤 {d.relatedUser.name} ({d.relatedUser.role})</span>}
                        {d.relatedTukang && <span className="badge badge-warning" style={{ fontSize: 10, padding: '2px 6px' }}>👷 {d.relatedTukang.name}</span>}
                        {d.materialRequest && <span className="badge badge-info" style={{ fontSize: 10, padding: '2px 6px' }}>🧱 Permintaan Material</span>}
                      </div>
                    </td>
                    <td><span className="badge badge-purple">{categoryLabels[d.category]}</span></td>
                    <td>
                      <span className="badge badge-warning" style={{ cursor: 'pointer' }} onClick={() => loadHistory(d.id)}>
                        v{d.version} 🕒
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: 12 }}>{d.uploader?.name}</div>
                      <div style={{ fontSize: 10, color: '#64748b' }}>{d.uploader?.role}</div>
                    </td>
                    <td className="td-muted">{new Date(d.createdAt).toLocaleDateString('id-ID')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <a href={getImageUrl(d.fileUrl)} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '4px 8px', fontSize: 12, textDecoration: 'none' }}>
                          ⬇️ Unduh
                        </a>
                        <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => loadComments(d.id)}>
                          💬 Komentar ({d.comments?.length || 0})
                        </button>
                        {!d.isArchived && (
                          <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => {
                            setUploadData({ title: d.fileName, category: d.category, notes: '', parentId: d.id, relatedUserId: '', relatedTukangId: '', materialReqId: '' });
                            setShowUpload(true);
                          }}>
                            + Versi Baru
                          </button>
                        )}
                        <button onClick={() => handleEditMetadata(d)} className="badge badge-info" style={{ border: 'none', cursor: 'pointer', padding: '4px 8px', fontSize: 12 }}>✏️ Edit Metadata</button>
                        <button onClick={() => handleArchiveToggle(d.id, d.isArchived)} className={d.isArchived ? "badge badge-success" : "badge badge-warning"} style={{ border: 'none', cursor: 'pointer', padding: '4px 8px', fontSize: 12 }}>
                          {d.isArchived ? 'Batal Arsip' : '📦 Arsipkan'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="modal-overlay" onClick={e => {
          if (e.target === e.currentTarget) {
            setShowUpload(false);
            setIsEditingMetadata(false);
          }
        }}>
          <div className="modal">
            <div className="modal-title">{isEditingMetadata ? '✏️ Edit Metadata Dokumen' : (uploadData.parentId ? 'Upload Versi Baru' : 'Upload Dokumen Baru')}</div>
            <form onSubmit={handleUpload}>
              <div className="form-group">
                <label className="form-label">Judul Dokumen</label>
                <input required type="text" className="input" value={uploadData.title} onChange={e => setUploadData({...uploadData, title: e.target.value})} disabled={!!uploadData.parentId} />
              </div>
              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select className="input" value={uploadData.category} onChange={e => setUploadData({...uploadData, category: e.target.value})} disabled={!!uploadData.parentId}>
                  {(uploadData.parentId ? categories : getAllowedCategories()).map(c => <option key={c} value={c}>{categoryLabels[c]}</option>)}
                </select>
              </div>

              {!uploadData.parentId && !isEditingMetadata && (['INVOICE', 'KONTRAK'].includes(uploadData.category)) && (
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', marginBottom: '14px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12, fontWeight: 600 }}>ASOSIASI DOKUMEN (OPSIONAL)</p>
                  
                  <div className="form-group">
                    <label className="form-label">Terkait User (Konsumen/Staf)</label>
                    <select className="input" value={uploadData.relatedUserId} onChange={e => setUploadData({...uploadData, relatedUserId: e.target.value})}>
                      <option value="">-- Tidak Terkait --</option>
                      {projectUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Terkait Tukang (Borongan/Harian)</label>
                    <select className="input" value={uploadData.relatedTukangId} onChange={e => setUploadData({...uploadData, relatedTukangId: e.target.value})}>
                      <option value="">-- Tidak Terkait --</option>
                      {projectTukangs.map(t => <option key={t.id} value={t.id}>{t.name} ({t.type})</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Terkait Material</label>
                    <select className="input" value={uploadData.materialReqId} onChange={e => setUploadData({...uploadData, materialReqId: e.target.value})}>
                      <option value="">-- Tidak Terkait --</option>
                      {materialReqs.map(m => <option key={m.id} value={m.id}>Req #{m.id.substring(0,6)} ({m.status})</option>)}
                    </select>
                  </div>
                </div>
              )}

              {!isEditingMetadata && (
                <div className="form-group">
                  <label className="form-label">File Dokumen (PDF, DWG, DOCX)</label>
                  <input type="file" ref={fileInputRef} onChange={e => setFile(e.target.files?.[0] || null)} className="input" style={{ padding: '8px' }} required />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Catatan Tambahan (Opsional)</label>
                <textarea className="input" value={uploadData.notes} onChange={e => setUploadData({...uploadData, notes: e.target.value})} style={{ minHeight: 60 }} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => {
                  setShowUpload(false);
                  setIsEditingMetadata(false);
                }}>Batal</button>
                <button type="submit" className="btn-primary" disabled={submitting || (!file && !isEditingMetadata)}>
                  {submitting ? '⏳ Menyimpan...' : (isEditingMetadata ? '💾 Simpan Perubahan' : '📤 Upload')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryId && (
        <div className="modal-overlay" onClick={() => setShowHistoryId('')}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">🕒 Riwayat Versi Dokumen</div>
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {historyDocs.map(h => (
                <div key={h.id} style={{ padding: 12, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span className="badge badge-warning">Versi {h.version}</span>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{new Date(h.createdAt).toLocaleString('id-ID')}</span>
                  </div>
                  <div style={{ fontSize: 13, marginBottom: 8 }}>Diunggah oleh: <strong>{h.uploader?.name}</strong></div>
                  {h.notes && <div style={{ fontSize: 12, color: '#e2e8f0', background: 'rgba(255,255,255,0.05)', padding: 8, borderRadius: 4, marginBottom: 8 }}>{h.notes}</div>}
                  <a href={getImageUrl(h.fileUrl)} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '4px 8px', fontSize: 11, textDecoration: 'none', display: 'inline-block' }}>⬇️ Unduh File v{h.version}</a>
                </div>
              ))}
              {historyDocs.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>Belum ada riwayat versi sebelumnya.</div>}
            </div>
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button onClick={() => setShowHistoryId('')} className="btn-secondary">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {showCommentsId && (
        <div className="modal-overlay" onClick={() => setShowCommentsId('')}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">💬 Komentar Dokumen</div>
            <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {comments.map(c => (
                <div key={c.id} style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#38bdf8' }}>{c.user?.name} <span style={{ color: '#64748b', fontSize: 11, fontWeight: 'normal' }}>({c.user?.role})</span></div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{new Date(c.createdAt).toLocaleString('id-ID')}</div>
                  </div>
                  <div style={{ fontSize: 13, color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>{c.content}</div>
                </div>
              ))}
              {comments.length === 0 && <div style={{ textAlign: 'center', color: '#64748b', fontSize: 13, padding: 20 }}>Belum ada komentar. Jadilah yang pertama!</div>}
            </div>
            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: 8 }}>
              <input required type="text" className="input" placeholder="Tulis komentar..." value={newComment} onChange={e => setNewComment(e.target.value)} style={{ flex: 1 }} />
              <button type="submit" className="btn-primary" style={{ padding: '0 16px' }}>Kirim</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
