"use client";

import {
  Clock,
  TrendingUp,
  AlertTriangle,
  LayoutDashboard,
  BarChart3,
  ClipboardCheck,
  FileText,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FadeIn } from "@/components/ui/fade-in";
import { GuideSection } from "@/components/guide/GuideSection";
import { GuideNav } from "@/components/guide/GuideNav";
import { ShimmerButton } from "@/components/ui/shimmer-button";

/**
 * PublicGuideContent
 *
 * @description Public (no-auth) feature guide for the RealHourly marketing site.
 * Reuses `guide.*` i18n section content but routes all CTAs to `/login`
 * instead of dashboard pages. Displays a hero header and a bottom CTA.
 *
 * @example
 * <PublicGuideContent />
 */

const QUICK_ANSWER = {
  ko: {
    eyebrow: "빠른 판단 가이드",
    title: "RealHourly는 어떤 프리랜서에게 가장 맞나요?",
    description:
      "단순 출퇴근 기록보다 견적·수익성·스코프 크립 판단이 중요한 고정가·혼합형 프로젝트에 최적화되어 있습니다.",
    cards: [
      {
        icon: CheckCircle2,
        title: "추천 상황",
        body: "고정가 프로젝트, 플랫폼 계약, 반복 수정이 많은 작업, 미팅·메시지처럼 비청구 시간이 큰 프리랜서에게 유용합니다.",
      },
      {
        icon: HelpCircle,
        title: "해결하는 질문",
        body: "이 견적이 손해인지, 실제 시급이 목표 시급보다 높은지, 추가 수정 요청을 언제 논의해야 하는지 확인합니다.",
      },
      {
        icon: ShieldAlert,
        title: "주의할 점",
        body: "세무·회계·법률 판단을 대신하지 않습니다. RealHourly는 계약 전후 의사결정을 돕는 수익성 추정 도구입니다.",
      },
      {
        icon: HelpCircle,
        title: "맞지 않는 경우",
        body: "출퇴근 관리, 직원 급여, 세금 신고 자동화가 목적이라면 전용 회계·노무 도구나 전문가 검토가 더 적합합니다.",
      },
    ],
  },
  en: {
    eyebrow: "Quick decision guide",
    title: "Who is RealHourly best for?",
    description:
      "RealHourly is optimized for fixed-fee and blended freelance work where pricing, profitability, and scope creep matter more than simple clock-in tracking.",
    cards: [
      {
        icon: CheckCircle2,
        title: "Best-fit situations",
        body: "Useful for fixed-fee projects, platform contracts, revision-heavy work, and freelancers with meaningful unbilled meetings or client messages.",
      },
      {
        icon: HelpCircle,
        title: "Questions it answers",
        body: "Check whether a quote is profitable, whether the real rate clears your target rate, and when extra revision requests should trigger a scope conversation.",
      },
      {
        icon: ShieldAlert,
        title: "Important caveat",
        body: "It does not replace tax, accounting, or legal advice. RealHourly is a profitability estimate and decision-support workflow.",
      },
      {
        icon: HelpCircle,
        title: "Not the best fit",
        body: "If you need payroll, employee attendance, or tax filing automation, use a dedicated accounting or labor-compliance workflow instead.",
      },
    ],
  },
} as const;

const SECTION_CONFIGS = [
  {
    id: "nlp-time-log",
    icon: Clock,
    iconColor: "text-orange-600 dark:text-orange-400",
    iconBg: "bg-orange-100 dark:bg-orange-900/30",
  },
  {
    id: "real-rate",
    icon: TrendingUp,
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    id: "scope-creep",
    icon: AlertTriangle,
    iconColor: "text-red-600 dark:text-red-400",
    iconBg: "bg-red-100 dark:bg-red-900/30",
  },
  {
    id: "dashboard",
    icon: LayoutDashboard,
    iconColor: "text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-100 dark:bg-purple-900/30",
  },
  {
    id: "analytics",
    icon: BarChart3,
    iconColor: "text-cyan-600 dark:text-cyan-400",
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30",
  },
  {
    id: "timesheets",
    icon: ClipboardCheck,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    isPro: true,
  },
  {
    id: "invoice-report",
    icon: FileText,
    iconColor: "text-pink-600 dark:text-pink-400",
    iconBg: "bg-pink-100 dark:bg-pink-900/30",
    isPro: true,
  },
] as const;

