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
import { formatFactBomb } from "@/lib/money/format";

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

  if (realHourly === null) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center">
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
      fill: "hsl(var(--chart-1))",
    },
    {
      name: t("realHourly"),
      value: realHourly,
      fill: net < 0 ? "hsl(var(--destructive))" : "hsl(var(--chart-5))",
    },
  ];

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 40 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={80}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value), currency)}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.fill} />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              formatter={(v) => formatCurrency(Number(v), currency)}
              style={{ fontSize: 13, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Fact bomb */}
      <div className="text-center">
        {nominalHourly !== null && (
          <p className="text-lg font-bold">
            {formatFactBomb(nominalHourly, realHourly, currency)}
          </p>
        )}
        {net < 0 && (
          <Badge variant="destructive" className="mt-1">
            {t("deficit")}
          </Badge>
        )}
      </div>
    </div>
  );
}
