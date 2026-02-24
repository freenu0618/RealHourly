import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/utils/get-base-url";

const baseUrl = getBaseUrl();

// Only public, indexable pages — authenticated & noindex pages excluded
const staticPages = [
  "",           // landing
  "/features",
  "/calculator",
  "/contact",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of ["ko", "en"]) {
    for (const page of staticPages) {
      entries.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: "2026-02-24",
        changeFrequency: page === "" ? "weekly" : "monthly",
        priority:
          page === "" ? 1.0
          : page === "/features" || page === "/calculator" ? 0.8
          : 0.5,
        alternates: {
          languages: {
            ko: `${baseUrl}/ko${page}`,
            en: `${baseUrl}/en${page}`,
          },
        },
      });
    }
  }

  return entries;
}
