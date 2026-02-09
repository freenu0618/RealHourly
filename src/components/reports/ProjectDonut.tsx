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

const COLORS = ["#7EB5A6", "#A4D4C8", "#E89B48", "#D1EBE4", "#D97706", "#5A9E8F", "#B8D8CE"];

interface Props {
  projects: {
    name: string;
    minutes: number;
  }[];
}

export function ProjectDonut({ projects }: Props) {
  const t = useTranslations("reports");

  const data = projects.map((p) => ({
    name: p.name.length > 10 ? p.name.slice(0, 10) + "…" : p.name,
    value: Math.round((p.minutes / 60) * 10) / 10,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
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
          wrapperStyle={{ fontSize: 11 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
