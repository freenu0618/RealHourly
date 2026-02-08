const CURRENCY_MAP: Record<string, { locale: string; currency: string }> = {
  USD: { locale: "en-US", currency: "USD" },
  KRW: { locale: "ko-KR", currency: "KRW" },
  EUR: { locale: "de-DE", currency: "EUR" },
  GBP: { locale: "en-GB", currency: "GBP" },
  JPY: { locale: "ja-JP", currency: "JPY" },
};

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
