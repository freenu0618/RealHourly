"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/money/currency";
import { useCountUp } from "@/lib/hooks/use-count-up";
import type { DashboardMetrics } from "./types";

interface DashboardKPICardsProps {
  metrics: DashboardMetrics;
  t: (key: string, values?: Record<string, string>) => string;
}

export function DashboardKPICards({ metrics, t }: DashboardKPICardsProps) {
  const animatedRevenue = useCountUp(metrics.totalRevenue, 1000);
  const animatedNet = useCountUp(metrics.totalNet, 1000);
  const animatedRate = useCountUp(metrics.avgRealRate, 1000);

  const cards = [
    {
      emoji: "\uD83D\uDCB0",
      label: t("totalRevenue"),
      value: formatCurrency(Math.round(animatedRevenue), metrics.currency),
    },
    {
      emoji: "\uD83D\uDCCA",
      label: t("kpiNetRevenue"),
      value: formatCurrency(Math.round(animatedNet), metrics.currency),
      highlight: metrics.totalNet < 0,
    },
    {
      emoji: "\u23F0",
      label: t("totalHours"),
      value: `${metrics.totalHours}h`,
    },
    {
      emoji: "\uD83D\uDCB8",
      label: t("avgHourlyRate"),
      value: metrics.avgRealRate !== null
        ? formatCurrency(Math.round(animatedRate * 100) / 100, metrics.currency)
        : "\u2014",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.label}
          className="rounded-[20px] border-warm-border transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
          <CardContent className="flex items-center gap-4 p-5">
            <span className="text-3xl">{card.emoji}</span>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-muted-foreground">{card.label}</p>
              <p
                className={`text-xl font-bold ${card.highlight ? "text-destructive" : ""}`}
                aria-live="polite"
              >
                {card.value}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
