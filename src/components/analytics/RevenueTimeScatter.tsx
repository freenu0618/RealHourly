"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  LabelList,
} from "recharts";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/money/currency";
import type { ProjectComparison } from "@/db/queries/analytics";

const DOT_COLORS = ["#2B6B93", "#E8882D", "#F59E0B", "#60A5FA", "#6366F1", "#EC4899", "#8B5CF6"];

interface Props {
  projects: ProjectComparison[];
}

export function RevenueTimeScatter({ projects }: Props) {
  const t = useTranslations("analytics");

  const data = projects
    .filter((p) => p.totalHours > 0)
    .map((p, i) => ({
      name: p.name,
      hours: p.totalHours,
      net: p.net,
      currency: p.currency,
      fill: DOT_COLORS[i % DOT_COLORS.length],
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
    <ResponsiveContainer width="100%" height={320}>
      <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          type="number"
          dataKey="hours"
          name={t("totalHours")}
          unit="h"
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
        />
        <YAxis
          type="number"
          dataKey="net"
          name={t("net")}
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          tickFormatter={(v) => formatCurrency(v, currency)}
        />
        <ZAxis range={[120, 300]} />
        <Tooltip
          content={({ payload }) => {
            if (!payload?.length) return null;
            const d = payload[0].payload as (typeof data)[number];
            return (
              <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-sm">
                <p className="text-sm font-bold">{d.name}</p>
                <p className="text-xs text-muted-foreground">
                  {t("totalHours")}: {d.hours}h
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("net")}: {formatCurrency(d.net, d.currency)}
                </p>
              </div>
            );
          }}
        />
        <Scatter data={data}>
          <LabelList
            dataKey="name"
            position="top"
            offset={12}
            style={{ fontSize: 11, fontWeight: 600, fill: "var(--foreground)" }}
          />
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}
