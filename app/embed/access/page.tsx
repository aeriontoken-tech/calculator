import type { Metadata } from 'next';
import { AccessEmbed } from '@/components/embed/AccessEmbed';

export const metadata: Metadata = {
  title: 'Aerion — Access & Node',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AccessEmbed />;
}
