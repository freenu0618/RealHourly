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
    alternates: getAlternates(locale, "/terms"),
    openGraph: getOpenGraph(locale, "/terms", title, description),
    twitter: getTwitter(title, description),
  };
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <TermsContent />;
}
