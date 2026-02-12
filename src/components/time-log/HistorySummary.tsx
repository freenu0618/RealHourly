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

const CATEGORY_COLORS: Record<string, string> = {
  planning: "#2B6B93",
  design: "#60A5FA",
  development: "#3B82F6",
  meeting: "#E8882D",
  revision: "#F59E0B",
  admin: "#94A3B8",
  email: "#CBD5E1",
  research: "#8B5CF6",
  other: "#D1D5DB",
};

export default function HistorySummary({ summary, locale, loading }: HistorySummaryProps) {
  const t = useTranslations("history");
  const tCat = useTranslations("timeLog");

  if (loading) return null;

  const hours = Math.floor(summary.totalMinutes / 60);
  const mins = summary.totalMinutes % 60;
  const hShort = t("hoursShort");
  const mShort = t("minutesShort");
  const totalDisplay = `${hours}${hShort} ${mins}${mShort}`;

  const categoryLabel = (cat: string) => {
    const key = `category${cat.charAt(0).toUpperCase() + cat.slice(1)}` as
      | "categoryPlanning"
      | "categoryDesign"
      | "categoryDevelopment"
      | "categoryMeeting"
      | "categoryRevision"
      | "categoryAdmin"
      | "categoryEmail"
      | "categoryResearch"
      | "categoryOther";
    return tCat(key);
  };

  const chartData = summary.byCategory
    .filter((c) => c.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes)
    .map((c) => ({
      name: categoryLabel(c.category),
      category: c.category,
      value: c.minutes,
      hours: Math.round((c.minutes / 60) * 10) / 10,
    }));

  const totalCatMinutes = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {/* Total Time */}
      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <p className="text-xs font-medium text-muted-foreground">{t("totalTime")}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight">{totalDisplay}</p>
      </div>

      {/* Total Entries */}
      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <p className="text-xs font-medium text-muted-foreground">{t("totalEntries")}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight">
          {summary.totalEntries}{t("entriesSuffix")}
        </p>
      </div>

      {/* Category Breakdown — Donut + Legend */}
      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <p className="mb-2 text-xs font-medium text-muted-foreground">{t("categoryBreakdown")}</p>
        {chartData.length > 0 ? (
          <div className="flex items-center gap-3">
            {/* Mini donut */}
            <div className="shrink-0" style={{ width: 80, height: 80 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={20}
                    outerRadius={35}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {chartData.map((d, i) => (
                      <Cell key={i} fill={CATEGORY_COLORS[d.category] ?? "#D1D5DB"} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => {
                      const v = Number(value) || 0;
                      const h = Math.floor(v / 60);
                      const m = v % 60;
                      return `${h}${hShort} ${m}${mShort}`;
                    }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--card)",
                      fontSize: "11px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend labels */}
            <div className="flex flex-1 flex-col gap-1 overflow-hidden">
              {chartData.slice(0, 4).map((d) => {
                const pct = totalCatMinutes > 0
                  ? Math.round((d.value / totalCatMinutes) * 100)
                  : 0;
                return (
                  <div key={d.category} className="flex items-center gap-1.5 text-[11px]">
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[d.category] ?? "#D1D5DB" }}
                    />
                    <span className="truncate text-muted-foreground">{d.name}</span>
                    <span className="ml-auto shrink-0 font-medium tabular-nums">
                      {d.hours}h
                      <span className="ml-0.5 text-muted-foreground">({pct}%)</span>
                    </span>
                  </div>
                );
              })}
              {chartData.length > 4 && (
                <span className="text-[10px] text-muted-foreground">
                  +{chartData.length - 4} more
                </span>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t("noData")}</p>
        )}
      </div>
    </div>
  );
}
