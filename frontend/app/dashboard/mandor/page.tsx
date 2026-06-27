'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { getUser } from '@/lib/auth';
import Link from 'next/link';

export default function MandorDashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    Promise.all([api.get('/projects'), api.get('/materials')])
      .then(([p, m]) => {
        setProjects(p.data);
        setMaterials(m.data);
        if (p.data.length > 0) {
          const pid = p.data[0].id;
          setSelectedProject(pid);
          fetchTodayAttendance(pid);
        }
      }).catch(err => console.error(err))
        .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedProject) fetchTodayAttendance(selectedProject);
  }, [selectedProject]);

  const fetchTodayAttendance = async (pid: string) => {
    try {
      const r = await api.get(`/attendance/today/${pid}`);
      setTodayAttendance(r.data);
    } catch {
      setTodayAttendance([]);
    }
  };

  const pendingMaterials = materials.filter(m => m.status === 'PENDING').length;
  const clockedIn = todayAttendance.filter(a => a.clockIn).length;
  const clockedOut = todayAttendance.filter(a => a.clockOut).length;

  if (loading) return <div style={{ padding: 32, color: '#64748b' }}>Memuat data...</div>;

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar-title">📊 Dashboard Mandor</div>
          <div className="topbar-sub">
            Halo, {user?.name} — {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
        {projects.length > 0 && (
          <select
            value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
            className="input"
            style={{ width: 'auto', padding: '8px 12px' }}
          >
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        )}
      </div>

      <div className="page-content">
        {/* Stats */}
        <div className="stats-grid">
          {[
            { label: 'Tukang Hadir Hari Ini', value: clockedIn, icon: '✅', color: '#10b981' },
            { label: 'Sudah Pulang', value: clockedOut, icon: '🏠', color: '#3b82f6' },
            { label: 'Material Pending', value: pendingMaterials, icon: '📦', color: '#f59e0b' },
            { label: 'Total Proyek', value: projects.length, icon: '🏗️', color: '#8b5cf6' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ '--stat-color': s.color } as React.CSSProperties}>
              <div className="stat-icon" style={{ background: `${s.color}15`, fontSize: 20 }}>{s.icon}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: '1fr 1fr', marginBottom: 24 }}>
          <Link href="/dashboard/mandor/attendance" className="card card-hover" style={{
            textDecoration: 'none', display: 'block',
            borderColor: 'rgba(245,158,11,0.25)',
            background: 'linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(13,17,27,0.98) 100%)',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📸</div>
            <h3 style={{ fontSize: 17, color: '#f59e0b', marginBottom: 6 }}>Absensi Tukang</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>Foto absensi masuk & keluar dengan GPS</p>
          </Link>
          <Link href="/dashboard/mandor/materials" className="card card-hover" style={{ textDecoration: 'none', display: 'block' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
            <h3 style={{ fontSize: 17, marginBottom: 6 }}>
              Ajukan Material
              {pendingMaterials > 0 && (
                <span className="badge badge-warning" style={{ marginLeft: 8, fontSize: 11 }}>{pendingMaterials} pending</span>
              )}
            </h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>Request kebutuhan material proyek</p>
          </Link>
        </div>

        {/* Today's attendance */}
        <div className="table-wrapper">
          <div className="table-header">
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>👷 Absensi Hari Ini</h3>
            <span className="badge badge-info">{todayAttendance.length} tukang</span>
          </div>
          {todayAttendance.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px' }}>
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-title">Belum ada absensi hari ini</div>
              <div className="empty-state-desc">
                <Link href="/dashboard/mandor/attendance" style={{ color: '#f59e0b' }}>Absen tukang sekarang →</Link>
              </div>
            </div>
          ) : (
            <table>
              <thead>
                <tr><th>Tukang</th><th>Jam Masuk</th><th>Jam Keluar</th><th>Lembur</th></tr>
              </thead>
              <tbody>
                {todayAttendance.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>{a.tukang?.name}</td>
                    <td>{a.clockIn ? new Date(a.clockIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : <span className="badge badge-warning">Belum</span>}</td>
                    <td>{a.clockOut ? new Date(a.clockOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : <span className="badge badge-info">Masih di lokasi</span>}</td>
                    <td>{a.overtimeHours > 0 ? <span className="badge badge-warning">{a.overtimeHours} jam</span> : <span className="td-muted">—</span>}</td>
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
