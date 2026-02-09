"use client";

import { useTranslations } from "next-intl";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface Summary {
  totalMinutes: number;
  totalEntries: number;
  byCategory: { category: string; minutes: number; count: number }[];
  byProject: { projectId: string; projectName: string; minutes: number }[];
}

interface HistorySummaryProps {
  summary: Summary;
  locale: string;
  loading: boolean;
}

const COLORS = [
  "#7EB8A4", "#E8A87C", "#C38D9E", "#41B3A3",
  "#85CDCA", "#F5B971", "#D4A5A5", "#9DC8C8", "#A8D8EA",
];

export default function HistorySummary({ summary, locale, loading }: HistorySummaryProps) {
  const t = useTranslations("history");
  const tCat = useTranslations("timeLog");

  if (loading) return null;

  const hours = Math.floor(summary.totalMinutes / 60);
  const mins = summary.totalMinutes % 60;
  const totalDisplay = locale === "ko"
    ? `${hours}\uC2DC\uAC04 ${mins}\uBD84`
    : `${hours}h ${mins}m`;

  const chartData = summary.byCategory
    .filter((c) => c.minutes > 0)
    .map((c) => ({
      name: tCat(`category${c.category.charAt(0).toUpperCase() + c.category.slice(1)}`),
      value: c.minutes,
    }));

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <p className="text-xs font-medium text-muted-foreground">{t("totalTime")}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight">{totalDisplay}</p>
      </div>

      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <p className="text-xs font-medium text-muted-foreground">{t("totalEntries")}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight">
          {summary.totalEntries}{locale === "ko" ? "\uAC74" : ""}
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <p className="mb-2 text-xs font-medium text-muted-foreground">{t("categoryBreakdown")}</p>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={80}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={20}
                outerRadius={35}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => {
                  const v = Number(value) || 0;
                  const h = Math.floor(v / 60);
                  const m = v % 60;
                  return locale === "ko" ? `${h}\uC2DC\uAC04 ${m}\uBD84` : `${h}h ${m}m`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted-foreground">{t("noData")}</p>
        )}
      </div>
    </div>
  );
}
