import { setRequestLocale } from "next-intl/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";
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
        ? "RealHourly - 프리랜서 실제 시급 계산기 | AI 수익 분석 도구"
        : "RealHourly - Find Your Real Hourly Rate | AI Freelancer Revenue Analytics",
    description:
      locale === "ko"
        ? "플랫폼 수수료, 세금, 숨겨진 비용을 차감한 진짜 시급을 확인하세요. AI가 시간을 자동 기록하고, 스코프 크립을 감지하고, 수익성을 분석합니다. 프리랜서를 위한 무료 수익 관리 도구."
        : "Discover your real hourly rate after platform fees, taxes, and hidden costs. AI auto-logs time, detects scope creep, and analyzes profitability. Free revenue management tool for freelancers.",
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
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: {
        ko: `${siteUrl}/ko`,
        en: `${siteUrl}/en`,
      },
    },
    openGraph: {
      title:
        locale === "ko"
          ? "RealHourly - 당신의 진짜 시급을 알고 계신가요?"
          : "RealHourly - Do You Know Your Real Hourly Rate?",
      description:
        locale === "ko"
          ? "계약 시급 $75 → 실제 시급 $23. AI가 숨겨진 비용을 분석하고 프리랜서의 진짜 수익을 계산합니다."
          : "Contract rate $75/hr → Real rate $23/hr. AI analyzes hidden costs and calculates your true freelancer earnings.",
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
          : "RealHourly - Find Your Real Hourly Rate",
      description:
        locale === "ko"
          ? "계약 시급이 아닌 '진짜 시급'을 확인하세요. 무료로 시작."
          : "See your real rate, not your contract rate. Start free.",
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
          a: "네, Free 플랜으로 프로젝트 2개, AI 시간 파싱 월 20회, AI 채팅 월 10회를 영구 무료로 이용할 수 있어요.",
        },
        {
          q: "Pro 플랜의 가격은 얼마인가요?",
          a: "Pro는 월 $9(약 12,000원) 또는 연간 $84(월 $7)입니다. 연간 결제 시 22% 할인됩니다.",
        },
        {
          q: "'실제 시급'이 뭔가요?",
          a: "실제 시급은 플랫폼 수수료, 세금, 도구 비용 등 모든 숨겨진 비용을 차감한 후 실제 투입 시간으로 나눈 값입니다.",
        },
        {
          q: "스코프 크립 알림은 어떻게 작동하나요?",
          a: "시간 사용률, 수정 작업 비율을 실시간 모니터링하여 범위 초과를 감지하고 AI가 클라이언트 메시지를 자동 생성합니다.",
        },
        {
          q: "데이터는 안전한가요?",
          a: "Supabase(PostgreSQL) 기반 암호화 저장, 행 수준 보안(RLS)으로 본인만 접근 가능합니다.",
        },
      ]
    : [
        {
          q: "Is RealHourly free to use?",
          a: "Yes, the Free plan includes up to 2 projects, 20 AI time parses/month, and 10 AI chats/month — forever free.",
        },
        {
          q: "How much does the Pro plan cost?",
          a: "Pro is $9/month or $84/year ($7/month). Save 22% with annual billing. Cancel anytime.",
        },
        {
          q: "What is 'real hourly rate'?",
          a: "Your real hourly rate subtracts all hidden costs from gross revenue, then divides by actual hours worked.",
        },
        {
          q: "How do scope creep alerts work?",
          a: "We monitor time usage and revision ratios in real-time. AI generates client messages in 3 tones when scope creep is detected.",
        },
        {
          q: "Is my data safe?",
          a: "Data is encrypted on Supabase (PostgreSQL) with Row Level Security. Only you can access your data.",
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
      screenshot: `${siteUrl}/images/screenshots/dashboard.png`,
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
      logo: `${siteUrl}/images/logo.png`,
      description: isKo
        ? "프리랜서를 위한 AI 수익 분석 도구"
        : "AI revenue analytics tool for freelancers",
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
