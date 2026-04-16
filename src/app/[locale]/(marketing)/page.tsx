import { setRequestLocale } from "next-intl/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";
import { getAlternates } from "@/lib/seo/metadata";
import { LandingContent } from "@/components/landing/LandingContent";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.real-hourly.com";

  return {
    title:
      locale === "ko"
        ? "RealHourly - 프리랜서 실제 시급 계산기 | 수익성 분석·시간 추적"
        : "RealHourly - Freelancer Hourly Rate Calculator | Profitability & Time Tracking",
    description:
      locale === "ko"
        ? "플랫폼 수수료, 세금, 비청구 시간, 숨겨진 비용을 차감한 진짜 시급을 확인하세요. AI가 시간을 자동 기록하고, 스코프 크립을 감지하고, 프로젝트 수익성을 분석합니다. 프리랜서를 위한 무료 수익 관리 도구입니다."
        : "Discover your real hourly rate after platform fees, taxes, unbilled time, and hidden costs. AI auto-logs time, detects scope creep, and analyzes project profitability. Free revenue management tool for freelancers.",
    keywords:
      locale === "ko"
        ? [
            "프리랜서 시급 계산기",
            "실제 시급",
            "프리랜서 수익 분석",
            "AI 시간 기록",
            "스코프 크립 감지",
            "프리랜서 도구",
            "Upwork 수수료 계산",
            "크몽 수익 관리",
            "프리랜서 세금 계산",
            "시간 추적",
          ]
        : [
            "freelancer hourly rate calculator",
            "real hourly rate",
            "freelancer revenue analytics",
            "AI time tracking",
            "scope creep detection",
            "freelancer tools",
            "Upwork fee calculator",
            "freelance profitability",
            "hidden cost calculator",
            "time tracking",
          ],
    alternates: getAlternates(locale),
    openGraph: {
      title:
        locale === "ko"
          ? "RealHourly - 프리랜서 실제 시급 계산기"
          : "RealHourly - Freelancer Hourly Rate Calculator",
      description:
        locale === "ko"
          ? "계약 시급이 아닌 실제 시급을 확인하세요. AI가 숨겨진 비용, 비청구 시간, 수익성을 분석합니다."
          : "See your real hourly rate, not just your contract rate. AI analyzes hidden costs, unbilled time, and profitability.",
      type: "website" as const,
      url: `${siteUrl}/${locale}`,
      siteName: "RealHourly",
      images: [
        {
          url: "/api/og",
          width: 1200,
          height: 630,
          alt: "RealHourly - AI Freelancer Revenue Analytics",
        },
      ],
      locale: locale === "ko" ? "ko_KR" : "en_US",
    },
    twitter: {
      card: "summary_large_image" as const,
      title:
        locale === "ko"
          ? "RealHourly - 프리랜서 실제 시급 계산기"
          : "RealHourly - Freelancer Hourly Rate Calculator",
      description:
        locale === "ko"
          ? "계약 시급이 아닌 진짜 시급을 확인하세요. 수수료·세금·비청구 시간까지 반영합니다."
          : "See your real rate, not your contract rate. Includes fees, taxes, and unbilled time.",
      images: ["/api/og"],
    },
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large" as const,
      "max-snippet": -1,
    },
  };
}

