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
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { formatCurrency } from "@/lib/money/currency";
import { useCountUp } from "@/lib/hooks/use-count-up";

interface HourlyRateBarProps {
  nominalHourly: number | null;
  realHourly: number | null;
  currency: string;
  net: number;
}

export function HourlyRateBar({
  nominalHourly,
  realHourly,
  currency,
  net,
}: HourlyRateBarProps) {
  const t = useTranslations("metrics");
  const animatedReal = useCountUp(realHourly, 1000);
  const animatedNominal = useCountUp(nominalHourly, 1000);

  if (realHourly === null) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-[20px] border border-dashed p-8 text-center">
        <span className="text-4xl">{"\u23F0"}</span>
        <p className="text-sm text-muted-foreground">{t("noTimeLog")}</p>
        <Link
          href="/time-log"
          className="text-sm font-medium text-primary underline"
        >
          {t("goToTimeLog")}
        </Link>
      </div>
    );
  }

  const data = [
    {
      name: t("nominalHourly"),
      value: nominalHourly ?? 0,
      fill: "#A4D4C8",
    },
    {
      name: t("realHourly"),
      value: realHourly,
      fill: net < 0 ? "#D97706" : "#7EB5A6",
    },
  ];

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 40 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E6DDD3" />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={80}
            tick={{ fontSize: 12, fill: "#8C7A6B" }}
          />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value), currency)}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #E6DDD3",
              backgroundColor: "#FFF8EE",
            }}
          />
          <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={32}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.fill} />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              formatter={(v) => formatCurrency(Number(v), currency)}
              style={{ fontSize: 13, fontWeight: 600, fill: "#4A3728" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Fact bomb with count-up */}
      <div className="text-center">
        {nominalHourly !== null && (
          <p className="text-lg font-bold" aria-live="polite">
            <span className="text-muted-foreground line-through decoration-2">
              {formatCurrency(Math.round(animatedNominal * 100) / 100, currency)}
            </span>
            {" \u2192 "}
            <span className={net < 0 ? "text-destructive" : "text-primary"}>
              {formatCurrency(Math.round(animatedReal * 100) / 100, currency)}
            </span>
          </p>
        )}
        {net < 0 && (
          <Badge className="mt-1 rounded-full bg-destructive/10 text-destructive">
            {"\u26A0\uFE0F"} {t("deficit")}
          </Badge>
        )}
      </div>
    </div>
  );
}
