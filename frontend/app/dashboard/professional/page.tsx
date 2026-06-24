'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { getUser } from '@/lib/auth';
import Link from 'next/link';

export default function ProfessionalDashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    api.get('/projects').then(res => setProjects(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar-title">Selamat datang, {user?.name || 'Profesional'}</div>
          <div className="topbar-sub">Memuat data proyek...</div>
        </div>
      </div>
      <div className="page-content">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 12 }} />)}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar-title">📐 Selamat datang, {user?.name}</div>
          <div className="topbar-sub">
            Anda login sebagai {user?.role === 'ARSITEK' ? 'Arsitek' : user?.role === 'ESTIMATOR' ? 'Estimator' : 'Drafter'}. 
            Di sini Anda dapat mengelola dokumen gambar kerja, RAB, dan catatan teknis proyek.
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card" style={{ '--stat-color': '#8b5cf6' } as React.CSSProperties}>
            <div className="stat-icon" style={{ background: '#8b5cf615' }}>🏗️</div>
            <div className="stat-value" style={{ color: '#8b5cf6' }}>{projects.length}</div>
            <div className="stat-label">Proyek Ditangani</div>
          </div>
          <Link href="/dashboard/documents" className="stat-card" style={{ '--stat-color': '#ec4899', textDecoration: 'none', cursor: 'pointer' } as React.CSSProperties}>
            <div className="stat-icon" style={{ background: '#ec489915' }}>📁</div>
            <div className="stat-value" style={{ color: '#ec4899', fontSize: 18, marginTop: 4 }}>Buka</div>
            <div className="stat-label">Kelola Dokumen Proyek</div>
          </Link>
          <Link href="/dashboard/notes" className="stat-card" style={{ '--stat-color': '#14b8a6', textDecoration: 'none', cursor: 'pointer' } as React.CSSProperties}>
            <div className="stat-icon" style={{ background: '#14b8a615' }}>📝</div>
            <div className="stat-value" style={{ color: '#14b8a6', fontSize: 18, marginTop: 4 }}>Buka</div>
            <div className="stat-label">Catatan & Pengingat</div>
          </Link>
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Daftar Proyek Anda</h3>
        {projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏗️</div>
            <div className="empty-state-title">Belum ada proyek</div>
            <div className="empty-state-desc">Anda belum di-assign ke proyek manapun.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {projects.map(p => (
              <div key={p.id} style={{ background: '#1e293b', padding: 20, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ fontSize: 18, fontWeight: 600, color: '#f8fafc', marginBottom: 8 }}>{p.name}</h4>
                <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>📍 {p.location || 'Lokasi tidak diset'}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link href={`/dashboard/documents`} className="btn-primary" style={{ flex: 1, textAlign: 'center', textDecoration: 'none', padding: '8px 0', fontSize: 13 }}>
                    📁 Dokumen
                  </Link>
                  <Link href={`/dashboard/notes`} className="btn-secondary" style={{ flex: 1, textAlign: 'center', textDecoration: 'none', padding: '8px 0', fontSize: 13 }}>
                    📝 Catatan
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
