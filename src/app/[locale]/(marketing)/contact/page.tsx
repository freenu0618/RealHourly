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

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ContactContent />;
}
