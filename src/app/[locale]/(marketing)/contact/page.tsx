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
    ? "RealHourly에 문의하세요. 기능 제안, 버그 신고, 결제 문의를 접수하며 클라이언트 이름·계약서·결제 정보 없이 필요한 범위만 안내합니다."
    : "Contact RealHourly for feature requests, bug reports, and billing questions without sharing client names, contracts, or payment details.";

  return {
    title: { absolute: title },
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
  const dateModified = "2026-09-09";
  const contactTopics = isKo
    ? [
        ["기능 제안", "프리랜서 수익성 관리, AI 시간 기록, 리포트 개선 아이디어"],
        ["버그 신고", "문제가 발생한 페이지, 브라우저, 입력값 범위, 재현 단계"],
        ["결제 문의", "플랜, 영수증, 구독 상태, 결제 정책 확인"],
        ["도입 상담", "팀·스튜디오 워크플로, 파트너십, 커스텀 운영 질문"],
        ["민감정보 제외", "클라이언트 이름, 계약서 원본, 결제 정보, 인보이스 파일 없이 필요한 상황만 설명"],
      ]
    : [
        ["Feature requests", "Ideas for freelancer profitability, AI time logging, and reports"],
        ["Bug reports", "Affected page, browser, input range, and steps to reproduce the issue"],
        ["Billing questions", "Plan, receipt, subscription status, or billing policy questions"],
        ["Adoption questions", "Team workflows, partnerships, or custom operating questions"],
        ["Sensitive-data minimization", "Describe the situation without client names, full contracts, payment details, or invoice files"],
      ];

  return [
    {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: isKo ? "RealHourly 문의하기" : "Contact RealHourly",
      description: isKo
        ? "RealHourly 기능 제안, 버그 신고, 결제 문의를 민감정보 없이 접수하는 공식 문의 페이지"
        : "Official contact page for RealHourly feature requests, bug reports, and billing questions with sensitive-data minimization guidance",
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
