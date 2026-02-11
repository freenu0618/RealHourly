"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function FeatureSection() {
  const t = useTranslations("landing");

  const features = [
    { icon: "\uD83D\uDCB0", titleKey: "featureGrid1Title", descKey: "featureGrid1Desc", color: "bg-primary/10", hoverBorder: "hover:border-primary/40" },
    { icon: "\u270D\uFE0F", titleKey: "featureGrid2Title", descKey: "featureGrid2Desc", color: "bg-accent", hoverBorder: "hover:border-accent-foreground/30" },
    { icon: "\uD83D\uDCA1", titleKey: "featureGrid3Title", descKey: "featureGrid3Desc", color: "bg-destructive/10", hoverBorder: "hover:border-destructive/30" },
    { icon: "\uD83D\uDCCA", titleKey: "featureGrid4Title", descKey: "featureGrid4Desc", color: "bg-chart-2/20", hoverBorder: "hover:border-chart-2/40" },
  ] as const;

  return (
    <section id="features" className="px-6 py-24" data-animate>
      <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
        {t("featureGridTitle")}
      </h2>
      <p className="mb-16 text-center text-muted-foreground">
        {t("featureGridSubtitle")}
      </p>

      <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((item, i) => (
          <div
            key={i}
            className={cn(
              "group rounded-[20px] border border-border/50 bg-card p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg",
              item.hoverBorder,
            )}
            data-animate
          >
            <div
              className={cn(
                "mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-md",
                item.color,
              )}
            >
              {item.icon}
            </div>
            <h3 className="mb-2 font-bold transition-colors group-hover:text-primary">{t(item.titleKey)}</h3>
            <p className="text-sm text-muted-foreground">{t(item.descKey)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
