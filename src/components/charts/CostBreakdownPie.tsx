"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/money/currency";

interface CostBreakdownPieProps {
  costBreakdown: { type: string; amount: number }[];
  currency: string;
}

const COLORS: Record<string, string> = {
  platform_fee: "hsl(30 80% 55%)",
  tax: "hsl(0 70% 55%)",
  fixed: "hsl(220 10% 60%)",
};

const TYPE_KEYS: Record<string, string> = {
  platform_fee: "platformFee",
  tax: "tax",
  fixed: "fixedCost",
};

export function CostBreakdownPie({
  costBreakdown,
  currency,
}: CostBreakdownPieProps) {
  const t = useTranslations("metrics");

  const data = costBreakdown
    .filter((c) => c.amount > 0)
    .map((c) => ({
      name: t(TYPE_KEYS[c.type] ?? c.type),
      value: Math.round(c.amount * 100) / 100,
      color: COLORS[c.type] ?? "hsl(220 10% 50%)",
    }));

  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
        {t("noCosts")}
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={45}
          outerRadius={75}
          dataKey="value"
          label={({ name, value }) =>
            `${name} ${formatCurrency(value, currency)} (${Math.round((value / total) * 100)}%)`
          }
          labelLine={false}
        >
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => formatCurrency(Number(value), currency)}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
