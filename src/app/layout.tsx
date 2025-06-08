import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Navbar from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'LexIA - Asistente Jurídico',
  description: 'Asistente jurídico inteligente especializado en Derecho español y europeo.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,200..900;1,7..72,200..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <Navbar />
          <main className="pt-16"> {/* Add padding top to avoid overlap with fixed Navbar */}
            {children}
          </main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
