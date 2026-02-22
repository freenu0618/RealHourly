import { setRequestLocale } from "next-intl/server";
import { getAlternates, getOpenGraph, getTwitter } from "@/lib/seo/metadata";
import { PublicGuideContent } from "@/components/landing/PublicGuideContent";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const isKo = locale === "ko";

  const title = isKo
    ? "RealHourly 기능 가이드 - 7가지 핵심 기능 소개"
    : "RealHourly Features - 7 Key Features Guide";
  const description = isKo
    ? "NLP 시간 기록, 실제 시급 계산, 스코프 크립 감지 등 RealHourly의 핵심 기능을 자세히 알아보세요. 프리랜서 수익 관리를 위한 올인원 도구."
    : "Explore RealHourly's key features: NLP time logging, real rate calculator, scope creep detection, and more. All-in-one tool for freelancer revenue management.";

  return {
    title,
    description,
    keywords: isKo
      ? [
          "프리랜서 도구",
          "NLP 시간 기록",
          "실제 시급 계산기",
          "스코프 크립 감지",
          "프리랜서 수익 관리",
          "AI 시간 추적",
          "프리랜서 인보이스",
        ]
      : [
          "freelancer tools",
          "NLP time logging",
          "real hourly rate calculator",
          "scope creep detection",
          "freelancer revenue management",
          "AI time tracking",
          "freelancer invoice",
        ],
    alternates: getAlternates(locale, "/features"),
    openGraph: getOpenGraph(locale, "/features", title, description),
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
      "@type": "WebPage",
      name: isKo
        ? "RealHourly 기능 가이드"
        : "RealHourly Features Guide",
      description: isKo
        ? "프리랜서를 위한 AI 수익 분석 도구의 7가지 핵심 기능"
        : "7 key features of AI revenue analytics tool for freelancers",
      url: `${siteUrl}/${locale}/features`,
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
          name: isKo ? "기능 가이드" : "Features",
          item: `${siteUrl}/${locale}/features`,
        },
      ],
    },
  ];
}

export default async function FeaturesPage({ params }: Props) {
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
        <PublicGuideContent />
      </div>
      <LandingFooter />
    </>
  );
}
