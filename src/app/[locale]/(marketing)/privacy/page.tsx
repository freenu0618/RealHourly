import { setRequestLocale } from "next-intl/server";
import { getAlternates, getOpenGraph, getTwitter } from "@/lib/seo/metadata";
import PrivacyContent from "./PrivacyContent";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const isKo = locale === "ko";

  const title = isKo
    ? "개인정보 처리방침 | RealHourly"
    : "Privacy Policy | RealHourly";
  const description = isKo
    ? "RealHourly 개인정보 처리방침입니다. 개인정보 수집, 사용, 보호에 관한 내용을 확인하세요."
    : "Privacy Policy for RealHourly. Learn about how we collect, use, and protect your personal information.";

  return {
    title: { absolute: title },
    description,
    robots: { index: true, follow: true, "max-image-preview": "large" as const, "max-snippet": -1 },
    alternates: getAlternates(locale, "/privacy"),
    openGraph: getOpenGraph(locale, "/privacy", title, description),
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
        ? "RealHourly 개인정보 처리방침"
        : "RealHourly Privacy Policy",
      description: isKo
        ? "RealHourly의 개인정보 수집, 이용, 보관, 제3자 처리, 사용자 권리 안내"
        : "How RealHourly collects, uses, stores, and processes personal data and user rights",
      url: `${siteUrl}/${locale}/privacy`,
      inLanguage: isKo ? "ko-KR" : "en-US",
      dateModified,
      publisher: {
        "@type": "Organization",
        name: "RealHourly",
        url: siteUrl,
        contactPoint: {
          "@type": "ContactPoint",
          email: "support@real-hourly.com",
          contactType: "privacy support",
          availableLanguage: ["Korean", "English"],
        },
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
          name: isKo ? "개인정보 처리방침" : "Privacy Policy",
          item: `${siteUrl}/${locale}/privacy`,
        },
      ],
    },
  ];
}

export default async function PrivacyPage({ params }: Props) {
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
      <PrivacyContent />
    </>
  );
}
