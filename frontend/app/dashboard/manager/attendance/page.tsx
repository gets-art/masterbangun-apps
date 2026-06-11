'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function ManagerAttendance() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([api.get('/attendance'), api.get('/projects')])
      .then(([a, p]) => { setAttendance(a.data); setProjects(p.data); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = attendance.filter(a => {
    const matchDate = !filterDate || a.attendanceDate === filterDate;
    const matchProject = !filterProject || a.projectId === filterProject;
    return matchDate && matchProject;
  });

  const totalLembur = filtered.reduce((sum, a) => sum + (a.overtimeHours || 0), 0);

  if (loading) return (
    <div>
      <div className="topbar"><div className="topbar-title">Rekap Absensi</div></div>
      <div className="page-content">
        {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 52, marginBottom: 8 }} />)}
      </div>
    </div>
  );

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar-title">📅 Rekap Absensi Tukang</div>
          <div className="topbar-sub">Pantau kehadiran tukang di semua proyek</div>
        </div>
      </div>

      <div className="page-content">
        {/* Filters */}
        <div className="card" style={{ padding: '14px 20px', marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Filter:</span>
          <input
            type="date"
            className="input"
            style={{ width: 'auto' }}
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
          />
          <select
            className="input"
            style={{ width: 'auto' }}
            value={filterProject}
            onChange={e => setFilterProject(e.target.value)}
          >
            <option value="">Semua Proyek</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {(filterDate || filterProject) && (
            <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => { setFilterDate(''); setFilterProject(''); }}>
              Reset Filter
            </button>
          )}
          <span className="badge badge-info" style={{ marginLeft: 'auto' }}>{filtered.length} record</span>
        </div>

        {/* Mini stats */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <span className="badge badge-success" style={{ fontSize: 13, padding: '8px 14px' }}>✅ {filtered.length} Hadir</span>
          <span className="badge badge-warning" style={{ fontSize: 13, padding: '8px 14px' }}>⏰ {filtered.filter(a => a.overtimeHours > 0).length} Lembur</span>
          <span className="badge badge-info" style={{ fontSize: 13, padding: '8px 14px' }}>⌛ {totalLembur} Jam Lembur Total</span>
        </div>

        <div className="table-wrapper">
          <div className="table-header">
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Data Absensi</h3>
          </div>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <div className="empty-state-title">Tidak ada data absensi</div>
              <div className="empty-state-desc">Coba ubah filter tanggal atau proyek</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Tukang</th>
                  <th>Proyek</th>
                  <th>Jam Masuk</th>
                  <th>Jam Keluar</th>
                  <th>Lembur</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id}>
                    <td>{a.attendanceDate || '-'}</td>
                    <td style={{ fontWeight: 600 }}>{a.tukang?.name || '-'}</td>
                    <td className="td-muted">{a.project?.name || '-'}</td>
                    <td>{a.clockIn ? new Date(a.clockIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                    <td>{a.clockOut ? new Date(a.clockOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : <span className="badge badge-warning">Masih di lokasi</span>}</td>
                    <td>{a.overtimeHours > 0 ? <span className="badge badge-warning">+{a.overtimeHours} jam</span> : <span className="td-muted">—</span>}</td>
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
