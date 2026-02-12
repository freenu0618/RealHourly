"use client";

import { useRouter } from "@/i18n/navigation";
import { CardContent } from "@/components/ui/card";
import { NumberTicker } from "@/components/ui/number-ticker";
import { MagicCard } from "@/components/ui/magic-card";
import { FadeIn } from "@/components/ui/fade-in";
import { formatCurrency } from "@/lib/money/currency";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { DashboardMetrics } from "./types";

interface DashboardKPICardsProps {
  metrics: DashboardMetrics;
  t: (key: string, values?: Record<string, string>) => string;
}

export function DashboardKPICards({ metrics, t }: DashboardKPICardsProps) {
  const router = useRouter();

  const cards = [
    {
      emoji: "\uD83D\uDCB0",
      label: t("totalRevenue"),
      rawValue: Math.round(metrics.totalRevenue),
      format: (v: number) => formatCurrency(v, metrics.currency),
      href: "/analytics" as const,
      highlight: false,
    },
    {
      emoji: "\uD83D\uDCCA",
      label: t("kpiNetRevenue"),
      rawValue: Math.round(metrics.totalNet),
      format: (v: number) => formatCurrency(v, metrics.currency),
      href: "/analytics" as const,
      highlight: metrics.totalNet < 0,
    },
    {
      emoji: "\u23F0",
      label: t("totalHours"),
      rawValue: metrics.totalHours,
      format: (v: number) => `${v}h`,
      href: "/time-log/history" as const,
      highlight: false,
    },
    {
      emoji: "\uD83D\uDCB8",
      label: t("avgHourlyRate"),
      rawValue: metrics.avgRealRate !== null ? Math.round(metrics.avgRealRate * 100) / 100 : null,
      format: (v: number) => formatCurrency(v, metrics.currency),
      href: "/analytics" as const,
      highlight: false,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <FadeIn key={card.label} delay={index * 0.08}>
          <MagicCard
            className="rounded-[20px] cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg"
            gradientColor="var(--primary)"
            gradientOpacity={0.08}
            gradientSize={180}
          >
            <CardContent
              className="flex items-center gap-4 p-5"
              onClick={() => router.push(card.href)}
            >
              <span className="text-3xl">{card.emoji}</span>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-muted-foreground">
                  {card.label}
                </p>
                <p
                  className={`text-xl font-bold tabular-nums ${card.highlight ? "text-destructive" : ""}`}
                  aria-live="polite"
                >
                  {card.rawValue !== null ? (
                    <KPIValue
                      value={card.rawValue}
                      format={card.format}
                      currency={metrics.currency}
                      decimalPlaces={card.rawValue % 1 !== 0 ? 1 : 0}
                    />
                  ) : (
                    "\u2014"
                  )}
                </p>
              </div>
            </CardContent>
          </MagicCard>
        </FadeIn>
      ))}
    </div>
  );
}

function KPIValue({
  value,
  format,
  currency,
  decimalPlaces,
}: {
  value: number;
  format: (v: number) => string;
  currency: string;
  decimalPlaces: number;
}) {
  // For currency, show prefix then ticker
  const formatted = format(value);
  // Extract currency symbol (first non-digit, non-comma, non-dot, non-minus, non-space chars)
  const symbolMatch = formatted.match(/^[^\d\-,.\s]+/);
  const symbol = symbolMatch ? symbolMatch[0] : "";
  const suffix = formatted.endsWith("h") ? "h" : "";

  return (
    <span>
      {symbol}
      <NumberTicker
        value={Math.abs(value)}
        decimalPlaces={decimalPlaces}
        className="text-xl font-bold"
      />
      {suffix}
    </span>
  );
}
