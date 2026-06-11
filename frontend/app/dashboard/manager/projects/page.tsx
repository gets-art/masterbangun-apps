'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function ManagerProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/projects').then(res => setProjects(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 32, color: '#64748b' }}>Memuat data...</div>;

  return (
    <div>
      <div className="topbar">
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Daftar Proyek (Manager)</h2>
      </div>
      <div className="page-content">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nama Proyek</th><th>Lokasi</th><th>Progress</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td style={{ color: '#94a3b8' }}>{p.address}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="progress-bar" style={{ width: '80px', margin: 0 }}>
                        <div className="progress-fill" style={{ width: `${p.progressPercentage}%` }} />
                      </div>
                      <span style={{ fontSize: '12px' }}>{p.progressPercentage}%</span>
                    </div>
                  </td>
                  <td><span className={`badge ${p.status === 'ACTIVE' ? 'badge-success' : 'badge-info'}`}>{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {projects.length === 0 && <p style={{ padding: 20, color: '#64748b', margin: 0 }}>Belum ada proyek.</p>}
        </div>
      </div>
    </div>
  );
}
