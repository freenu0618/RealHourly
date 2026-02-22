import { setRequestLocale } from "next-intl/server";
import { getAlternates } from "@/lib/seo/metadata";
import { FullCalculator } from "@/components/landing/FullCalculator";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return {
    title:
      locale === "ko"
        ? "프리랜서 실제 시급 계산기 - 숨겨진 비용 포함 | RealHourly"
        : "Freelancer Real Rate Calculator - Including Hidden Costs | RealHourly",
    description:
      locale === "ko"
        ? "플랫폼 수수료, 세금, 비청구 시간을 모두 반영한 진짜 시급을 계산하세요. 무료 온라인 계산기."
        : "Calculate your real hourly rate after platform fees, taxes, and unbilled time. Free online calculator.",
    alternates: getAlternates(locale, "/calculator"),
  };
}

export default async function CalculatorPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <LandingNav />
      <div className="pt-20">
        <FullCalculator />
      </div>
      <LandingFooter />
    </>
  );
}
