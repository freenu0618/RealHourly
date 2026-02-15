"use client";

import { ArrowRight, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { FadeIn } from "@/components/ui/fade-in";

interface GuideSectionProps {
  id: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  value: string;
  steps: string[];
  ctaLabel: string;
  ctaHref: string;
  isPro?: boolean;
  proLabel?: string;
  index: number;
}

export function GuideSection({
  id,
  icon: Icon,
  iconColor,
  iconBg,
  title,
  description,
  value,
  steps,
  ctaLabel,
  ctaHref,
  isPro,
  proLabel,
  index,
}: GuideSectionProps) {
  return (
    <FadeIn delay={index * 0.05}>
      <section
        id={id}
        className="scroll-mt-20 rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
      >
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", iconBg)}>
            <Icon className={cn("size-5", iconColor)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">{title}</h3>
              {isPro && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  <Crown className="size-3" />
                  {proLabel}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        {/* Value proposition */}
        <div className="mt-4 rounded-xl bg-primary/5 px-4 py-3 dark:bg-primary/10">
          <p className="text-sm font-medium text-primary">{value}</p>
        </div>

        {/* Steps */}
        <div className="mt-4 space-y-2">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                {i + 1}
              </span>
              <p className="text-sm text-muted-foreground">{step}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-5">
          <Button asChild variant="outline" size="sm" className="rounded-xl">
            <Link href={ctaHref}>
              {ctaLabel} <ArrowRight className="ml-1 size-3.5" />
            </Link>
          </Button>
        </div>
      </section>
    </FadeIn>
  );
}
