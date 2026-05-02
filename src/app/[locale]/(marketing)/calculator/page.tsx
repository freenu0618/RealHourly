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
    ? "프리랜서 실제 시급 계산기 - 수수료·세금·비청구 시간·최소 수주 단가 | RealHourly"
    : "Freelancer Hourly Rate Calculator - Fees, Taxes, Unbilled Time & Minimum Rate | RealHourly";
  const description = isKo
    ? "플랫폼 수수료, 세금, 비청구 시간을 모두 반영한 진짜 시급을 계산하세요. 무료 온라인 계산기로 프리랜서 수익성, 최소 수주 단가, 프로젝트 가격 기준선을 더 정확히 잡을 수 있습니다."
    : "Calculate your real hourly rate after platform fees, taxes, and unbilled time. Free online calculator to measure freelancer profitability, set a smarter minimum rate, and price projects with more confidence.";

  return {
    title,
    description,
    keywords: isKo
      ? [
          "프리랜서 시급 계산기",
          "실제 시급 계산",
          "최소 수주 단가 계산",
          "프로젝트 가격 계산",
          "플랫폼 수수료 계산",
          "프리랜서 세금 계산",
          "숨겨진 비용 계산",
          "Upwork 수수료",
          "크몽 수익",
        ]
      : [
          "freelancer rate calculator",
          "real hourly rate",
          "minimum freelance rate",
          "project pricing calculator",
          "platform fee calculator",
          "freelancer tax calculator",
          "hidden cost calculator",
          "Upwork fees",
          "freelance earnings",
        ],
    robots: { index: true, follow: true, "max-image-preview": "large" as const, "max-snippet": -1 },
    alternates: getAlternates(locale, "/calculator"),
    openGraph: getOpenGraph(locale, "/calculator", title, description),
    twitter: getTwitter(title, description),
  };
}

function buildJsonLd(locale: string) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.real-hourly.com";
  const isKo = locale === "ko";

  const calculatorName = isKo
    ? "프리랜서 실제 시급 계산기"
    : "Freelancer Real Rate Calculator";
  const calculatorDescription = isKo
    ? "플랫폼 수수료, 세금, 비청구 시간을 반영한 실제 시급 계산기"
    : "Calculate your real hourly rate after platform fees, taxes, and unbilled time";

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: calculatorName,
      description: calculatorDescription,
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
      "@type": "HowTo",
      name: isKo
        ? "프리랜서 실제 시급 계산 방법"
        : "How to calculate your real freelance hourly rate",
      description: calculatorDescription,
      totalTime: "PT3M",
      tool: [
        {
          "@type": "HowToTool",
          name: calculatorName,
        },
      ],
      step: (isKo
        ? [
            {
              name: "총 계약 금액 입력",
              text: "클라이언트와 합의한 프로젝트 금액이나 예상 매출을 입력합니다.",
            },
            {
              name: "플랫폼 수수료와 세금 반영",
              text: "Upwork, Fiverr, 크몽 등 플랫폼 수수료와 예상 세금률을 더해 순수입을 계산합니다.",
            },
            {
              name: "실제 투입 시간 계산",
              text: "제작 시간뿐 아니라 미팅, 이메일, 수정, 리서치 같은 비청구 시간을 포함합니다.",
            },
            {
              name: "실제 시급과 최소 수주 단가 확인",
              text: "순수입을 실제 투입 시간으로 나눠 실제 시급을 확인하고, 다음 견적의 기준선을 잡습니다.",
            },
          ]
        : [
            {
              name: "Enter the project fee",
              text: "Add the agreed project fee or expected gross revenue from the client.",
            },
            {
              name: "Include platform fees and taxes",
              text: "Account for fees from platforms such as Upwork, Fiverr, or local marketplaces plus your expected tax rate.",
            },
            {
              name: "Count all real working time",
              text: "Include unbilled meetings, emails, revisions, research, and admin time, not only production hours.",
            },
            {
              name: "Review real hourly rate and minimum rate",
              text: "Divide net revenue by real hours worked to find your real hourly rate and set a safer baseline for the next quote.",
            },
          ]
      ).map((step, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        ...step,
      })),
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
