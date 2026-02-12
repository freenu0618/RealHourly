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
  platform_fee: "#2B6B93",
  tax: "#E8882D",
  fixed: "#60A5FA",
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
      color: COLORS[c.type] ?? "#93C5FD",
    }));

  if (data.length === 0) {
    return (
      <div className="flex h-[200px] flex-col items-center justify-center gap-2 text-center">
        <span className="text-3xl">{"\uD83D\uDCB8"}</span>
        <span className="text-sm text-muted-foreground">{t("noCosts")}</span>
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={45}
          outerRadius={75}
          dataKey="value"
        >
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => formatCurrency(Number(value), currency)}
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid #E2E8F0",
            backgroundColor: "#F8FAFC",
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value, entry) => {
            const payload = entry?.payload as { value?: number } | undefined;
            const v = payload?.value ?? 0;
            const pct = total > 0 ? Math.round((v / total) * 100) : 0;
            return `${value} ${pct}%`;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
