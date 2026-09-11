import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(self), geolocation=()",
  },
];

const noindexHeaders = [
  {
    key: "X-Robots-Tag",
    value: "noindex, nofollow, noarchive",
  },
];

const privateRoutes = [
  "/api/:path*",
  "/offline/:path*",
  "/:locale/offline/:path*",
  "/report/:path*",
  "/timesheet-review/:path*",
  "/:locale/login/:path*",
  "/:locale/reset-password/:path*",
  "/:locale/verify/:path*",
  "/:locale/auth/:path*",
  "/:locale/dashboard/:path*",
  "/:locale/projects/:path*",
  "/:locale/time-log/:path*",
  "/:locale/clients/:path*",
  "/:locale/settings/:path*",
  "/:locale/analytics/:path*",
  "/:locale/reports/:path*",
  "/:locale/chat/:path*",
  "/:locale/timesheets/:path*",
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["@react-pdf/renderer"],

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      ...privateRoutes.map((source) => ({
        source,
        headers: noindexHeaders,
      })),
    ];
  },

  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default withNextIntl(nextConfig);
