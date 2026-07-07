'use client';

import { useState } from 'react';
import { DEFAULT_ACCESS, type AccessState } from '@/lib/studio';
import { AccessPanel } from '@/components/studio/AccessPanel';
import { EmbedShell } from './EmbedShell';

export function AccessEmbed() {
  const [access, setAccess] = useState<AccessState>(DEFAULT_ACCESS);
  return (
    <EmbedShell id="access" console>
      <AccessPanel value={access} onChange={(patch) => setAccess((prev) => ({ ...prev, ...patch }))} />
    </EmbedShell>
  );
}
