'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getUser, clearAuth, User } from '@/lib/auth';
import Link from 'next/link';

const roleMenus: Record<string, { href: string; label: string; icon: string }[]> = {
  MANAGER: [
    { href: '/dashboard/manager', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/manager/projects', label: 'Proyek', icon: '🏗️' },
    { href: '/dashboard/manager/reports', label: 'Laporan Harian', icon: '📋' },
    { href: '/dashboard/manager/attendance', label: 'Rekap Absensi', icon: '📅' },
    { href: '/dashboard/manager/approvals', label: 'Approval Foto', icon: '🖼️' },
    { href: '/dashboard/manager/materials', label: 'Material', icon: '📦' },
    { href: '/dashboard/documents', label: 'Dokumen Proyek', icon: '📁' },
    { href: '/dashboard/notes', label: 'Catatan Proyek', icon: '📝' },
  ],
  SUPER_ADMIN: [
    { href: '/dashboard/admin', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/admin/users', label: 'Kelola User', icon: '👥' },
    { href: '/dashboard/admin/projects', label: 'Proyek', icon: '🏗️' },
    { href: '/dashboard/admin/tukang', label: 'Data Tukang', icon: '👷' },
    { href: '/dashboard/admin/attendance', label: 'Rekap Absensi', icon: '📅' },
    { href: '/dashboard/documents', label: 'Dokumen Proyek', icon: '📁' },
    { href: '/dashboard/notes', label: 'Catatan Proyek', icon: '📝' },
  ],
  ADMIN_PROYEK: [
    { href: '/dashboard/admin', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/admin/users', label: 'Kelola User', icon: '👥' },
    { href: '/dashboard/admin/projects', label: 'Proyek', icon: '🏗️' },
    { href: '/dashboard/admin/tukang', label: 'Data Tukang', icon: '👷' },
    { href: '/dashboard/admin/attendance', label: 'Rekap Absensi', icon: '📅' },
    { href: '/dashboard/documents', label: 'Dokumen Proyek', icon: '📁' },
    { href: '/dashboard/notes', label: 'Catatan Proyek', icon: '📝' },
  ],
  PENGAWAS: [
    { href: '/dashboard/pengawas', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/pengawas/daily-report', label: 'Laporan Harian', icon: '📋' },
    { href: '/dashboard/pengawas/overtime', label: 'Approval Lembur', icon: '⏰' },
    { href: '/dashboard/pengawas/materials', label: 'Material', icon: '📦' },
  ],
  MANDOR: [
    { href: '/dashboard/mandor', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/mandor/attendance', label: 'Absensi Tukang', icon: '📸' },
    { href: '/dashboard/mandor/materials', label: 'Ajukan Material', icon: '📦' },
  ],
  KONSUMEN: [
    { href: '/dashboard/konsumen', label: 'Proyek Saya', icon: '🏠' },
    { href: '/dashboard/konsumen/gallery', label: 'Galeri Progres', icon: '🖼️' },
  ],
  ARSITEK: [
    { href: '/dashboard/professional', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/documents', label: 'Dokumen Proyek', icon: '📁' },
    { href: '/dashboard/notes', label: 'Catatan Proyek', icon: '📝' },
  ],
  ESTIMATOR: [
    { href: '/dashboard/professional', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/documents', label: 'Dokumen Proyek', icon: '📁' },
    { href: '/dashboard/notes', label: 'Catatan Proyek', icon: '📝' },
  ],
  DRAFTER: [
    { href: '/dashboard/professional', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/documents', label: 'Dokumen Proyek', icon: '📁' },
    { href: '/dashboard/notes', label: 'Catatan Proyek', icon: '📝' },
  ],
};

const roleBadge: Record<string, string> = {
  MANAGER: 'Manager Operasional',
  SUPER_ADMIN: 'Super Admin',
  ADMIN_PROYEK: 'Admin Proyek',
  PENGAWAS: 'Pengawas Lapangan',
  MANDOR: 'Mandor',
  KONSUMEN: 'Pemilik / Konsumen',
  ARSITEK: 'Arsitek',
  ESTIMATOR: 'Estimator',
  DRAFTER: 'Drafter',
};

const roleColors: Record<string, string> = {
  MANAGER: '#f59e0b',
  SUPER_ADMIN: '#ef4444',
  ADMIN_PROYEK: '#8b5cf6',
  PENGAWAS: '#3b82f6',
  MANDOR: '#10b981',
  KONSUMEN: '#06b6d4',
  ARSITEK: '#ec4899',
  ESTIMATOR: '#14b8a6',
  DRAFTER: '#f97316',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push('/login'); return; }
    setUser(u);
  }, [router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (!user) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 40, height: 40, border: '3px solid rgba(245,158,11,0.2)', borderTop: '3px solid #f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#64748b', fontSize: 14 }}>Memuat...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const menus = roleMenus[user.role] || [];
  const userColor = roleColors[user.role] || '#f59e0b';

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  return (
    <div style={{ display: 'flex' }}>
      {/* Overlay for mobile */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-title">
            <span>🏗️</span>
            <span>MasterBangun</span>
          </div>
          <div className="sidebar-logo-sub">Platform Manajemen Konstruksi</div>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', paddingTop: 8 }}>
          <div className="nav-section-label">Menu</div>
          {menus.map((m) => {
            const isActive = pathname === m.href;
            return (
              <Link
                key={m.href}
                href={m.href}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-item-icon">{m.icon}</span>
                <span>{m.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-user-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9,
                background: `${userColor}20`,
                border: `1px solid ${userColor}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, flexShrink: 0
              }}>
                {user.role === 'MANAGER' ? '👔' :
                 user.role === 'PENGAWAS' ? '👁️' :
                 user.role === 'MANDOR' ? '👷' :
                 user.role === 'KONSUMEN' ? '🏠' :
                 ['ARSITEK','ESTIMATOR','DRAFTER'].includes(user.role) ? '📐' : '🔑'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div className="sidebar-user-name">{user.name}</div>
                <div className="sidebar-user-email">{user.email}</div>
              </div>
            </div>
            <div style={{ marginTop: 8 }}>
              <span className="badge" style={{
                background: `${userColor}15`, color: userColor,
                border: `1px solid ${userColor}30`, fontSize: 10
              }}>
                {roleBadge[user.role]}
              </span>
            </div>
          </div>
          <button onClick={handleLogout} className="nav-item" style={{ color: '#ef4444', borderRadius: 8 }}>
            <span className="nav-item-icon">🚪</span>
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="main-content" style={{ flex: 1, minWidth: 0 }}>
        {/* Mobile topbar burger */}
        <div style={{
          display: 'none',
          position: 'sticky', top: 0, zIndex: 30,
          background: 'rgba(10,13,20,0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          padding: '10px 16px',
          alignItems: 'center',
          gap: 12,
        }} id="mobile-topbar">
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <span style={{ fontWeight: 700, fontSize: 16, color: '#f59e0b' }}>🏗️ MasterBangun</span>
        </div>
        <style>{`
          @media (max-width: 768px) {
            #mobile-topbar { display: flex !important; }
          }
        `}</style>
        {children}
      </div>
    </div>
  );
}
