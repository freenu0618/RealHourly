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
  t: (key: string, values?: Record<string, string>) => string;
}

export function DashboardWeeklyChart({ weeklyMinutes, t }: DashboardWeeklyChartProps) {
  const totalWeeklyMinutes = weeklyMinutes.reduce((s, d) => s + d.minutes, 0);
  const hours = Math.floor(totalWeeklyMinutes / 60);
  const minutes = totalWeeklyMinutes % 60;

  const minutesMap = new Map(weeklyMinutes.map((d) => [d.date, d.minutes]));

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - 6 + i);
    const dateStr = date.toISOString().slice(0, 10);
    const dayName = date.toLocaleDateString(undefined, { weekday: "short" });
    const mins = minutesMap.get(dateStr) ?? 0;
    return {
      name: dayName,
      hours: Math.round((mins / 60) * 10) / 10,
      isToday: dateStr === todayStr,
    };
  });

  return (
    <Card className="rounded-[20px] border-warm-border">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{"\uD83D\uDCC5"} {t("weeklySummary")}</h2>
          {totalWeeklyMinutes > 0 && (
            <Badge variant="secondary" className="rounded-full text-xs font-medium">
              {t("weeklyTotal", { hours: String(hours), minutes: String(minutes) })}
            </Badge>
          )}
        </div>
        {chartData.length === 0 ? (
          <div className="flex h-[160px] items-center justify-center text-sm text-muted-foreground">
            {t("noWeeklyData")}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} margin={{ left: 0, right: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6DDD3" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#8C7A6B" }} interval={0} />
              <Tooltip
                formatter={(value) => [`${value}h`, ""]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #E6DDD3",
                  backgroundColor: "#FFF8EE",
                }}
              />
              <Bar dataKey="hours" radius={[6, 6, 0, 0]} barSize={28}>
                {chartData.map((d, i) => (
                  <Cell key={i} fill={d.isToday ? "#5A9E8F" : "#7EB5A6"} stroke={d.isToday ? "#3D7A6E" : "none"} strokeWidth={d.isToday ? 2 : 0} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