export function PublicGuideContent() {
  const locale = useLocale();
  const t = useTranslations("guide");
  const tf = useTranslations("featuresPage");
  const quickAnswer = locale === "ko" ? QUICK_ANSWER.ko : QUICK_ANSWER.en;

  const navSections = SECTION_CONFIGS.map((cfg) => ({
    id: cfg.id,
    label: t(`sections.${cfg.id}.title`),
  }));

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      {/* Hero header */}
      <FadeIn>
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {tf("title")}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            {tf("subtitle")}
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/login">
              <ShimmerButton
                background="rgba(43, 107, 147, 1)"
                className="px-6 py-2.5 text-sm font-semibold"
              >
                {tf("ctaLabel")}
                <ArrowRight className="ml-2 size-4" />
              </ShimmerButton>
            </Link>
            <p className="text-xs text-muted-foreground">{tf("ctaSub")}</p>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <section
          aria-labelledby="features-answer-title"
          className="mb-10 rounded-2xl border border-border/70 bg-muted/30 p-5 shadow-sm md:p-6"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {quickAnswer.eyebrow}
          </p>
          <h2 id="features-answer-title" className="mt-2 text-2xl font-bold tracking-tight">
            {quickAnswer.title}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            {quickAnswer.description}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickAnswer.cards.map((card) => {
              const Icon = card.icon;
              return (
                <article key={card.title} className="rounded-xl border border-border/60 bg-background p-4">
                  <div className="mb-3 flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="size-4" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold tracking-tight">{card.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.body}</p>
                </article>
              );
            })}
          </div>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <Link href="/calculator" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
              {locale === "ko" ? "실제 시급 계산해보기" : "Try the real-rate calculator"}
              <ArrowRight className="size-3.5" />
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground hover:underline">
              {locale === "ko" ? "도입 전 질문하기" : "Ask a pre-adoption question"}
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </section>
      </FadeIn>

      {/* Nav + Sections */}
      <div className="flex gap-10">
        {/* Sidebar nav (desktop only) */}
        <div className="hidden w-48 shrink-0 lg:block">
          <GuideNav sections={navSections} />
        </div>

        {/* Feature sections */}
        <div className="flex-1 space-y-6">
          {SECTION_CONFIGS.map((cfg, idx) => {
            const stepsRaw = t.raw(`sections.${cfg.id}.steps`) as string[];
            return (
              <GuideSection
                key={cfg.id}
                id={cfg.id}
                icon={cfg.icon}
                iconColor={cfg.iconColor}
                iconBg={cfg.iconBg}
                title={t(`sections.${cfg.id}.title`)}
                description={t(`sections.${cfg.id}.description`)}
                value={t(`sections.${cfg.id}.value`)}
                steps={stepsRaw}
                ctaLabel={t(`sections.${cfg.id}.cta`)}
                ctaHref="/login"
                isPro={"isPro" in cfg ? cfg.isPro : undefined}
                proLabel={t("proBadge")}
                index={idx}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      <FadeIn delay={0.2}>
        <div className="mt-16 rounded-2xl border border-border/60 bg-card px-8 py-12 text-center shadow-sm">
          <h2 className="text-2xl font-bold tracking-tight">{tf("bottomTitle")}</h2>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            {tf("bottomDesc")}
          </p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <Link href="/login">
              <ShimmerButton
                background="rgba(43, 107, 147, 1)"
                className="px-8 py-3 text-sm font-semibold"
              >
                {tf("ctaLabel")}
                <ArrowRight className="ml-2 size-4" />
              </ShimmerButton>
            </Link>
            <Link
              href="/calculator"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {tf("tryCalculator")}
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
