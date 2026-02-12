"use client";

import { useTranslations } from "next-intl";
import { NumberTicker } from "@/components/ui/number-ticker";
import { FadeIn } from "@/components/ui/fade-in";

export function CountUpSection() {
  const t = useTranslations("landing");

  const stats = [
    { icon: "⚡", value: 2, suffix: t("statMinSuffix"), labelKey: "stat1Label", delay: 0 },
    { icon: "🎯", value: 100, suffix: "%", labelKey: "stat2Label", delay: 0.1 },
    { icon: "⏱", value: 5, suffix: t("statSecSuffix"), labelKey: "stat3Label", delay: 0.2 },
    { icon: "🌍", value: 2, suffix: t("statLangSuffix"), labelKey: "stat4Label", delay: 0.3 },
  ] as const;

  return (
    <section className="bg-card/50 px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <FadeIn>
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 text-center md:grid-cols-4">
            {stats.map((item, i) => (
              <div key={i} className="flex flex-col items-center space-y-2">
                <div className="text-4xl">{item.icon}</div>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-foreground md:text-4xl">
                    <NumberTicker value={item.value} delay={item.delay} />
                  </span>
                  <span className="ml-1 text-2xl font-bold text-foreground/80 md:text-3xl">
                    {item.suffix}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground md:text-base">
                  {t(item.labelKey)}
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
