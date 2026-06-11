import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/utils/get-base-url";

const baseUrl = getBaseUrl();

// Only public, indexable pages — authenticated & noindex pages excluded
const staticPages = [
  { path: "", changeFrequency: "weekly" as const, priority: 1.0 },
  { path: "/features", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/calculator", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/contact", changeFrequency: "monthly" as const, priority: 0.5 },
  { path: "/privacy", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly" as const, priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/llms.txt`,
      lastModified: "2026-06-12",
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];
  const lastModified = new Date().toISOString().split("T")[0];

  for (const locale of ["ko", "en"]) {
    for (const page of staticPages) {
      entries.push({
        url: `${baseUrl}/${locale}${page.path}`,
        lastModified,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages: {
            ko: `${baseUrl}/ko${page.path}`,
            en: `${baseUrl}/en${page.path}`,
            "x-default": `${baseUrl}/ko${page.path}`,
          },
        },
      });
    }
  }

  return entries;
}
