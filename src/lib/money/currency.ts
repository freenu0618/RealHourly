const CURRENCY_MAP: Record<string, { locale: string; currency: string }> = {
  USD: { locale: "en-US", currency: "USD" },
  KRW: { locale: "ko-KR", currency: "KRW" },
  EUR: { locale: "de-DE", currency: "EUR" },
  GBP: { locale: "en-GB", currency: "GBP" },
  JPY: { locale: "ja-JP", currency: "JPY" },
};

/** Returns the most frequently used currency among items, falling back to "USD". */
export function getDominantCurrency(
  items: { currency: string }[],
): string {
  if (items.length === 0) return "USD";
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(item.currency, (counts.get(item.currency) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

export function formatCurrency(
  amount: number,
  currency: string,
  locale?: string,
): string {
  const cfg = CURRENCY_MAP[currency] ?? CURRENCY_MAP.USD;
  const fmt = new Intl.NumberFormat(locale ?? cfg.locale, {
    style: "currency",
    currency: cfg.currency,
    maximumFractionDigits: currency === "KRW" || currency === "JPY" ? 0 : 2,
    minimumFractionDigits: 0,
  });
  return fmt.format(amount);
}
