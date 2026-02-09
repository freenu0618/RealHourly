"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import { useTranslations } from "next-intl";

const CATEGORY_COLORS: Record<string, string> = {
  planning: "#7EB5A6",
  design: "#A4D4C8",
  development: "#5A9E8F",
  meeting: "#E89B48",
  revision: "#D97706",
  admin: "#D1EBE4",
  email: "#8CB4A8",
  research: "#B8D8CE",
  other: "#C4B5A5",
};

interface Props {
  categories: { category: string; minutes: number; percent: number }[];
}

export function CategoryBar({ categories }: Props) {
  const tCat = useTranslations("timeLog");

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

  const data = categories
    .sort((a, b) => b.minutes - a.minutes)
    .map((c) => ({
      name: categoryLabel(c.category),
      category: c.category,
      percent: c.percent,
      hours: Math.round((c.minutes / 60) * 10) / 10,
    }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(150, data.length * 36)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ left: 10, right: 30 }}
      >
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          width={70}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
        />
        <Tooltip
          formatter={(value, _name, props) => [
            `${props.payload.hours}h (${value}%)`,
            props.payload.name,
          ]}
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid var(--border)",
            backgroundColor: "var(--card)",
          }}
        />
        <Bar dataKey="percent" radius={[0, 6, 6, 0]} barSize={20}>
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={CATEGORY_COLORS[d.category] ?? "#C4B5A5"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
