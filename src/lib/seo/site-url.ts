const PRODUCTION_URL = "https://www.real-hourly.com";

/** Public search URLs must not depend on a preview deployment hostname. */
export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL?.trim() || PRODUCTION_URL).replace(/\/+$/, "");
}
