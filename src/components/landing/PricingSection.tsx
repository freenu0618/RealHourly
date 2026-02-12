"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Check,
  X,
  Sparkles,
  Clock,
  Globe,
  Zap,
  MessageSquare,
  Mic,
  Crown,
  Shield,
  FileText,
  BarChart3,
  Share2,
  CalendarCheck,
} from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { BorderBeam } from "@/components/ui/border-beam";
import { NumberTicker } from "@/components/ui/number-ticker";
import { cn } from "@/lib/utils";

type Interval = "monthly" | "yearly";

export function PricingSection() {
  const t = useTranslations("landing");
  const [interval, setInterval] = useState<Interval>("yearly");

  const monthlyPrice = 9;
  const yearlyMonthly = 7;
  const yearlyTotal = 84;
  const savePercent = Math.round(
    ((monthlyPrice - yearlyMonthly) / monthlyPrice) * 100,
  );

  const freeFeatures = [
    { icon: Sparkles, label: t("pricingFreeF1"), included: true },
    { icon: Clock, label: t("pricingFreeF2"), included: true },
    { icon: Zap, label: t("pricingFreeF3"), included: true },
    { icon: MessageSquare, label: t("pricingFreeF4"), included: true },
    { icon: FileText, label: t("pricingFreeF5"), included: false },
    { icon: Share2, label: t("pricingFreeF6"), included: false },
    { icon: BarChart3, label: t("pricingFreeF7"), included: false },
    { icon: Mic, label: t("pricingFreeF8"), included: false },
  ];

  const proFeatures = [
    { icon: Sparkles, label: t("pricingProF1"), included: true },
    { icon: Clock, label: t("pricingProF2"), included: true },
    { icon: Zap, label: t("pricingProF3"), included: true },
    { icon: MessageSquare, label: t("pricingProF4"), included: true },
    { icon: FileText, label: t("pricingProF5"), included: true },
    { icon: Share2, label: t("pricingProF6"), included: true },
    { icon: BarChart3, label: t("pricingProF7"), included: true },
    { icon: Mic, label: t("pricingProF8"), included: true },
    { icon: CalendarCheck, label: t("pricingProF9"), included: true },
    { icon: Crown, label: t("pricingProF10"), included: true },
  ];

  return (
    <section id="pricing" className="px-6 py-24">
      <FadeIn blur>
        <h2 className="mb-2 text-center text-3xl font-bold md:text-4xl">
          {t("pricingTitle")}
        </h2>
        <p className="mb-8 text-center text-muted-foreground">
          {t("pricingSubtitle")}
        </p>
      </FadeIn>

      {/* Interval Toggle */}
      <FadeIn delay={0.1}>
        <div className="mx-auto mb-12 flex w-fit items-center gap-1 rounded-full bg-muted p-1">
          <button
            type="button"
            onClick={() => setInterval("monthly")}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-medium transition-all",
              interval === "monthly"
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t("pricingMonthly")}
          </button>
          <button
            type="button"
            onClick={() => setInterval("yearly")}
            className={cn(
              "relative rounded-full px-5 py-2 text-sm font-medium transition-all",
              interval === "yearly"
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t("pricingYearly")}
            <span className="ml-1.5 inline-flex rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-bold text-green-600 dark:text-green-400">
              -{savePercent}%
            </span>
          </button>
        </div>
      </FadeIn>

      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        {/* Free Plan */}
        <FadeIn delay={0.15}>
          <div className="flex h-full flex-col rounded-[24px] border bg-card p-8">
            <div className="mb-6">
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                {t("pricingFreeBadge")}
              </span>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-sm text-muted-foreground">
                  {t("pricingForever")}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("pricingFreeDesc")}
              </p>
            </div>

            <Link href="/login">
              <button
                type="button"
                className="w-full rounded-xl border border-border bg-background px-6 py-3 text-sm font-medium transition-colors hover:bg-muted"
              >
                {t("pricingFreeBtn")}
              </button>
            </Link>

            <div className="mt-6 border-t pt-6">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t("pricingIncludes")}
              </p>
              <ul className="space-y-3">
                {freeFeatures.map((f, i) => (
                  <li
                    key={i}
                    className={cn(
                      "flex items-center gap-2.5 text-sm",
                      !f.included && "text-muted-foreground/50",
                    )}
                  >
                    {f.included ? (
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Check className="size-3 text-primary" />
                      </div>
                    ) : (
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted">
                        <X className="size-3 text-muted-foreground/50" />
                      </div>
                    )}
                    <span className={cn(!f.included && "line-through")}>
                      {f.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </FadeIn>

        {/* Pro Plan (Highlighted) */}
        <FadeIn delay={0.2}>
          <div className="relative flex h-full flex-col overflow-hidden rounded-[24px] border-2 border-primary/30 bg-card p-8">
            <BorderBeam size={200} duration={10} />

            <div className="mb-6">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">
                  {t("pricingProBadge")}
                </span>
                <span className="rounded-full bg-orange-500/15 px-2.5 py-0.5 text-[10px] font-bold text-orange-600 dark:text-orange-400">
                  {t("pricingPopular")}
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">
                  $
                  <NumberTicker
                    value={interval === "yearly" ? yearlyMonthly : monthlyPrice}
                  />
                </span>
                <span className="text-sm text-muted-foreground">/mo</span>
                {interval === "yearly" && (
                  <span className="ml-2 text-xs text-muted-foreground line-through">
                    ${monthlyPrice}/mo
                  </span>
                )}
              </div>
              {interval === "yearly" && (
                <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                  {t("pricingYearlySave", {
                    total: yearlyTotal,
                    save: monthlyPrice * 12 - yearlyTotal,
                  })}
                </p>
              )}
              <p className="mt-2 text-sm text-muted-foreground">
                {t("pricingProDesc")}
              </p>
            </div>

            <Link href="/login">
              <ShimmerButton
                shimmerColor="#ffffff"
                background="var(--primary)"
                borderRadius="12px"
                className="w-full py-3 font-medium text-primary-foreground"
              >
                {t("pricingProBtn")}
              </ShimmerButton>
            </Link>

            <div className="mt-6 border-t pt-6">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t("pricingEverything")}
              </p>
              <ul className="space-y-3">
                {proFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Check className="size-3 text-primary" />
                    </div>
                    {f.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Trust signals */}
      <FadeIn delay={0.3}>
        <div className="mx-auto mt-8 flex max-w-md flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Shield className="size-3.5" />
            {t("pricingTrust1")}
          </span>
          <span className="flex items-center gap-1.5">
            <Globe className="size-3.5" />
            {t("pricingTrust2")}
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="size-3.5" />
            {t("pricingTrust3")}
          </span>
        </div>
      </FadeIn>
    </section>
  );
}
