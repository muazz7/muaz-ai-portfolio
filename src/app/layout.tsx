import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';

import { PROFILE } from '@/lib/data/profile';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const description = `Don't read a portfolio - ask it. ${PROFILE.fullName} is a ${PROFILE.title} from ${PROFILE.location}. Ask about his projects, stack, or availability and get an answer in his own voice.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${PROFILE.name} · AI Portfolio`,
    template: `%s · ${PROFILE.name}`,
  },
  description,
  applicationName: `${PROFILE.name} AI Portfolio`,
  authors: [{ name: PROFILE.fullName, url: PROFILE.socials.github }],
  keywords: [
    PROFILE.fullName,
    'Muaz',
    'muazz7',
    'Software Engineer',
    'Bangladesh',
    'Daffodil International University',
    'React',
    'Next.js',
    'Flutter',
    'AI portfolio',
  ],
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: `${PROFILE.fullName} · AI Portfolio`,
    description,
    siteName: `${PROFILE.name} · AI Portfolio`,
    images: [{ url: '/muaz.jpg', width: 864, height: 864, alt: PROFILE.fullName }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${PROFILE.fullName} · AI Portfolio`,
    description,
    images: ['/muaz.jpg'],
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/muaz.jpg' }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0b' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} bg-background min-h-screen font-sans antialiased`}>
        <main className="flex min-h-screen flex-col">{children}</main>
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
