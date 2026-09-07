import { setRequestLocale } from "next-intl/server";
import { getAlternates, getOpenGraph, getTwitter } from "@/lib/seo/metadata";
import TermsContent from "./TermsContent";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const isKo = locale === "ko";

  const title = isKo
    ? "이용약관 | RealHourly"
    : "Terms of Service | RealHourly";
  const description = isKo
    ? "RealHourly 서비스 이용약관입니다. 서비스 사용 조건과 사용자 권리를 확인하세요."
    : "Terms of Service for RealHourly. Review the conditions and user rights for using our service.";

  return {
    title,
    description,
    robots: { index: true, follow: true, "max-image-preview": "large" as const, "max-snippet": -1 },
    alternates: getAlternates(locale, "/terms"),
    openGraph: getOpenGraph(locale, "/terms", title, description),
    twitter: getTwitter(title, description),
  };
}

function buildJsonLd(locale: string) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.real-hourly.com";
  const isKo = locale === "ko";
  const dateModified = "2026-02-13";

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: isKo
        ? "RealHourly 서비스 이용약관"
        : "RealHourly Terms of Service",
      description: isKo
        ? "RealHourly 서비스 이용 조건, 구독, 결제, 데이터, 책임 제한을 안내하는 이용약관"
        : "RealHourly terms covering service use, subscriptions, billing, data, and liability boundaries",
      url: `${siteUrl}/${locale}/terms`,
      inLanguage: isKo ? "ko-KR" : "en-US",
      dateModified,
      about: isKo
        ? [
            "프리랜서 수익성 계산 참고용 한계",
            "구독 및 결제 조건",
            "사용자 콘텐츠와 데이터 처리",
            "서비스 책임 제한",
          ]
        : [
            "Freelancer profitability estimate boundaries",
            "Subscription and billing terms",
            "User content and data processing",
            "Service liability limits",
          ],
      isPartOf: {
        "@type": "WebSite",
        name: "RealHourly",
        url: siteUrl,
      },
      publisher: {
        "@type": "Organization",
        name: "RealHourly",
        url: siteUrl,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      dateModified,
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
          name: isKo ? "이용약관" : "Terms of Service",
          item: `${siteUrl}/${locale}/terms`,
        },
      ],
    },
  ];
}

export default async function TermsPage({ params }: Props) {
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
      <TermsContent />
    </>
  );
}
