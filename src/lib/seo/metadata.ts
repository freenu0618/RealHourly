import { getSiteUrl } from "./site-url";

/**
 * Generate alternates (canonical + hreflang + x-default) for a given locale and path.
 * Usage: `alternates: getAlternates(locale, "/features")`
 */
export function getAlternates(locale: string, path: string = "") {
  return {
    canonical: `${getSiteUrl()}/${locale}${path}`,
    languages: {
      ko: `${getSiteUrl()}/ko${path}`,
      en: `${getSiteUrl()}/en${path}`,
      "x-default": `${getSiteUrl()}/ko${path}`,
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
    url: `${getSiteUrl()}/${locale}${path}`,
    siteName: "RealHourly",
    images: [
      {
        url: "/og-image.png",
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
    images: ["/og-image.png"],
  };
}
