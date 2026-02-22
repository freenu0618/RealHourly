import { setRequestLocale } from "next-intl/server";
import { getAlternates, getOpenGraph, getTwitter } from "@/lib/seo/metadata";
import { FullCalculator } from "@/components/landing/FullCalculator";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const isKo = locale === "ko";

  const title = isKo
    ? "프리랜서 실제 시급 계산기 - 숨겨진 비용 포함 | RealHourly"
    : "Freelancer Real Rate Calculator - Including Hidden Costs | RealHourly";
  const description = isKo
    ? "플랫폼 수수료, 세금, 비청구 시간을 모두 반영한 진짜 시급을 계산하세요. 무료 온라인 계산기로 프리랜서 수익을 정확히 파악하세요."
    : "Calculate your real hourly rate after platform fees, taxes, and unbilled time. Free online calculator to accurately measure freelancer earnings.";

  return {
    title,
    description,
    keywords: isKo
      ? [
          "프리랜서 시급 계산기",
          "실제 시급 계산",
          "플랫폼 수수료 계산",
          "프리랜서 세금 계산",
          "숨겨진 비용 계산",
          "Upwork 수수료",
          "크몽 수익",
        ]
      : [
          "freelancer rate calculator",
          "real hourly rate",
          "platform fee calculator",
          "freelancer tax calculator",
          "hidden cost calculator",
          "Upwork fees",
          "freelance earnings",
        ],
    alternates: getAlternates(locale, "/calculator"),
    openGraph: getOpenGraph(locale, "/calculator", title, description),
    twitter: getTwitter(title, description),
  };
}

function buildJsonLd(locale: string) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.real-hourly.com";
  const isKo = locale === "ko";

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: isKo
        ? "프리랜서 실제 시급 계산기"
        : "Freelancer Real Rate Calculator",
      description: isKo
        ? "플랫폼 수수료, 세금, 비청구 시간을 반영한 실제 시급 계산기"
        : "Calculate your real hourly rate after platform fees, taxes, and unbilled time",
      url: `${siteUrl}/${locale}/calculator`,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      isPartOf: {
        "@type": "WebSite",
        name: "RealHourly",
        url: siteUrl,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${siteUrl}/${locale}`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: isKo ? "시급 계산기" : "Calculator",
          item: `${siteUrl}/${locale}/calculator`,
        },
      ],
    },
  ];
}

export default async function CalculatorPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const jsonLd = buildJsonLd(locale);

  return (
    <>
      {jsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <LandingNav />
      <div className="pt-20">
        <FullCalculator />
      </div>
      <LandingFooter />
    </>
  );
}
