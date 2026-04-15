import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'CELPIP Prep AI — Ace Your CELPIP Test',
  description: 'AI-powered CELPIP preparation platform. Practice all 4 skills with real-time AI feedback and achieve CLB 9+.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#fff', color: '#111', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px' },
            success: { iconTheme: { primary: '#6473f1', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  );
}
