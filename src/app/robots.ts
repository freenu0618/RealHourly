import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/utils/get-base-url";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/report/", "/timesheet-review/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
