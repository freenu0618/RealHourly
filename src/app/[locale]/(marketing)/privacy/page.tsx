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
    title,
    description,
    alternates: getAlternates(locale, "/privacy"),
    openGraph: getOpenGraph(locale, "/privacy", title, description),
    twitter: getTwitter(title, description),
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PrivacyContent />;
}
