import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/utils/get-base-url";

const baseUrl = getBaseUrl();

// Only public pages — authenticated pages must NOT be in sitemap
const staticPages = [
  "",           // landing
  "/login",
  "/terms",
  "/privacy",
  "/contact",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of ["ko", "en"]) {
    for (const page of staticPages) {
      entries.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === "" ? "weekly" : "monthly",
        priority: page === "" ? 1.0 : page === "/login" ? 0.8 : 0.5,
      });
    }
  }

  return entries;
}
