export default function ComingSoonPage({ params }: { params: { slug: string[] } }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '80vh', textAlign: 'center', color: '#94a3b8'
    }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>🚧</div>
      <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#f1f5f9', margin: '0 0 8px' }}>
        Fitur Dalam Pengembangan
      </h2>
      <p style={{ maxWidth: '400px', lineHeight: 1.6 }}>
        Halaman untuk modul <strong>{params.slug?.join('/') || 'ini'}</strong> saat ini sedang dalam tahap penyelesaian dan akan segera tersedia.
      </p>
      <div style={{ marginTop: '24px' }}>
        <a href="javascript:history.back()" style={{
          display: 'inline-block', padding: '10px 20px', background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9', textDecoration: 'none'
        }}>
          ← Kembali
        </a>
      </div>
    </div>
  );
}
