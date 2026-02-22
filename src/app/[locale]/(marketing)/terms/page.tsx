import { setRequestLocale } from "next-intl/server";
import { getAlternates } from "@/lib/seo/metadata";
import TermsContent from "./TermsContent";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return {
    title: locale === "ko" ? "이용약관 | RealHourly" : "Terms of Service | RealHourly",
    description:
      locale === "ko"
        ? "RealHourly 서비스 이용약관입니다."
        : "Terms of Service for RealHourly.",
    alternates: getAlternates(locale, "/terms"),
  };
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <TermsContent />;
}
