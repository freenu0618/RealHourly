"use client";

import {
  Clock,
  TrendingUp,
  AlertTriangle,
  LayoutDashboard,
  BarChart3,
  ClipboardCheck,
  FileText,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { FadeIn } from "@/components/ui/fade-in";
import { GuideSection } from "./GuideSection";
import { GuideNav } from "./GuideNav";

const SECTION_CONFIGS = [
  { id: "nlp-time-log", icon: Clock, iconColor: "text-orange-600 dark:text-orange-400", iconBg: "bg-orange-100 dark:bg-orange-900/30", ctaHref: "/time-log" },
  { id: "real-rate", icon: TrendingUp, iconColor: "text-blue-600 dark:text-blue-400", iconBg: "bg-blue-100 dark:bg-blue-900/30", ctaHref: "/projects" },
  { id: "scope-creep", icon: AlertTriangle, iconColor: "text-red-600 dark:text-red-400", iconBg: "bg-red-100 dark:bg-red-900/30", ctaHref: "/projects" },
  { id: "dashboard", icon: LayoutDashboard, iconColor: "text-purple-600 dark:text-purple-400", iconBg: "bg-purple-100 dark:bg-purple-900/30", ctaHref: "/dashboard" },
  { id: "analytics", icon: BarChart3, iconColor: "text-cyan-600 dark:text-cyan-400", iconBg: "bg-cyan-100 dark:bg-cyan-900/30", ctaHref: "/analytics" },
  { id: "timesheets", icon: ClipboardCheck, iconColor: "text-emerald-600 dark:text-emerald-400", iconBg: "bg-emerald-100 dark:bg-emerald-900/30", ctaHref: "/timesheets", isPro: true },
  { id: "invoice-report", icon: FileText, iconColor: "text-pink-600 dark:text-pink-400", iconBg: "bg-pink-100 dark:bg-pink-900/30", ctaHref: "/projects", isPro: true },
];

export function GuideClient() {
  const t = useTranslations("guide");

  const navSections = SECTION_CONFIGS.map((cfg) => ({
    id: cfg.id,
    label: t(`sections.${cfg.id}.title`),
  }));

  return (
    <div className="relative">
      {/* Header */}
      <FadeIn>
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{t("title")}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{t("subtitle")}</p>
        </div>
      </FadeIn>

      {/* Layout: Nav + Content */}
      <div className="flex gap-10">
        {/* Sidebar nav (desktop) */}
        <div className="hidden w-48 shrink-0 lg:block">
          <GuideNav sections={navSections} />
        </div>

        {/* Sections */}
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
                ctaHref={cfg.ctaHref}
                isPro={cfg.isPro}
                proLabel={t("proBadge")}
                index={idx}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
