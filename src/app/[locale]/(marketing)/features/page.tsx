import { setRequestLocale } from "next-intl/server";
import { getAlternates, getOpenGraph, getTwitter } from "@/lib/seo/metadata";
import { PublicGuideContent } from "@/components/landing/PublicGuideContent";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const isKo = locale === "ko";

  const title = isKo
    ? "RealHourly 기능 가이드 - AI 시간 기록·실제 시급·수익성 분석"
    : "RealHourly Features - AI Time Tracking, Real Rates & Profitability";
  const description = isKo
    ? "AI 시간 기록, 실제 시급 계산, 스코프 크립 감지, 인보이스 생성까지 RealHourly의 핵심 기능을 자세히 알아보세요. 프리랜서 수익 관리를 위한 올인원 도구입니다."
    : "Explore RealHourly's key features: AI time tracking, real hourly rate calculation, scope creep detection, invoicing, and more. All-in-one tool for freelancer revenue management.";

  return {
    title,
    description,
    keywords: isKo
      ? [
          "프리랜서 도구",
          "NLP 시간 기록",
          "실제 시급 계산기",
          "스코프 크립 감지",
          "프리랜서 수익 관리",
          "AI 시간 추적",
          "프리랜서 인보이스",
        ]
      : [
          "freelancer tools",
          "NLP time logging",
          "real hourly rate calculator",
          "scope creep detection",
          "freelancer revenue management",
          "AI time tracking",
          "freelancer invoice",
        ],
    robots: { index: true, follow: true, "max-image-preview": "large" as const, "max-snippet": -1 },
    alternates: getAlternates(locale, "/features"),
    openGraph: getOpenGraph(locale, "/features", title, description),
    twitter: getTwitter(title, description),
  };
}

function buildJsonLd(locale: string) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.real-hourly.com";
  const isKo = locale === "ko";
  const featureIds = [
    "nlp-time-log",
    "real-rate",
    "scope-creep",
    "dashboard",
    "analytics",
    "timesheets",
    "invoice-report",
  ];
  const featureItems = (isKo
    ? [
        ["AI 타임로그", "한국어·영어 자연어 입력을 프로젝트, 카테고리, 시간으로 자동 분류합니다."],
        ["실제 시급 계산", "플랫폼 수수료, 세금, 툴 구독료, 비청구 시간을 반영한 진짜 시급을 보여줍니다."],
        ["스코프 크립 경고", "시간 초과와 수정 요청 증가를 감지하고 추가 청구 메시지를 준비합니다."],
        ["대시보드 & KPI", "총 수입, 작업 시간, 평균 실제 시급, 진행 프로젝트를 한 화면에서 확인합니다."],
        ["비교 분석", "프로젝트별 시급 랭킹과 카테고리별 시간 분배로 수익성 높은 일을 찾습니다."],
        ["타임시트 승인", "주간 타임시트를 매직 링크로 공유하고 승인된 기록을 잠급니다."],
        ["인보이스 & 리포트", "작업 기록 기반 인보이스와 공유 가능한 클라이언트 리포트를 생성합니다."],
      ]
    : [
        ["AI Time Logging", "Turns Korean or English natural-language entries into project, category, and duration data."],
        ["Real Hourly Rate", "Shows the true rate after platform fees, taxes, tool subscriptions, and unbilled work."],
        ["Scope Creep Alerts", "Detects time overruns and revision growth, then prepares additional-billing messages."],
        ["Dashboard & KPIs", "Summarizes revenue, work hours, average real rate, and active projects in one view."],
        ["Comparative Analytics", "Ranks project rates and time distribution so freelancers can find profitable work."],
        ["Timesheet Approval", "Shares weekly timesheets by magic link and locks approved entries."],
        ["Invoices & Reports", "Creates invoice drafts and client-shareable reports from time logs."],
      ]).map(([name, description], index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "SoftwareApplication",
          name,
          applicationCategory: "BusinessApplication",
          description,
          url: `${siteUrl}/${locale}/features#${featureIds[index]}`,
        },
      }));

  const featureFaqs = isKo
    ? [
        {
          question: "RealHourly는 일반 시간 추적기와 무엇이 다른가요?",
          answer:
            "RealHourly는 시간을 기록하는 데서 끝나지 않고 플랫폼 수수료, 세금, 도구 비용, 비청구 시간을 반영해 프로젝트의 실제 시급과 수익성을 보여줍니다.",
        },
        {
          question: "스코프 크립 감지는 어떤 상황에 유용한가요?",
          answer:
            "수정 요청이 늘어나거나 예상 시간 대비 사용률이 빠르게 올라갈 때 유용합니다. RealHourly는 추가 청구나 범위 조정을 논의할 수 있도록 신호와 메시지 초안을 제공합니다.",
        },
        {
          question: "AI 시간 기록은 한국어 입력도 지원하나요?",
          answer:
            "네. 한국어와 영어 자연어 메모를 프로젝트, 작업 카테고리, 시간 기록으로 정리할 수 있어 프리랜서가 작업 중단 없이 기록을 남기기 쉽습니다.",
        },
      ]
    : [
        {
          question: "How is RealHourly different from a regular time tracker?",
          answer:
            "RealHourly goes beyond recording hours. It combines platform fees, taxes, tool costs, and unbilled work to show the real hourly rate and profitability of each project.",
        },
        {
          question: "When are scope creep alerts useful?",
          answer:
            "They are useful when revisions increase or time usage rises faster than planned. RealHourly surfaces signals and message drafts so freelancers can discuss extra billing or scope adjustments earlier.",
        },
        {
          question: "Does AI time logging support Korean entries?",
          answer:
            "Yes. RealHourly can organize Korean and English natural-language notes into project, work category, and duration records so freelancers can keep logging without interrupting delivery.",
        },
      ];

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: isKo
        ? "RealHourly 기능 가이드"
        : "RealHourly Features Guide",
      description: isKo
        ? "프리랜서를 위한 AI 수익 분석 도구의 7가지 핵심 기능"
        : "7 key features of AI revenue analytics tool for freelancers",
      url: `${siteUrl}/${locale}/features`,
      isPartOf: {
        "@type": "WebSite",
        name: "RealHourly",
        url: siteUrl,
      },
      about: featureItems.map(({ item }) => item),
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: isKo ? "RealHourly 핵심 기능 목록" : "RealHourly core feature list",
      description: isKo
        ? "RealHourly가 프리랜서 수익 관리를 돕는 7가지 기능 요약"
        : "Seven RealHourly features that support freelancer revenue management",
      url: `${siteUrl}/${locale}/features`,
      numberOfItems: featureItems.length,
      itemListElement: featureItems,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: featureFaqs.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${siteUrl}/${locale}`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: isKo ? "기능 가이드" : "Features",
          item: `${siteUrl}/${locale}/features`,
        },
      ],
    },
  ];
}

export default async function FeaturesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
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
      <LandingNav />
      <div className="pt-20">
        <PublicGuideContent />
      </div>
      <LandingFooter />
    </>
  );
}
