import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from './components/ThemeProvider';

export const metadata: Metadata = {
  title: 'HabitBloom – Daily Discipline & Micro-Progress Tracker',
  description:
    'Turn long-term goals into daily habits. HabitBloom helps founders and high-performers track micro-progress and maintain daily discipline.',
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
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
