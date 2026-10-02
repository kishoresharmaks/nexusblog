import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { QueryProvider } from '@/components/query-provider';
import { AuthProvider } from '@/context/auth-context';
import { PageTracker } from '@/components/analytics/page-tracker';
import { Toaster } from 'sonner';
import { siteConfig } from '@nexus/config';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/brand/png/transparent-background/nexus-32px-transparent.png', sizes: '32x32', type: 'image/png' },
      { url: '/brand/png/transparent-background/nexus-192px-transparent.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/brand/png/transparent-background/nexus-180px-transparent.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [
      {
        url: '/brand/original/nexus-master-original.png',
        width: 1254,
        height: 1254,
        alt: siteConfig.name,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              <Suspense fallback={null}>
                <PageTracker />
              </Suspense>
              {children}
              <Toaster position="bottom-right" richColors />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
