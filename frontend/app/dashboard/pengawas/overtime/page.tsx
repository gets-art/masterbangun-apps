'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function PengawasOvertime() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    api.get('/attendance/overtime/pending').then(res => {
      setAttendance(res.data);
    }).catch(() => {
      // Fallback: get all attendance with overtime
      api.get('/attendance').then(res => {
        setAttendance(res.data.filter((a: any) => a.overtimeHours > 0 && a.overtimeStatus === 'PENDING'));
      });
    }).finally(() => setLoading(false));
  };

  useEffect(() => loadData(), []);

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/attendance/overtime/${id}/approve`);
      loadData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Gagal menyetujui lembur');
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Tolak pengajuan lembur ini?')) return;
    try {
      await api.patch(`/attendance/overtime/${id}/reject`);
      loadData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Gagal menolak lembur');
    }
  };

  if (loading) return (
    <div>
      <div className="topbar"><div className="topbar-title">⏰ Approval Lembur</div></div>
      <div className="page-content">
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 52, marginBottom: 8 }} />)}
      </div>
    </div>
  );

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar-title">⏰ Approval Lembur Tukang</div>
          <div className="topbar-sub">Review dan setujui pengajuan lembur dari mandor</div>
        </div>
        {attendance.length > 0 && (
          <span className="badge badge-warning">{attendance.length} menunggu approval</span>
        )}
      </div>

      <div className="page-content">
        {attendance.length === 0 ? (
          <div className="table-wrapper">
            <div className="empty-state">
              <div className="empty-state-icon">⏰</div>
              <div className="empty-state-title">Tidak ada pengajuan lembur</div>
              <div className="empty-state-desc">Semua pengajuan lembur sudah diselesaikan</div>
            </div>
          </div>
        ) : (
          <div className="table-wrapper">
            <div className="table-header">
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>Pengajuan Lembur Pending</h3>
              <span className="badge badge-warning">{attendance.length} pengajuan</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Tukang</th>
                  <th>Proyek</th>
                  <th>Jam Masuk</th>
                  <th>Jam Keluar</th>
                  <th>Lembur</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map(a => (
                  <tr key={a.id}>
                    <td>{a.attendanceDate || (a.clockIn ? new Date(a.clockIn).toLocaleDateString('id-ID') : '-')}</td>
                    <td style={{ fontWeight: 600 }}>{a.tukang?.name || '-'}</td>
                    <td className="td-muted">{a.project?.name || '-'}</td>
                    <td>{a.clockIn ? new Date(a.clockIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                    <td>{a.clockOut ? new Date(a.clockOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : <span className="badge badge-info">Belum</span>}</td>
                    <td><span className="badge badge-warning">+{a.overtimeHours} jam</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => handleApprove(a.id)}
                          className="badge badge-success"
                          style={{ cursor: 'pointer', border: 'none', padding: '5px 12px' }}
                        >
                          ✓ Setujui
                        </button>
                        <button
                          onClick={() => handleReject(a.id)}
                          className="badge badge-danger"
                          style={{ cursor: 'pointer', border: 'none', padding: '5px 12px' }}
                        >
                          ✕ Tolak
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
