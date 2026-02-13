"use client";

import { useTranslations } from "next-intl";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { NumberTicker } from "@/components/ui/number-ticker";
import { formatCurrency, getDominantCurrency } from "@/lib/money/currency";
import type { ProjectSummary } from "./types";

interface DashboardProfitabilityCardProps {
  projects: ProjectSummary[];
  weeklyMinutes: { date: string; minutes: number }[];
}

export function DashboardProfitabilityCard({
  projects,
  weeklyMinutes,
}: DashboardProfitabilityCardProps) {
  const t = useTranslations("profitabilityFeedback");

  if (projects.length === 0) return null;

  // Compute weighted average real rate across all active projects
  let totalNet = 0;
  let totalHours = 0;
  const currency = getDominantCurrency(projects);

  for (const p of projects) {
    const gross = p.expectedFee;
    const platformFee = gross * p.platformFeeRate;
    const tax = gross * p.taxRate;
    const net = gross - p.fixedCosts - platformFee - tax;
    const hours = p.totalMinutes / 60;
    totalNet += net;
    totalHours += hours;
  }

  const avgRealRate = totalHours > 0 ? Math.round((totalNet / totalHours) * 100) / 100 : null;
  const weeklyTotalMinutes = weeklyMinutes.reduce((sum, w) => sum + w.minutes, 0);
  const weeklyHours = Math.round((weeklyTotalMinutes / 60) * 10) / 10;

  if (avgRealRate === null) return null;

  const isPositive = avgRealRate > 0;

  return (
    <Card className="rounded-[20px] border-border transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <CardContent className="flex items-center gap-4 p-5">
        <span className="text-3xl">
          {isPositive ? <TrendingUp className="size-8 text-green-600" /> : <TrendingDown className="size-8 text-red-500" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-muted-foreground">
            {t("weeklyRate")}
          </p>
          <p className={`text-xl font-bold tabular-nums ${isPositive ? "" : "text-destructive"}`}>
            {(() => {
              const formatted = formatCurrency(avgRealRate, currency);
              const symbolMatch = formatted.match(/^[^\d\-,.\s]+/);
              const symbol = symbolMatch ? symbolMatch[0] : "";
              return (
                <span>
                  {symbol}
                  <NumberTicker
                    value={Math.abs(avgRealRate)}
                    decimalPlaces={avgRealRate % 1 !== 0 ? 1 : 0}
                    className="text-xl font-bold"
                  />
                  /h
                </span>
              );
            })()}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("weeklyHours", { hours: String(weeklyHours) })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
