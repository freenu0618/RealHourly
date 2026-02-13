import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RealHourly — AI Freelancer Dashboard",
    short_name: "RealHourly",
    description:
      "AI-powered freelancer profitability dashboard. Track time, detect scope creep, find your real hourly rate.",
    start_url: "/ko/dashboard",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2B6B93",
    orientation: "portrait-primary",
    categories: ["business", "productivity", "finance"],
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/images/screenshots/dashboard-ko-light.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "Dashboard — Korean light mode",
      },
      {
        src: "/images/screenshots/dashboard-ko-dark.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "Dashboard — Korean dark mode",
      },
    ],
  };
}
