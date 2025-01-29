// Required imports for Next.js application
import type { Metadata } from 'next';
import './globals.css';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Toaster } from '@/components/ui/sonner';
import Head from 'next/head';

// Application metadata configuration for SEO and social sharing
export const metadata: Metadata = {
  // Main title and description
  title: {
    default: 'Measurely - Track your metrics effectively',
    template: '%s | Measurely',
  },
  description:
    'Measurely is an intuitive dashboard that helps developers and teams track metrics efficiently, connect APIs, and analyze data with ease.',

  // OpenGraph metadata for social sharing
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://measurely.dev',
    siteName: 'Measurely',
    title: 'Measurely - Track your metrics effectively',
    description:
      'Track and analyze your metrics seamlessly with Measurely. Perfect for developers and data-driven teams.',
    images: [
      {
        url: 'https://media.measurely.dev/opengraph.png',
        width: 1200,
        height: 630,
        alt: 'Measurely Dashboard Preview',
      },
    ],
  },

  // Twitter card metadata
  twitter: {
    card: 'summary_large_image',
    site: '@getmeasurely',
    title: 'Measurely - Track your metrics effectively',
    description:
      'Discover how Measurely helps developers track and analyze metrics seamlessly. Boost your data-driven decisions today!',
    images: ['https://media.measurely.dev/opengraph.png'],
  },

  // Base URL for metadata
  metadataBase: new URL('https://measurely.dev'),

  // Favicon and icon configurations
  icons: [
    {
      rel: 'icon',
      type: 'image/png',
      url: '/favicon-96x96.png',
      sizes: '96x96',
    },
    {
      rel: 'icon',
      type: 'image/svg+xml',
      url: '/favicon.svg',
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      url: '/apple-touch-icon.png',
    },
  ],

  // Project authors
  authors: [
    { name: 'zxk-afz', url: 'https://github.com/zxk-afz' },
    { name: 'yasthegoat', url: 'https://github.com/yasthegoat' },
  ],

  // SEO keywords
  keywords:
    'metrics, dashboard, analytics, Measurely, api tracking, developer tools, customizable dashboard, analytics SaaS, intuitive api',
  robots: 'index, follow',
};

// Root layout component that wraps all pages
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <Head>
        <link rel='preconnect' href='https://fonts.gstatic.com' />
        <title>Measurely</title>
      </Head>
      <body className={GeistSans.className + ' ' + GeistMono.variable}>
        {children}
        <Toaster richColors theme='light' position='bottom-right' closeButton />
      </body>
    </html>
  );
}
