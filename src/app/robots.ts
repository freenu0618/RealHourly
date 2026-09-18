import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/utils/get-base-url";

const disallowPrivatePaths = [
  "/api/",
  "/offline/",
  "/*/offline/",
  "/report/",
  "/timesheet-review/",
  "/*/login",
  "/*/login/",
  "/*/reset-password",
  "/*/reset-password/",
  "/*/verify",
  "/*/verify/",
  "/*/auth",
  "/*/auth/",
  "/*/dashboard",
  "/*/dashboard/",
  "/*/projects",
  "/*/projects/",
  "/*/time-log",
  "/*/time-log/",
  "/*/clients",
  "/*/clients/",
  "/*/settings",
  "/*/settings/",
  "/*/analytics",
  "/*/analytics/",
  "/*/reports",
  "/*/reports/",
  "/*/chat",
  "/*/chat/",
  "/*/timesheets",
  "/*/timesheets/",
  "/*/guide",
  "/*/guide/",
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
          "OAI-SearchBot",
          "ChatGPT-User",
          "Claude-Web",
          "ClaudeBot",
          "Claude-SearchBot",
          "Anthropic-AI",
          "PerplexityBot",
          "Perplexity-User",
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
