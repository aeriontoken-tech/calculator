import type { Metadata } from 'next';
import { Cormorant_Garamond, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { RiskBanner } from '@/components/compliance/RiskBanner';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  style: ['italic'],
  weight: ['400', '500'],
  variable: '--font-cormorant',
});
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
});

export const metadata: Metadata = {
  title: 'Aerion — Scenario Calculator',
  description:
    'Explore illustrative scenarios for Aerion mining economics and ARN access. Not financial advice; not a guarantee of returns.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jetbrains.variable}`}>
      <body><RiskBanner />{children}</body>
    </html>
  );
}
