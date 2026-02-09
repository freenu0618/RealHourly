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
  LabelList,
} from "recharts";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/money/currency";
import type { ProjectComparison } from "@/db/queries/analytics";

const COLORS = ["#7EB5A6", "#A4D4C8", "#E89B48", "#D1EBE4", "#D97706"];

interface Props {
  projects: ProjectComparison[];
}

export function HourlyRankingChart({ projects }: Props) {
  const t = useTranslations("analytics");

  const data = projects
    .filter((p) => p.realHourly !== null)
    .sort((a, b) => (b.realHourly ?? 0) - (a.realHourly ?? 0))
    .map((p) => ({
      name: p.name.length > 12 ? p.name.slice(0, 12) + "…" : p.name,
      realHourly: p.realHourly ?? 0,
      nominalHourly: p.nominalHourly ?? 0,
      currency: p.currency,
    }));

  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {t("noData")}
      </p>
    );
  }

  const currency = data[0].currency;

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 60)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ left: 10, right: 60 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          horizontal={false}
          stroke="var(--border)"
        />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          width={100}
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
        />
        <Tooltip
          formatter={(value, name) => [
            formatCurrency(Number(value), currency),
            name === "realHourly" ? t("real") : t("nominal"),
          ]}
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid var(--border)",
            backgroundColor: "var(--card)",
          }}
        />
        <Bar
          dataKey="realHourly"
          name={t("real")}
          radius={[0, 8, 8, 0]}
          barSize={24}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
          <LabelList
            dataKey="realHourly"
            position="right"
            formatter={(v) => formatCurrency(Number(v), currency)}
            style={{
              fontSize: 12,
              fontWeight: 600,
              fill: "var(--foreground)",
            }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
