import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Navbar } from '@/components/navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'RivalScan — Competitive Intelligence',
  description:
    'RivalScan researches any company and generates structured competitive intelligence reports with SWOT analysis, competitor comparisons, and market insights.',
  keywords: ['competitive analysis', 'SWOT analysis', 'competitor research', 'market intelligence', 'market research'],
  openGraph: {
    title: 'RivalScan — Competitive Intelligence',
    description: 'Research any company and generate structured competitive intelligence reports instantly.',
    type: 'website',
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <Navbar />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
