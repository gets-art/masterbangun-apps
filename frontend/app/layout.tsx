import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MasterBangun — Manajemen Proyek Konstruksi',
  description: 'Platform manajemen proyek konstruksi terintegrasi untuk tim lapangan dan konsumen.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
