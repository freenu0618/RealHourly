const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.real-hourly.com";

/**
 * Generate alternates (canonical + hreflang + x-default) for a given locale and path.
 * Usage: `alternates: getAlternates(locale, "/features")`
 */
export function getAlternates(locale: string, path: string = "") {
  return {
    canonical: `${SITE_URL}/${locale}${path}`,
    languages: {
      ko: `${SITE_URL}/ko${path}`,
      en: `${SITE_URL}/en${path}`,
      "x-default": `${SITE_URL}/ko${path}`,
    },
  };
}
