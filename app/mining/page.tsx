import { DEFAULT_MINING_PARAMETERS } from '@/packages/calc-engine';
import { MiningModule } from '@/components/mining/MiningModule';
import { MicaStatement } from '@/components/compliance/MicaStatement';

export default function MiningPage() {
  return (
    <main className="page">
      <MiningModule parameters={DEFAULT_MINING_PARAMETERS} />
      <hr className="rule" />
      <MicaStatement />
    </main>
  );
}
