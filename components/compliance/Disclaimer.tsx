export function Disclaimer({ children }: { children?: React.ReactNode }) {
  return (
    <div className="meta" style={{ border: '1px solid var(--rule)', padding: 'calc(var(--space) * 2)' }}>
      {children ?? (
        <>
          These figures are illustrative scenarios, not a forecast or a promise of returns. Mining
          economics depend on energy cost, hashprice, difficulty, and uptime, all of which vary.
          Payback periods shown are estimates, not guarantees.
        </>
      )}
    </div>
  );
}
