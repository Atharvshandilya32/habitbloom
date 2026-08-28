import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from './components/ThemeProvider';
import { FeatureFlagProvider } from '../../lib/FeatureFlagContext';
import FirebaseErrorGuard from './components/FirebaseErrorGuard';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'HabitBloom – Daily Discipline & Micro-Progress Tracker',
  description:
    'Turn long-term goals into daily habits. HabitBloom helps founders and high-performers track micro-progress and maintain daily discipline.',
  manifest: '/manifest.json',
  alternates: {
    canonical: 'https://habitbloom.in/',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/assets/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    images: [{ url: '/assets/logo.png', width: 1024, height: 1024, alt: 'HabitBloom' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <FirebaseErrorGuard />
        <ThemeProvider>
          <FeatureFlagProvider>
            {/* JSON-LD Schema.org Data for AI Bots and SEO */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "SoftwareApplication",
                  "name": "HabitBloom",
                  "operatingSystem": "Web",
                  "applicationCategory": "HealthAndFitnessApplication",
                  "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
                  },
                  "description": "Turn long-term goals into daily habits. HabitBloom helps you track micro-progress and maintain daily discipline.",
                  "url": "https://habitbloom.in",
                  "contactPoint": {
                    "@type": "ContactPoint",
                    "email": "support@habitbloom.in",
                    "contactType": "customer support"
                  }
                }).replace(/</g, '\\u003c')
              }}
            />
            {children}
          </FeatureFlagProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
