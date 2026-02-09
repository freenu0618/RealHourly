"use client";

import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/money/currency";
import type { ComparisonInsight } from "@/db/queries/analytics";

const INSIGHT_EMOJI: Record<ComparisonInsight["type"], string> = {
  best_rate: "🥇",
  worst_rate: "🥉",
  most_hours: "⏰",
  highest_revision: "🔄",
};

interface Props {
  insights: ComparisonInsight[];
  avgRealHourly: number | null;
  totalRevenue: number;
  totalHours: number;
  currency: string;
}

export function InsightCards({
  insights,
  avgRealHourly,
  totalRevenue,
  totalHours,
  currency,
}: Props) {
  const t = useTranslations("analytics");

  function getLabel(insight: ComparisonInsight): { title: string; desc: string } {
    switch (insight.type) {
      case "best_rate":
        return {
          title: t("bestRate"),
          desc: t("bestRateDesc", {
            name: insight.projectName,
            value: formatCurrency(insight.value, currency),
          }),
        };
      case "worst_rate":
        return {
          title: t("worstRate"),
          desc: t("worstRateDesc", {
            name: insight.projectName,
            value: formatCurrency(insight.value, currency),
          }),
        };
      case "most_hours":
        return {
          title: t("mostHours"),
          desc: t("mostHoursDesc", {
            name: insight.projectName,
            value: String(insight.value),
          }),
        };
      case "highest_revision":
        return {
          title: t("highestRevision"),
          desc: t("highestRevisionDesc", {
            name: insight.projectName,
            value: String(insight.value),
          }),
        };
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        {"💡"} {t("insights")}
      </h2>

      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-[16px] border border-border/50 bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground">{t("avgRate")}</p>
          <p className="mt-1 text-lg font-bold text-primary">
            {avgRealHourly !== null
              ? formatCurrency(avgRealHourly, currency)
              : "-"}
          </p>
        </div>
        <div className="rounded-[16px] border border-border/50 bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground">{t("net")}</p>
          <p
            className={`mt-1 text-lg font-bold ${totalRevenue < 0 ? "text-destructive" : ""}`}
          >
            {formatCurrency(totalRevenue, currency)}
          </p>
        </div>
        <div className="rounded-[16px] border border-border/50 bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground">{t("totalHours")}</p>
          <p className="mt-1 text-lg font-bold">{totalHours}h</p>
        </div>
      </div>

      {/* Insight chips */}
      <div className="grid gap-3 sm:grid-cols-2">
        {insights.map((insight) => {
          const { title, desc } = getLabel(insight);
          return (
            <div
              key={insight.type}
              className="flex items-start gap-3 rounded-[16px] border border-border/50 bg-card p-4"
            >
              <span className="text-2xl">
                {INSIGHT_EMOJI[insight.type]}
              </span>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
