import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RealHourly — AI Freelancer Dashboard",
    short_name: "RealHourly",
    description:
      "AI-powered freelancer profitability dashboard. Track time, detect scope creep, find your real hourly rate.",
    id: "/",
    start_url: "/ko?utm_source=pwa",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2B6B93",
    orientation: "portrait-primary",
    lang: "ko-KR",
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
        src: "/images/screenshots/dashboard-ko-light.webp",
        sizes: "1280x720",
        type: "image/webp",
        form_factor: "wide",
        label: "Dashboard — Korean light mode",
      },
      {
        src: "/images/screenshots/dashboard-ko-dark.webp",
        sizes: "1280x720",
        type: "image/webp",
        form_factor: "wide",
        label: "Dashboard — Korean dark mode",
      },
    ],
    shortcuts: [
      {
        name: "프리랜서 실제 시급 계산기",
        short_name: "시급 계산",
        description: "수수료·세금·비청구 시간을 반영한 실제 시급을 계산합니다.",
        url: "/ko/calculator?utm_source=pwa_shortcut",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Real hourly rate calculator",
        short_name: "Rate calculator",
        description: "Calculate a freelancer's real hourly rate after hidden costs.",
        url: "/en/calculator?utm_source=pwa_shortcut",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "기능 가이드",
        short_name: "기능",
        description: "AI 시간 기록, 수익성 분석, 스코프 크립 감지 기능을 확인합니다.",
        url: "/ko/features?utm_source=pwa_shortcut",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
    ],
  };
}
