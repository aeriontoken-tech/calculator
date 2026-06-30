const eur0 = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const eur2 = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const int0 = new Intl.NumberFormat('en-IE', { maximumFractionDigits: 0 });

export function formatEur(value: number): string {
  return eur0.format(value);
}
export function formatEur2(value: number): string {
  return eur2.format(value);
}
export function formatArn(value: number): string {
  return `${int0.format(value)} ARN`;
}
export function formatYears(value: number | null): string {
  return value === null ? '—' : `${value.toFixed(2)} yr`;
}
export function formatPct(fraction: number): string {
  return `${Math.round(fraction * 100)}%`;
}
