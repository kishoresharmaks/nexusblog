import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { QueryProvider } from '@/components/query-provider';
import { AuthProvider } from '@/context/auth-context';
import { GoogleTag } from '@/components/analytics/google-tag';
import { PageTracker } from '@/components/analytics/page-tracker';
import { GoogleAdSenseScript } from '@/components/ads/google-adsense-script';
import { WebSiteOrgJsonLd } from '@/components/seo/json-ld';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://nexusnation.in'),
  title: {
    default: 'NexusNation — System Design & Backend Engineering',
    template: '%s — NexusNation',
  },
  description:
    'Explore production-grade system design, backend engineering, distributed systems, and real-world software architecture guides with practical code and engineering insights.',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/brand/png/transparent-background/nexus-32px-transparent.png', sizes: '32x32', type: 'image/png' },
      { url: '/brand/png/transparent-background/nexus-192px-transparent.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico'],
    apple: [
      { url: '/brand/png/transparent-background/nexus-180px-transparent.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    url: 'https://nexusnation.in/',
    siteName: 'NexusNation',
    title: 'NexusNation — System Design & Backend Engineering',
    description:
      'Practical engineering guides, architecture blueprints, and deep dives into production software systems.',
    images: [
      {
        url: '/brand/original/nexus-master-original.png',
        width: 1254,
        height: 1254,
        alt: 'NexusNation — System Design & Backend Engineering',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NexusNation — System Design & Backend Engineering',
    description:
      'Explore production-grade system design, backend engineering, distributed systems, and real-world software architecture guides with practical code and engineering insights.',
    site: '@nexusnation',
    creator: '@nexusnation',
    images: ['/brand/original/nexus-master-original.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <GoogleTag />
        <WebSiteOrgJsonLd />
      </head>
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
              <GoogleAdSenseScript />
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
