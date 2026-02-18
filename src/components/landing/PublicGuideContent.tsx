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
} from "lucide-react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("guide");
  const tf = useTranslations("featuresPage");

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
