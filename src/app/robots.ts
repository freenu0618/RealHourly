import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/utils/get-base-url";

const disallowPrivatePaths = [
  "/api/",
  "/report/",
  "/timesheet-review/",
  "/*/dashboard/",
  "/*/projects/",
  "/*/time-log/",
  "/*/clients/",
  "/*/settings/",
  "/*/analytics/",
  "/*/reports/",
  "/*/chat/",
  "/*/timesheets/",
];

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: disallowPrivatePaths,
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "Claude-Web",
          "Anthropic-AI",
          "PerplexityBot",
          "Google-Extended",
          "Googlebot",
          "Bingbot",
        ],
        allow: "/",
        disallow: disallowPrivatePaths,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
