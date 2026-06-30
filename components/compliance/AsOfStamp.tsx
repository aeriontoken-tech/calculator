export function AsOfStamp({ asOf, source }: { asOf: string; source: string }) {
  return (
    <p className="meta">
      Market data as of {asOf} · {source}
    </p>
  );
}
