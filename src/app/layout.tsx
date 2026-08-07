import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from './components/ThemeProvider';
import { FeatureFlagProvider } from '../../lib/FeatureFlagContext';
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <ThemeProvider>
          <FeatureFlagProvider>
            {children}
          </FeatureFlagProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
