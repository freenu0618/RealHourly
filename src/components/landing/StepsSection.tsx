"use client";

import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

export function StepsSection() {
  const t = useTranslations("landing");

  const steps = [
    { step: 1, timeKey: "step1Time", titleKey: "step1Title", descKey: "step1Desc", icon: "\uD83D\uDCCB" },
    { step: 2, timeKey: "step2Time", titleKey: "step2Title", descKey: "step2Desc", icon: "\u270D\uFE0F" },
    { step: 3, timeKey: "step3Time", titleKey: "step3Title", descKey: "step3Desc", icon: "\uD83D\uDCB0" },
  ] as const;

  return (
    <section id="how-it-works" className="bg-card/30 px-6 py-24" data-animate>
      <h2 className="mb-16 text-center text-3xl font-bold">
        {t("stepsTitle")}
      </h2>

      <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
        {steps.map((item, i) => (
          <div key={item.step} className="relative">
            {/* Connector arrow (hidden on mobile, visible on md+) */}
            {i < steps.length - 1 && (
              <div className="absolute -right-5 top-3 z-10 hidden md:block">
                <ArrowRight className="size-5 text-primary/40" />
              </div>
            )}

            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {item.step}
              </div>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                {"\u23F1"} {t(item.timeKey)}
              </span>
            </div>

            <div className="rounded-[20px] border border-border/50 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md">
              <div className="mb-3 text-2xl">{item.icon}</div>
              <h3 className="mb-2 font-bold">{t(item.titleKey)}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t(item.descKey)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          {t("stepsTotalTime")}
        </span>
      </div>
    </section>
  );
}
