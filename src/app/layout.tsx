import type { Metadata } from 'next';
import './globals.css';
import { ClientProvider } from '@/context/ClientProvider';

export const metadata: Metadata = {
  title: 'WordWings',
  description: 'Learn vocabulary through AI-generated stories.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <ClientProvider>
          {children}
        </ClientProvider>
      </body>
    </html>
  );
}
