import { afterEach, describe, expect, it, vi } from "vitest";
import { getSiteUrl } from "@/lib/seo/site-url";
import { getAlternates, getOpenGraph } from "@/lib/seo/metadata";
import robots from "@/app/robots";

afterEach(() => vi.unstubAllEnvs());

describe("public search URLs", () => {
  it("keeps the canonical production host on preview deployments", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_URL", "preview-123.vercel.app");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "project.vercel.app");
    expect(getSiteUrl()).toBe("https://www.real-hourly.com");
    expect(getAlternates("ko", "/calculator").canonical).toBe(
      "https://www.real-hourly.com/ko/calculator",
    );
    expect(robots().sitemap).toBe("https://www.real-hourly.com/sitemap.xml");
  });

  it("normalizes configured search and social metadata URLs", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", " https://example.com/// ");
    expect(getSiteUrl()).toBe("https://example.com");
    expect(getAlternates("en", "/features")).toEqual({
      canonical: "https://example.com/en/features",
      languages: {
        ko: "https://example.com/ko/features",
        en: "https://example.com/en/features",
        "x-default": "https://example.com/ko/features",
      },
    });
    expect(getOpenGraph("en", "/features", "Features", "Guide").url).toBe(
      "https://example.com/en/features",
    );
    expect(robots().sitemap).toBe("https://example.com/sitemap.xml");
  });
});
