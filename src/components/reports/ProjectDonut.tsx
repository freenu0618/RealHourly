"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useTranslations } from "next-intl";

const COLORS = [
  "#7EB5A6",
  "#E89B48",
  "#6366F1",
  "#EC4899",
  "#D97706",
  "#8B5CF6",
  "#14B8A6",
  "#F43F5E",
  "#3B82F6",
  "#22C55E",
];

interface Props {
  projects: {
    name: string;
    minutes: number;
  }[];
}

export function ProjectDonut({ projects }: Props) {
  const t = useTranslations("reports");

  const data = projects.map((p) => ({
    name: p.name.length > 12 ? p.name.slice(0, 12) + "\u2026" : p.name,
    value: Math.round((p.minutes / 60) * 10) / 10,
    minutes: p.minutes,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
          strokeWidth={2}
          stroke="var(--card)"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [`${value}h`, t("hours")]}
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid var(--border)",
            backgroundColor: "var(--card)",
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12 }}
          formatter={(value, entry) => {
            const idx = data.findIndex((d) => d.name === value);
            const hours = idx >= 0 ? data[idx].value : 0;
            return `${value} (${hours}h)`;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
