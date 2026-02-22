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

/**
 * Generate OpenGraph metadata for a page.
 */
export function getOpenGraph(
  locale: string,
  path: string,
  title: string,
  description: string,
) {
  return {
    title,
    description,
    type: "website" as const,
    url: `${SITE_URL}/${locale}${path}`,
    siteName: "RealHourly",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "RealHourly - AI Freelancer Revenue Analytics",
      },
    ],
    locale: locale === "ko" ? "ko_KR" : "en_US",
  };
}

/**
 * Generate Twitter card metadata for a page.
 */
export function getTwitter(title: string, description: string) {
  return {
    card: "summary_large_image" as const,
    title,
    description,
    images: ["/api/og"],
  };
}