function buildJsonLd(locale: string) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.real-hourly.com";
  const isKo = locale === "ko";

  const faqs = isKo
    ? [
        {
          q: "RealHourly는 무료로 사용할 수 있나요?",
          a: "네, Free 플랜으로 프로젝트 2개, AI 시간 파싱 월 20회, AI 채팅 월 10회를 영구 무료로 이용할 수 있어요. 카드 정보 없이 바로 시작할 수 있습니다.",
        },
        {
          q: "Pro 플랜의 가격은 얼마인가요?",
          a: "Pro는 월 $9(약 12,000원) 또는 연간 $84(월 $7, 약 9,300원)입니다. 연간 결제 시 22% 할인됩니다. 언제든 해지할 수 있습니다.",
        },
        {
          q: "어떤 플랫폼을 지원하나요?",
          a: "Upwork, Fiverr, 크몽, 숨고, Freelancer.com 등 주요 프리랜서 플랫폼의 수수료 프리셋을 제공합니다. 다만 Upwork처럼 계약별로 수수료가 달라질 수 있는 플랫폼도 있어, 프리셋은 시작점으로 보고 실제 계약 수수료에 맞춰 커스텀 입력하는 것을 권장합니다.",
        },
        {
          q: "'실제 시급'이 뭔가요? 어떻게 계산되나요?",
          a: "실제 시급은 플랫폼 수수료, 세금, 도구 비용 등 모든 숨겨진 비용을 차감한 후 실제 투입 시간(미팅, 이메일, 수정 포함)으로 나눈 값입니다.",
        },
        {
          q: "스코프 크립(범위 초과) 알림은 어떻게 작동하나요?",
          a: "프로젝트의 시간 사용률, 수정 작업 비율, 수정 횟수를 실시간 모니터링합니다. 범위 초과가 감지되면 AI가 클라이언트에게 보낼 메시지를 정중/중립/단호 3가지 톤으로 생성합니다.",
        },
        {
          q: "데이터는 안전한가요?",
          a: "Supabase(PostgreSQL) 기반으로 데이터가 암호화 저장되며, 행 수준 보안(RLS)으로 본인의 데이터만 접근 가능합니다.",
        },
        {
          q: "Pro에서 Free로 다운그레이드하면 데이터가 삭제되나요?",
          a: "아니요, 모든 데이터는 그대로 유지됩니다. 다만 Free 플랜의 제한(프로젝트 2개, AI 파싱 20회/월)이 적용됩니다.",
        },
        {
          q: "영어와 한국어를 모두 지원하나요?",
          a: "네, UI는 한국어/영어를 모두 지원하고 브라우저 언어를 자동 감지합니다. AI 시간 기록도 한국어와 영어 자연어로 입력할 수 있어요.",
        },
      ]
    : [
        {
          q: "Is RealHourly free to use?",
          a: "Yes, the Free plan includes up to 2 projects, 20 AI time parses/month, and 10 AI chats/month — forever free. No credit card required.",
        },
        {
          q: "How much does the Pro plan cost?",
          a: "Pro is $9/month or $84/year ($7/month). Save 22% with annual billing. Cancel anytime.",
        },
        {
          q: "Which freelance platforms are supported?",
          a: "We provide fee presets for Upwork, Fiverr, Freelancer.com, and more. Some platforms, including Upwork, can have contract-specific fee variations, so the preset should be treated as a starting point and adjusted with the custom fee input when needed.",
        },
        {
          q: "What is 'real hourly rate' and how is it calculated?",
          a: "Your real hourly rate subtracts all hidden costs (platform fees, taxes, tool costs) from gross revenue, then divides by actual hours worked including meetings, emails, and revisions.",
        },
        {
          q: "How do scope creep alerts work?",
          a: "We monitor time usage, revision work ratio, and revision count in real-time. When scope creep is detected, AI generates client messages in 3 tones: polite, neutral, and firm.",
        },
        {
          q: "Is my data safe and private?",
          a: "Data is encrypted and stored on Supabase (PostgreSQL) with Row Level Security (RLS). Only you can access your data.",
        },
        {
          q: "If I downgrade from Pro to Free, will I lose my data?",
          a: "No, all your data is preserved. Free plan limits (2 projects, 20 AI parses/month) will apply, but previous data remains accessible.",
        },
        {
          q: "Does RealHourly support both English and Korean?",
          a: "Yes, the UI supports both English and Korean with automatic browser language detection. AI time logging also accepts natural language in both languages.",
        },
      ];

  return [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "RealHourly",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: siteUrl,
      description: isKo
        ? "AI 기반 프리랜서 수익 분석 대시보드. 숨겨진 비용을 차감한 실제 시급을 계산합니다."
        : "AI-powered freelancer revenue analytics dashboard. Calculate your real hourly rate after hidden costs.",
      offers: [
        {
          "@type": "Offer",
          name: "Free",
          price: "0",
          priceCurrency: "USD",
          description: isKo
            ? "프로젝트 2개, AI 파싱 20회/월"
            : "2 projects, 20 AI parses/month",
        },
        {
          "@type": "Offer",
          name: "Pro Monthly",
          price: "9",
          priceCurrency: "USD",
          description: isKo
            ? "무제한 프로젝트 및 AI 기능"
            : "Unlimited projects and AI features",
        },
        {
          "@type": "Offer",
          name: "Pro Yearly",
          price: "84",
          priceCurrency: "USD",
          description: isKo
            ? "연간 결제 시 22% 할인"
            : "Save 22% with annual billing",
        },
      ],
      featureList: isKo
        ? "실제 시급 계산, AI 시간 기록, 스코프 크립 감지, 수익 대시보드, PDF 인보이스, 음성 입력"
        : "Real hourly rate, AI time logging, scope creep detection, revenue dashboard, PDF invoices, voice input",
      screenshot: `${siteUrl}/images/screenshots/dashboard.webp`,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.a,
        },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "RealHourly",
      url: siteUrl,
      logo: `${siteUrl}/images/logo.webp`,
      description: isKo
        ? "프리랜서를 위한 AI 수익 분석 도구"
        : "AI revenue analytics tool for freelancers",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "RealHourly",
      url: siteUrl,
      inLanguage: [isKo ? "ko-KR" : "en-US"],
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteUrl}/${locale}/features`,
        },
      },
    },
  ];
}

export default async function LandingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect({ href: "/dashboard", locale });
  }

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
      <LandingContent />
    </>
  );
}
