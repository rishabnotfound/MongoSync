import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from "next/script";
import './globals.css';
import { app_description, app_name } from '@/config';
import { ProgressBar } from '@/components/ProgressBar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: app_name,
  description: app_description,
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: app_name,
  },
  icons: {
    icon: '/nobg.png',
    apple: '/nobg.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#10B981',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ProgressBar />
        {children}
      </body>
        <Script
          src="https://cdn.jsdelivr.net/npm/disable-devtool@latest"
          strategy="afterInteractive"
        />
        <Script src="/js/smoothscroll.js" strategy="afterInteractive" />
    </html>
  );
}



//MADE WITH ❤️ BY RISHAB