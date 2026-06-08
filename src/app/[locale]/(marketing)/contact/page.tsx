import { setRequestLocale } from "next-intl/server";
import { getAlternates, getOpenGraph, getTwitter } from "@/lib/seo/metadata";
import ContactContent from "./ContactContent";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const isKo = locale === "ko";

  const title = isKo
    ? "문의하기 | RealHourly"
    : "Contact Us | RealHourly";
  const description = isKo
    ? "RealHourly에 문의하세요. 24시간 이내에 답변합니다. 기능 제안, 버그 신고, 파트너십 문의를 환영합니다."
    : "Contact RealHourly. We respond within 24 hours. Feature suggestions, bug reports, and partnership inquiries welcome.";

  return {
    title,
    description,
    robots: { index: true, follow: true, "max-image-preview": "large" as const, "max-snippet": -1 },
    alternates: getAlternates(locale, "/contact"),
    openGraph: getOpenGraph(locale, "/contact", title, description),
    twitter: getTwitter(title, description),
  };
}

function buildJsonLd(locale: string) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.real-hourly.com";
  const isKo = locale === "ko";
  const dateModified = "2026-06-09";
  const contactTopics = isKo
    ? [
        ["기능 제안", "프리랜서 수익성 관리, AI 시간 기록, 리포트 개선 아이디어"],
        ["버그 신고", "문제가 발생한 페이지, 브라우저, 재현 단계"],
        ["결제 문의", "플랜, 영수증, 구독 상태, 결제 정책 확인"],
        ["도입 상담", "팀·스튜디오 워크플로, 파트너십, 커스텀 운영 질문"],
      ]
    : [
        ["Feature requests", "Ideas for freelancer profitability, AI time logging, and reports"],
        ["Bug reports", "Affected page, browser, and steps to reproduce the issue"],
        ["Billing questions", "Plan, receipt, subscription status, or billing policy questions"],
        ["Adoption questions", "Team workflows, partnerships, or custom operating questions"],
      ];

  return [
    {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: isKo ? "RealHourly 문의하기" : "Contact RealHourly",
      description: isKo
        ? "RealHourly 기능 제안, 버그 신고, 결제 문의를 위한 공식 문의 페이지"
        : "Official contact page for RealHourly feature requests, bug reports, and billing questions",
      url: `${siteUrl}/${locale}/contact`,
      inLanguage: isKo ? "ko-KR" : "en-US",
      dateModified,
      isPartOf: {
        "@type": "WebSite",
        name: "RealHourly",
        url: siteUrl,
      },
      contactPoint: {
        "@type": "ContactPoint",
        email: "support@real-hourly.com",
        contactType: "customer support",
        availableLanguage: ["Korean", "English"],
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: isKo
        ? "RealHourly 문의 가능 주제"
        : "RealHourly contact topics",
      description: isKo
        ? "RealHourly 공식 문의 페이지에서 접수하는 주요 문의 유형"
        : "Primary inquiry types handled through the official RealHourly contact page",
      url: `${siteUrl}/${locale}/contact`,
      inLanguage: isKo ? "ko-KR" : "en-US",
      dateModified,
      numberOfItems: contactTopics.length,
      itemListElement: contactTopics.map(([name, description], index) => ({
        "@type": "ListItem",
        position: index + 1,
        name,
        description,
      })),
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
          name: isKo ? "문의하기" : "Contact",
          item: `${siteUrl}/${locale}/contact`,
        },
      ],
    },
  ];
}

export default async function ContactPage({ params }: Props) {
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
      <ContactContent />
    </>
  );
}
