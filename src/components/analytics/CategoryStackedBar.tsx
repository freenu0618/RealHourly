"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useTranslations } from "next-intl";
import type { ProjectComparison } from "@/db/queries/analytics";

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

interface Props {
  projects: ProjectComparison[];
}

export function CategoryStackedBar({ projects }: Props) {
  const t = useTranslations("analytics");
  const tCat = useTranslations("timeLog");

  // Collect all categories across projects
  const allCategories = new Set<string>();
  for (const p of projects) {
    for (const cb of p.categoryBreakdown) {
      allCategories.add(cb.category);
    }
  }
  const categories = [...allCategories];

  const data = projects.map((p) => {
    const row: Record<string, string | number> = {
      name: p.name.length > 10 ? p.name.slice(0, 10) + "…" : p.name,
    };
    for (const cat of categories) {
      const entry = p.categoryBreakdown.find((c) => c.category === cat);
      // Convert to hours for better readability
      row[cat] = entry ? Math.round((entry.minutes / 60) * 10) / 10 : 0;
    }
    return row;
  });

  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {t("noData")}
      </p>
    );
  }

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

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
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
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid var(--border)",
            backgroundColor: "var(--card)",
          }}
          formatter={(value, name) => [
            `${value}h`,
            categoryLabel(String(name)),
          ]}
        />
        <Legend
          formatter={(value: string) => categoryLabel(value)}
          wrapperStyle={{ fontSize: 11 }}
        />
        {categories.map((cat) => (
          <Bar
            key={cat}
            dataKey={cat}
            stackId="a"
            fill={CATEGORY_COLORS[cat] ?? "#D1D5DB"}
            radius={
              cat === categories[categories.length - 1]
                ? [4, 4, 0, 0]
                : undefined
            }
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
