import type { Metadata } from 'next';
import { DashboardEmbed } from '@/components/embed/DashboardEmbed';

export const metadata: Metadata = {
  title: 'Aerion — Dashboard Calculator',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <DashboardEmbed />;
}
