import { setRequestLocale } from "next-intl/server";
import { getAlternates } from "@/lib/seo/metadata";
import PrivacyContent from "./PrivacyContent";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return {
    title:
      locale === "ko"
        ? "개인정보 처리방침 | RealHourly"
        : "Privacy Policy | RealHourly",
    description:
      locale === "ko"
        ? "RealHourly 개인정보 처리방침입니다."
        : "Privacy Policy for RealHourly.",
    alternates: getAlternates(locale, "/privacy"),
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PrivacyContent />;
}
