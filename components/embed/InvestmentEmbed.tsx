'use client';

import { useState } from 'react';
import { DEFAULT_INVESTMENT, type InvestmentState } from '@/lib/studio';
import { InvestmentPanel } from '@/components/studio/InvestmentPanel';
import { EmbedShell } from './EmbedShell';

export function InvestmentEmbed() {
  const [investment, setInvestment] = useState<InvestmentState>(DEFAULT_INVESTMENT);
  return (
    <EmbedShell id="investment" skin="landing">
      <InvestmentPanel value={investment} onChange={(patch) => setInvestment((prev) => ({ ...prev, ...patch }))} />
    </EmbedShell>
  );
}
