import { setRequestLocale } from "next-intl/server";
import { getAlternates } from "@/lib/seo/metadata";
import ContactContent from "./ContactContent";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return {
    title: locale === "ko" ? "문의하기 | RealHourly" : "Contact Us | RealHourly",
    description:
      locale === "ko"
        ? "RealHourly에 문의하세요. 24시간 이내에 답변합니다."
        : "Contact RealHourly. We respond within 24 hours.",
    alternates: getAlternates(locale, "/contact"),
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ContactContent />;
}
