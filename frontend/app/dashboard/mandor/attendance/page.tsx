'use client';
import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';

export default function MandorAttendance() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [tukangs, setTukangs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ projectId: '', tukangId: '', type: 'in' });
  const [photo, setPhoto] = useState<File | null>(null);
  const [gps, setGps] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = () => {
    Promise.all([api.get('/attendance'), api.get('/projects')])
      .then(([a, p]) => {
        setAttendance(a.data);
        setProjects(p.data);
        if (p.data.length > 0) {
          const pid = p.data[0].id;
          setFormData(f => ({ ...f, projectId: pid }));
          fetchTukangs(pid);
        }
      }).finally(() => setLoading(false));
  };

  const fetchTukangs = async (projectId: string) => {
    try {
      const res = await api.get(`/projects/${projectId}/tukang`);
      setTukangs(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => loadData(), []);

  const handleProjectChange = (pid: string) => {
    setFormData({ ...formData, projectId: pid, tukangId: '' });
    fetchTukangs(pid);
  };

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPhoto(e.target.files[0]);
    }
  };

  const getLocation = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) return resolve('GPS tidak didukung');
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(`${pos.coords.latitude},${pos.coords.longitude}`),
        (err) => resolve('Lokasi ditolak')
      );
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo) return alert('Wajib ambil foto!');
    setSubmitting(true);
    try {
      const loc = await getLocation();
      setGps(loc);

      // Upload photo
      const form = new FormData();
      form.append('file', photo);
      const uploadRes = await api.post('/upload/photo', form);
      const photoUrl = uploadRes.data.url;

      // Submit attendance
      const endpoint = formData.type === 'in' ? '/attendance/clock-in' : '/attendance/clock-out';
      await api.post(endpoint, {
        projectId: formData.projectId,
        tukangId: formData.tukangId,
        photoUrl,
        gps: loc
      });

      setShowModal(false);
      setPhoto(null);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal absen');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: 32, color: '#64748b' }}>Memuat data...</div>;

  return (
    <div>
      <div className="topbar">
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Absensi Tukang (Mandor)</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ Absen Kamera</button>
      </div>
      <div className="page-content">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Tanggal</th><th>Tukang</th><th>Jam Masuk</th><th>Jam Keluar</th><th>Lembur</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map(a => (
                <tr key={a.id}>
                  <td>{new Date(a.attendanceDate).toLocaleDateString('id-ID')}</td>
                  <td style={{ fontWeight: 500 }}>{a.tukang?.name}</td>
                  <td>{a.clockIn ? new Date(a.clockIn).toLocaleTimeString('id-ID') : '-'}</td>
                  <td>{a.clockOut ? new Date(a.clockOut).toLocaleTimeString('id-ID') : '-'}</td>
                  <td><span className={a.overtimeHours > 0 ? "badge badge-warning" : "badge badge-info"}>{a.overtimeHours} Jam</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {attendance.length === 0 && <p style={{ padding: 20, color: '#64748b', margin: 0 }}>Belum ada data absensi</p>}
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#1a1d27', padding: 24, borderRadius: 12, width: 400, maxWidth: '90%' }}>
            <h3 style={{ margin: '0 0 16px' }}>Absen Kamera GPS</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Pilih Proyek</label>
                <select required className="input" value={formData.projectId} onChange={e => handleProjectChange(e.target.value)}>
                  <option value="" disabled>Pilih Proyek</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Pilih Tukang</label>
                <select required className="input" value={formData.tukangId} onChange={e => setFormData({...formData, tukangId: e.target.value})}>
                  <option value="" disabled>Pilih Tukang</option>
                  {tukangs.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Tipe Absen</label>
                <select className="input" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="in">Absen Masuk</option>
                  <option value="out">Absen Keluar</option>
                </select>
              </div>
              
              <div style={{ marginTop: 8 }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  ref={fileInputRef} 
                  onChange={handleCapture} 
                  style={{ display: 'none' }} 
                />
                {!photo ? (
                  <div onClick={() => fileInputRef.current?.click()} style={{ border: '2px dashed #f59e0b', padding: 24, borderRadius: 8, textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: 32 }}>📷</div>
                    <div style={{ color: '#f59e0b', fontWeight: 500, marginTop: 8 }}>Ambil Foto</div>
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <img src={URL.createObjectURL(photo)} alt="Preview" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8 }} />
                    <button type="button" onClick={() => fileInputRef.current?.click()} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' }}>Ulangi</button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', background: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer' }}>Batal</button>
                <button type="submit" disabled={submitting} className="btn-primary" style={{ padding: '8px 16px' }}>{submitting ? 'Menyimpan...' : 'Kirim Absen'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
