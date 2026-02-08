import { formatCurrency } from "./currency";

export function formatFactBomb(
  nominal: number,
  real: number,
  currency: string,
  locale?: string,
): string {
  const nominalStr = formatCurrency(nominal, currency, locale);
  const realStr = formatCurrency(real, currency, locale);
  return `${nominalStr} → ${realStr}`;
}

export function formatHours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
