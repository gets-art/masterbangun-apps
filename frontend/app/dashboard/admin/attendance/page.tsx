'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function AdminAttendance() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    api.get('/attendance').then(res => setAttendance(res.data)).finally(() => setLoading(false));
  }, []);

  const filtered = filterDate
    ? attendance.filter(a => a.attendanceDate === filterDate)
    : attendance;

  const totalHadir = filtered.length;
  const totalLembur = filtered.filter(a => a.overtimeHours > 0).length;
  const totalJamLembur = filtered.reduce((sum, a) => sum + (a.overtimeHours || 0), 0);

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
          <div className="topbar-title">📅 Rekap Absensi</div>
          <div className="topbar-sub">Pantau seluruh absensi tukang di semua proyek</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="date"
            className="input"
            style={{ width: 'auto' }}
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
          />
          {filterDate && (
            <button className="btn-secondary" style={{ padding: '8px 12px', fontSize: 12 }} onClick={() => setFilterDate('')}>
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="page-content">
        {/* Mini stats */}
        <div className="stats-grid" style={{ marginBottom: 20 }}>
          {[
            { label: 'Total Hadir', value: totalHadir, icon: '✅', color: '#10b981' },
            { label: 'Yang Lembur', value: totalLembur, icon: '⏰', color: '#f59e0b' },
            { label: 'Total Jam Lembur', value: `${totalJamLembur}j`, icon: '⌛', color: '#3b82f6' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ '--stat-color': s.color } as React.CSSProperties}>
              <div className="stat-icon" style={{ background: `${s.color}15` }}>{s.icon}</div>
              <div className="stat-value" style={{ color: s.color, fontSize: 24 }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="table-wrapper">
          <div className="table-header">
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>
              {filterDate ? `Absensi ${new Date(filterDate + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}` : 'Semua Data Absensi'}
            </h3>
            <span className="badge badge-info">{filtered.length} record</span>
          </div>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <div className="empty-state-title">Belum ada data absensi</div>
              <div className="empty-state-desc">{filterDate ? 'Tidak ada absensi pada tanggal ini' : 'Belum ada absensi yang tercatat'}</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Tukang</th>
                  <th>Tipe</th>
                  <th>Proyek</th>
                  <th>Jam Masuk</th>
                  <th>Jam Keluar</th>
                  <th>Lembur</th>
                  <th>Status Lembur</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id}>
                    <td>{a.attendanceDate || '-'}</td>
                    <td style={{ fontWeight: 600 }}>{a.tukang?.name || '-'}</td>
                    <td>
                      <span className={`badge ${a.tukang?.type === 'BORONGAN' ? 'badge-primary' : 'badge-warning'}`}>
                        {a.tukang?.type || 'HARIAN'}
                      </span>
                    </td>
                    <td className="td-muted">{a.project?.name || '-'}</td>
                    <td>{a.clockIn ? new Date(a.clockIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                    <td>{a.clockOut ? new Date(a.clockOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : <span className="badge badge-info">Belum</span>}</td>
                    <td>
                      {a.overtimeHours > 0
                        ? <span className="badge badge-warning">+{a.overtimeHours} jam</span>
                        : <span className="td-muted">—</span>
                      }
                    </td>
                    <td>
                      {a.overtimeHours > 0 ? (
                        <span className={`badge ${
                          a.overtimeStatus === 'APPROVED' ? 'badge-success' :
                          a.overtimeStatus === 'REJECTED' ? 'badge-danger' : 'badge-warning'
                        }`}>{
                          a.overtimeStatus === 'APPROVED' ? '✓ Disetujui' :
                          a.overtimeStatus === 'REJECTED' ? '✕ Ditolak' : '⏳ Pending'
                        }</span>
                      ) : <span className="td-muted">—</span>}
                    </td>
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
