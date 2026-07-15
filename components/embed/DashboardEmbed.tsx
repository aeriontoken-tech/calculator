'use client';

import { useState } from 'react';
import {
  DEFAULT_ACCESS,
  DEFAULT_INVESTMENT,
  type AccessState,
  type InvestmentState,
} from '@/lib/studio';
import { InvestmentPanel } from '@/components/studio/InvestmentPanel';
import { AccessPanel } from '@/components/studio/AccessPanel';
import { EmbedShell } from './EmbedShell';

// Combined embed for the Aerion dashboard: both calculator sections stacked in
// one iframe, ARN Position first then Access & Mining Boost, sharing the
// Operator Console skin (dark/light, theme-synced) so they match the dashboard
// chrome. Order per design: investment on top, access below.
export function DashboardEmbed() {
  const [investment, setInvestment] = useState<InvestmentState>(DEFAULT_INVESTMENT);
  const [access, setAccess] = useState<AccessState>(DEFAULT_ACCESS);
  return (
    <EmbedShell id="dashboard" skin="console">
      <div style={{ display: 'grid', gap: 22 }}>
        <InvestmentPanel
          value={investment}
          onChange={(patch) => setInvestment((prev) => ({ ...prev, ...patch }))}
        />
        <AccessPanel
          value={access}
          onChange={(patch) => setAccess((prev) => ({ ...prev, ...patch }))}
        />
      </div>
    </EmbedShell>
  );
}
