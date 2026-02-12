"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useTranslations } from "next-intl";
import { getDay } from "date-fns";

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

interface Props {
  dailyBreakdown: { date: string; minutes: number }[];
  weekStart: string;
}

export function DailyBarChart({ dailyBreakdown }: Props) {
  const t = useTranslations("reports");

  const data = dailyBreakdown.map((d) => {
    const dayOfWeek = getDay(new Date(d.date));
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    return {
      day: t(DAY_KEYS[dayOfWeek]),
      hours: Math.round((d.minutes / 60) * 10) / 10,
      isWeekend,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          label={{
            value: t("hours"),
            angle: -90,
            position: "insideLeft",
            style: { fontSize: 11, fill: "var(--muted-foreground)" },
          }}
        />
        <Tooltip
          formatter={(value) => [`${value}h`, t("hours")]}
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid var(--border)",
            backgroundColor: "var(--card)",
          }}
        />
        <Bar dataKey="hours" radius={[6, 6, 0, 0]} barSize={32}>
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={d.isWeekend ? "#E8882D" : "#2B6B93"}
              opacity={d.isWeekend ? 0.7 : 1}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
