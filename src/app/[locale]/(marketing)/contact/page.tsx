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
