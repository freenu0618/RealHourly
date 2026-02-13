"use client";

import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DashboardWeeklyChartProps {
  weeklyMinutes: { date: string; minutes: number }[];
  previousWeekDaily?: { date: string; minutes: number }[];
  t: (key: string, values?: Record<string, string>) => string;
}

export function DashboardWeeklyChart({ weeklyMinutes, previousWeekDaily, t }: DashboardWeeklyChartProps) {
  const totalWeeklyMinutes = weeklyMinutes.reduce((s, d) => s + d.minutes, 0);
  const hours = Math.floor(totalWeeklyMinutes / 60);
  const minutes = totalWeeklyMinutes % 60;

  const minutesMap = new Map(weeklyMinutes.map((d) => [d.date, d.minutes]));

  // Build previous week map by day-of-week index (0=Sun..6=Sat)
  const prevMap = new Map<number, number>();
  if (previousWeekDaily) {
    for (const d of previousWeekDaily) {
      const dayOfWeek = new Date(d.date + "T00:00:00").getDay();
      prevMap.set(dayOfWeek, (prevMap.get(dayOfWeek) ?? 0) + d.minutes);
    }
  }

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - 6 + i);
    const dateStr = date.toISOString().slice(0, 10);
    const dayName = date.toLocaleDateString(undefined, { weekday: "short" });
    const mins = minutesMap.get(dateStr) ?? 0;
    const prevMins = prevMap.get(date.getDay()) ?? 0;
    return {
      name: dayName,
      hours: Math.round((mins / 60) * 10) / 10,
      prevHours: Math.round((prevMins / 60) * 10) / 10,
      isToday: dateStr === todayStr,
    };
  });

  const hasPrevData = chartData.some((d) => d.prevHours > 0);

  return (
    <Card className="rounded-[20px] border-border">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{"\uD83D\uDCC5"} {t("weeklySummary")}</h2>
          <div className="flex items-center gap-2">
            {hasPrevData && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="inline-block size-2.5 rounded-sm bg-muted-foreground/20" />
                {t("previousWeek")}
              </span>
            )}
            {totalWeeklyMinutes > 0 && (
              <Badge variant="secondary" className="rounded-full text-xs font-medium">
                {t("weeklyTotal", { hours: String(hours), minutes: String(minutes) })}
              </Badge>
            )}
          </div>
        </div>
        {chartData.length === 0 ? (
          <div className="flex h-[160px] items-center justify-center text-sm text-muted-foreground">
            {t("noWeeklyData")}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} margin={{ left: 0, right: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} interval={0} />
              <Tooltip
                formatter={(value, name) => [
                  `${value}h`,
                  name === "prevHours" ? "Last week" : "This week",
                ]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #E2E8F0",
                  backgroundColor: "#F8FAFC",
                }}
              />
              {hasPrevData && (
                <Bar dataKey="prevHours" radius={[6, 6, 0, 0]} barSize={14} fill="#94A3B8" opacity={0.25} />
              )}
              <Bar dataKey="hours" radius={[6, 6, 0, 0]} barSize={hasPrevData ? 14 : 28}>
                {chartData.map((d, i) => (
                  <Cell key={i} fill={d.isToday ? "#1E4F75" : "#2B6B93"} stroke={d.isToday ? "#1A3F5E" : "none"} strokeWidth={d.isToday ? 2 : 0} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
