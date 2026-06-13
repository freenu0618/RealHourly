import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/utils/get-base-url";

const disallowPrivatePaths = [
  "/api/",
  "/report/",
  "/timesheet-review/",
  "/*/login/",
  "/*/reset-password/",
  "/*/verify/",
  "/*/auth/",
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
        allow: ["/", "/llms.txt"],
        disallow: disallowPrivatePaths,
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "Claude-Web",
          "ClaudeBot",
          "Anthropic-AI",
          "PerplexityBot",
          "Google-Extended",
          "Googlebot",
          "Bingbot",
          "Yeti",
          "Applebot",
          "Applebot-Extended",
          "CCBot",
        ],
        allow: ["/", "/llms.txt"],
        disallow: disallowPrivatePaths,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
