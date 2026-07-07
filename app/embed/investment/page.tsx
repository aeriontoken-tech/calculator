import type { Metadata } from 'next';
import { InvestmentEmbed } from '@/components/embed/InvestmentEmbed';

export const metadata: Metadata = {
  title: 'Aerion — ARN Investment',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <InvestmentEmbed />;
}
