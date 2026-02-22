import { setRequestLocale } from "next-intl/server";
import { getAlternates } from "@/lib/seo/metadata";
import { PublicGuideContent } from "@/components/landing/PublicGuideContent";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return {
    title:
      locale === "ko"
        ? "RealHourly 기능 가이드 - 7가지 핵심 기능 소개"
        : "RealHourly Features - 7 Key Features Guide",
    description:
      locale === "ko"
        ? "NLP 시간 기록, 실제 시급 계산, 스코프 크립 감지 등 RealHourly의 핵심 기능을 자세히 알아보세요."
        : "Explore RealHourly's key features: NLP time logging, real rate calculator, scope creep detection, and more.",
    alternates: getAlternates(locale, "/features"),
  };
}

export default async function FeaturesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <LandingNav />
      <div className="pt-20">
        <PublicGuideContent />
      </div>
      <LandingFooter />
    </>
  );
}
