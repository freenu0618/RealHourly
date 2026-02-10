"use client";

import { type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  RateComparisonMockup,
  TimeLogMockup,
  AlertMockup,
  DashboardMockup,
} from "./FeatureMockups";

function FeatureBlock({
  badge,
  title,
  description,
  visual,
  reverse,
}: {
  badge: string;
  title: string;
  description: string;
  visual: ReactNode;
  reverse: boolean;
}) {
  return (
    <div
      className={cn(
        "mb-20 grid items-center gap-12 md:grid-cols-2",
        reverse && "md:[direction:rtl] md:[&>*]:[direction:ltr]",
      )}
      data-animate
    >
      <div>
        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
          {badge}
        </span>
        <h3 className="mb-4 mt-4 text-xl font-bold md:text-2xl">{title}</h3>
        <p className="leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <div className="rounded-[20px] border bg-card p-6 shadow-sm">{visual}</div>
    </div>
  );
}

export function FeatureSection() {
  const t = useTranslations("landing");

  return (
    <section id="features" className="bg-card/50 px-6 py-20" data-animate>
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-16 text-center text-2xl font-bold md:text-3xl">
          {t("featuresTitle")}
        </h2>

        <FeatureBlock
          badge={t("feature1Badge")}
          title={t("feature1Title")}
          description={t("feature1Desc")}
          visual={<RateComparisonMockup />}
          reverse={false}
        />
        <FeatureBlock
          badge={t("feature2Badge")}
          title={t("feature2Title")}
          description={t("feature2Desc")}
          visual={<TimeLogMockup />}
          reverse={true}
        />
        <FeatureBlock
          badge={t("feature3Badge")}
          title={t("feature3Title")}
          description={t("feature3Desc")}
          visual={<AlertMockup />}
          reverse={false}
        />
        <FeatureBlock
          badge={t("feature4Badge")}
          title={t("feature4Title")}
          description={t("feature4Desc")}
          visual={<DashboardMockup />}
          reverse={true}
        />
      </div>
    </section>
  );
}
