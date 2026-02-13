import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/utils/get-base-url";

const baseUrl = getBaseUrl();

const staticPages = [
  "",           // landing
  "/dashboard",
  "/projects",
  "/time-log",
  "/time-log/history",
  "/analytics",
  "/reports",
  "/timesheets",
  "/chat",
  "/clients",
  "/settings",
  "/login",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of ["ko", "en"]) {
    for (const page of staticPages) {
      entries.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === "" ? "weekly" : "daily",
        priority: page === "" ? 1.0 : page === "/dashboard" ? 0.9 : 0.7,
      });
    }
  }

  return entries;
}
