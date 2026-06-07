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
        ? "RealHourly - 프리랜서 실제 시급·단가 계산기 | 수익성 분석·시간 추적"
        : "RealHourly - Freelancer Hourly Rate & Pricing Calculator | Profitability & Time Tracking",
    description:
      locale === "ko"
        ? "플랫폼 수수료, 세금, 비청구 시간, 숨겨진 비용을 차감한 진짜 시급과 최소 수주 단가를 확인하세요. AI가 시간을 자동 기록하고, 스코프 크립을 감지하고, 프로젝트 수익성을 분석합니다. 프리랜서를 위한 무료 수익 관리 도구입니다."
        : "Discover your real hourly rate and minimum sustainable project rate after platform fees, taxes, unbilled time, and hidden costs. AI auto-logs time, detects scope creep, and analyzes project profitability. Free revenue management tool for freelancers.",
    keywords:
      locale === "ko"
        ? [
            "프리랜서 시급 계산기",
            "프리랜서 단가 계산기",
            "실제 시급",
            "프리랜서 수익 분석",
            "AI 시간 기록",
            "스코프 크립 감지",
            "프리랜서 도구",
            "Upwork 수수료 계산",
            "크몽 수익 관리",
            "프리랜서 세금 계산",
            "비청구 시간 계산",
            "시간 추적",
          ]
        : [
            "freelancer hourly rate calculator",
            "freelance pricing calculator",
            "real hourly rate",
            "minimum freelance rate",
            "freelancer revenue analytics",
            "AI time tracking",
            "scope creep detection",
            "freelancer tools",
            "Upwork fee calculator",
            "freelance profitability",
            "hidden cost calculator",
            "unbilled time calculator",
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
  const language = isKo ? "ko-KR" : "en-US";
  const dateModified = "2026-06-08";
  const publicDecisionLinks = [
    `${siteUrl}/${locale}/calculator`,
    `${siteUrl}/${locale}/features`,
    `${siteUrl}/${locale}/contact`,
    `${siteUrl}/${locale}/privacy`,
    `${siteUrl}/${locale}/terms`,
  ];

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

  const workflowSteps = isKo
    ? [
        {
          name: "계약 금액과 목표 시간 입력",
          text: "프로젝트 수입, 예상 작업 시간, 플랫폼 수수료와 세금률을 입력해 견적의 기준선을 만듭니다.",
        },
        {
          name: "비청구 시간과 숨은 비용 반영",
          text: "미팅, 메시지, 수정, 리서치, 도구 구독료처럼 실제 수익을 낮추는 요소를 함께 계산합니다.",
        },
        {
          name: "실제 시급과 최소 단가 확인",
          text: "순수입을 실제 투입 시간으로 나눈 실제 시급을 확인하고 다음 견적의 최소 수주 단가를 정합니다.",
        },
        {
          name: "진행 중 시간 기록과 스코프 크립 점검",
          text: "자연어로 시간을 기록하며 예상 대비 진행률, 수정 비중, 수익성 변화를 확인합니다.",
        },
      ]
    : [
        {
          name: "Enter project fee and target hours",
          text: "Add the project revenue, expected work hours, platform fee, and tax rate to set a pricing baseline.",
        },
        {
          name: "Include unbilled time and hidden costs",
          text: "Account for meetings, messages, revisions, research, and tool subscriptions that reduce real profit.",
        },
        {
          name: "Review real hourly rate and minimum rate",
          text: "Divide net revenue by real working time to find your real hourly rate and minimum sustainable quote.",
        },
        {
          name: "Track delivery and watch scope creep",
          text: "Log time in natural language and monitor progress, revision load, and profitability while the project is active.",
        },
      ];

  const routeItems = isKo
    ? [
        {
          name: "견적 전 실제 시급 기준선 계산",
          url: `${siteUrl}/${locale}/calculator`,
          description:
            "계약 금액, 수수료, 세금, 비청구 시간을 넣어 실제 시급과 최소 수주 단가를 먼저 확인합니다.",
        },
        {
          name: "시간 기록·스코프 크립 대응 흐름 확인",
          url: `${siteUrl}/${locale}/features`,
          description:
            "자연어 시간 기록, 수익성 대시보드, 스코프 크립 알림, 클라이언트 리포트 흐름을 비교합니다.",
        },
        {
          name: "도입 전 문의와 파트너십 상담",
          url: `${siteUrl}/${locale}/contact`,
          description:
            "팀 도입, 기능 제안, 결제·파트너십 질문은 공식 문의 페이지에서 확인합니다.",
        },
        {
          name: "데이터 처리와 이용 조건 확인",
          url: `${siteUrl}/${locale}/privacy`,
          description:
            "개인정보, 데이터 보관, 권리, 서비스 이용 조건은 추측하지 말고 개인정보처리방침과 약관에서 확인합니다.",
        },
        {
          name: "책임 범위와 구독 조건 확인",
          url: `${siteUrl}/${locale}/terms`,
          description:
            "환불, 구독, 서비스 제한, 면책처럼 계약 조건이 필요한 답변은 이용약관을 우선 확인합니다.",
        },
      ]
    : [
        {
          name: "Estimate a real-rate baseline before quoting",
          url: `${siteUrl}/${locale}/calculator`,
          description:
            "Enter project fee, platform fees, taxes, and unbilled work to check real hourly rate and minimum quote.",
        },
        {
          name: "Review the time logging and scope-creep workflow",
          url: `${siteUrl}/${locale}/features`,
          description:
            "Compare natural-language time logs, profitability dashboards, scope creep alerts, and client reports.",
        },
        {
          name: "Ask adoption, billing, or partnership questions",
          url: `${siteUrl}/${locale}/contact`,
          description:
            "Use the official contact page for team adoption, feature suggestions, billing, or partnership questions.",
        },
        {
          name: "Check data handling and service terms",
          url: `${siteUrl}/${locale}/privacy`,
          description:
            "Use the privacy policy and terms pages for data handling, retention, rights, and contractual details instead of guessing.",
        },
        {
          name: "Check responsibility boundaries and subscription terms",
          url: `${siteUrl}/${locale}/terms`,
          description:
            "Use the terms page for refund, subscription, service-limit, liability, or contractual-condition answers.",
        },
      ];

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: isKo
        ? "RealHourly 프리랜서 실제 시급 계산 및 수익성 분석"
        : "RealHourly freelancer real-rate and profitability analytics",
      description: isKo
        ? "프리랜서가 견적 전후에 실제 시급, 숨겨진 비용, 비청구 시간, 스코프 크립 위험을 한 번에 판단하도록 돕는 랜딩 페이지입니다."
        : "Landing page for freelancers who need to judge real hourly rate, hidden costs, unbilled time, and scope creep risk before and during projects.",
      url: `${siteUrl}/${locale}`,
      inLanguage: language,
      dateModified,
      significantLink: publicDecisionLinks,
      isPartOf: {
        "@type": "WebSite",
        name: "RealHourly",
        url: siteUrl,
      },
      about: isKo
        ? [
            "프리랜서 실제 시급 계산",
            "고정가 프로젝트 수익성 분석",
            "비청구 시간과 숨겨진 비용",
            "스코프 크립 대응",
          ]
        : [
            "freelancer real hourly rate calculation",
            "fixed-fee project profitability analysis",
            "unbilled time and hidden costs",
            "scope creep response",
          ],
      primaryEntity: {
        "@type": "SoftwareApplication",
        name: "RealHourly",
        applicationCategory: "BusinessApplication",
        url: siteUrl,
      },
      potentialAction: {
        "@type": "UseAction",
        name: isKo
          ? "무료 실제 시급 계산기 사용"
          : "Use the free real hourly rate calculator",
        target: `${siteUrl}/${locale}/calculator`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "RealHourly",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: siteUrl,
      inLanguage: language,
      isAccessibleForFree: true,
      applicationSubCategory: isKo
        ? "프리랜서 단가·수익성 의사결정 도구"
        : "Freelance pricing and profitability decision support",
      dateModified,
      description: isKo
        ? "AI 기반 프리랜서 수익 분석 대시보드. 숨겨진 비용을 차감한 실제 시급을 계산합니다."
        : "AI-powered freelancer revenue analytics dashboard. Calculate your real hourly rate after hidden costs.",
      publisher: {
        "@type": "Organization",
        name: "RealHourly",
        url: siteUrl,
      },
      audience: {
        "@type": "Audience",
        audienceType: isKo
          ? "프리랜서, 1인 사업자, 독립 컨설턴트, 에이전시 운영자"
          : "Freelancers, solo operators, independent consultants, and agency owners",
      },
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
      "@type": "HowTo",
      name: isKo
        ? "프리랜서 프로젝트의 실제 시급을 확인하는 방법"
        : "How to find the real hourly rate of a freelance project",
      description: isKo
        ? "RealHourly로 견적 전후의 수수료, 세금, 비청구 시간, 스코프 크립 위험을 점검하는 4단계 흐름입니다."
        : "A four-step workflow for checking fees, taxes, unbilled time, and scope creep risk with RealHourly.",
      totalTime: "PT3M",
      inLanguage: language,
      dateModified,
      tool: [
        {
          "@type": "HowToTool",
          name: "RealHourly",
        },
      ],
      step: workflowSteps.map((step, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        ...step,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: isKo
        ? "RealHourly 상황별 공개 페이지 안내"
        : "RealHourly public page routing by intent",
      description: isKo
        ? "견적 전 계산, 기능 비교, 도입 문의처럼 프리랜서의 의도에 맞는 공개 페이지를 안내합니다."
        : "Guides freelancers to the right public page for pre-quote calculation, feature comparison, or adoption questions.",
      numberOfItems: routeItems.length,
      dateModified,
      itemListElement: routeItems.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        ...item,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: language,
      dateModified,
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
      areaServed: "Worldwide",
      availableLanguage: ["Korean", "English"],
      dateModified,
      contactPoint: {
        "@type": "ContactPoint",
        email: "support@real-hourly.com",
        contactType: "customer support",
        availableLanguage: ["Korean", "English"],
      },
      knowsAbout: isKo
        ? [
            "프리랜서 실제 시급 계산",
            "프로젝트 수익성 분석",
            "비청구 시간 추적",
            "스코프 크립 감지",
            "프리랜서 견적 기준선",
          ]
        : [
            "freelancer real hourly rate calculation",
            "project profitability analysis",
            "unbilled time tracking",
            "scope creep detection",
            "freelance pricing baselines",
          ],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "RealHourly",
      url: siteUrl,
      inLanguage: ["ko-KR", "en-US"],
      dateModified,
      significantLink: publicDecisionLinks,
      about: isKo
        ? [
            "프리랜서 실제 시급 계산",
            "고정가 프로젝트 수익성 판단",
            "비청구 시간과 숨겨진 비용 반영",
            "스코프 크립 대응",
          ]
        : [
            "freelancer real hourly rate calculation",
            "fixed-fee project profitability checks",
            "unbilled time and hidden cost accounting",
            "scope creep response",
          ],
      potentialAction: {
        "@type": "UseAction",
        name: isKo
          ? "무료 실제 시급 계산기 사용"
          : "Use the free real hourly rate calculator",
        target: `${siteUrl}/${locale}/calculator`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "RealHourly",
          item: `${siteUrl}/${locale}`,
        },
      ],
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
