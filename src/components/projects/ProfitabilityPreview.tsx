"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/money/currency";

interface ProfitabilityPreviewProps {
  expectedFee: number;
  expectedHours: number;
  platformFeeRate: number;
  taxRate: number;
  fixedCostAmount: number;
  currency: string;
  avgRealHourly?: number | null;
}

// Currency-aware severity thresholds for hourly rate
const RATE_THRESHOLDS: Record<string, [number, number, number]> = {
  KRW: [10000, 20000, 40000],
  USD: [8, 15, 30],
  EUR: [7, 14, 28],
  GBP: [6, 12, 24],
  JPY: [1200, 2200, 4500],
};

type Severity = "danger" | "warning" | "good" | "great";

const SEVERITY_CONFIG: Record<Severity, { border: string; bg: string; text: string; badge: string }> = {
  danger: {
    border: "border-red-400 dark:border-red-600",
    bg: "bg-red-50 dark:bg-red-950/20",
    text: "text-red-600 dark:text-red-400",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  },
  warning: {
    border: "border-amber-400 dark:border-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950/20",
    text: "text-amber-600 dark:text-amber-400",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
  good: {
    border: "border-green-400 dark:border-green-600",
    bg: "bg-green-50 dark:bg-green-950/20",
    text: "text-green-600 dark:text-green-400",
    badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  },
  great: {
    border: "border-blue-400 dark:border-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/20",
    text: "text-blue-600 dark:text-blue-400",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
};

function getSeverity(rate: number, currency: string): Severity {
  const [danger, warning, good] = RATE_THRESHOLDS[currency] ?? RATE_THRESHOLDS.USD;
  if (rate < danger) return "danger";
  if (rate < warning) return "warning";
  if (rate < good) return "good";
  return "great";
}

interface PreviewResult {
  gross: number;
  commissionAmount: number;
  afterCommission: number;
  taxAmount: number;
  afterTax: number;
  fixedCost: number;
  netIncome: number;
  realHourlyRate: number | null;
  severity: Severity;
  feePercent: number;
  taxPercent: number;
}

function calculate(
  fee: number,
  hours: number,
  platformFeeRate: number,
  taxRate: number,
  fixedCost: number,
  currency: string,
): PreviewResult {
  const gross = fee;
  const commissionAmount = gross * platformFeeRate;
  const afterCommission = gross - commissionAmount;
  const taxAmount = afterCommission * taxRate;
  const afterTax = afterCommission - taxAmount;
  const netIncome = afterTax - fixedCost;
  const realHourlyRate = hours > 0 ? netIncome / hours : null;
  const severity = realHourlyRate !== null ? getSeverity(realHourlyRate, currency) : "warning";

  return {
    gross,
    commissionAmount,
    afterCommission,
    taxAmount,
    afterTax,
    fixedCost,
    netIncome,
    realHourlyRate,
    severity,
    feePercent: Math.round(platformFeeRate * 1000) / 10,
    taxPercent: Math.round(taxRate * 1000) / 10,
  };
}

const CHECKLIST_ITEMS = [
  "checkRevisionScope",
  "checkMilestonePayment",
  "checkPaymentDate",
] as const;

export function ProfitabilityPreview({
  expectedFee,
  expectedHours,
  platformFeeRate,
  taxRate,
  fixedCostAmount,
  currency,
  avgRealHourly,
}: ProfitabilityPreviewProps) {
  const t = useTranslations("profitabilityPreview");
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  // 300ms debounce
  const [debounced, setDebounced] = useState({
    expectedFee, expectedHours, platformFeeRate, taxRate, fixedCostAmount, currency,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced({ expectedFee, expectedHours, platformFeeRate, taxRate, fixedCostAmount, currency });
    }, 300);
    return () => clearTimeout(timer);
  }, [expectedFee, expectedHours, platformFeeRate, taxRate, fixedCostAmount, currency]);

  const p = calculate(
    debounced.expectedFee,
    debounced.expectedHours,
    debounced.platformFeeRate,
    debounced.taxRate,
    debounced.fixedCostAmount,
    debounced.currency,
  );

  const s = SEVERITY_CONFIG[p.severity];
  const isDeficit = p.netIncome < 0;
  const cur = debounced.currency;

  const avgRate = avgRealHourly ?? null;
  const comparisonDiff =
    avgRate !== null && avgRate > 0 && p.realHourlyRate !== null
      ? Math.round(((p.realHourlyRate - avgRate) / avgRate) * 100)
      : null;

  return (
    <div className={`rounded-2xl border-2 p-4 transition-colors duration-300 ${s.border} ${s.bg}`}>
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <span className={`text-sm font-semibold ${s.text}`}>{t("title")}</span>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.badge}`}>
          {t(`severity_${p.severity}` as Parameters<typeof t>[0])}
        </span>
      </div>

      {/* Breakdown */}
      <div className="space-y-1 text-sm">
        <Row label={t("grossFee")} value={formatCurrency(p.gross, cur)} />
        {p.commissionAmount > 0 && (
          <Row
            label={`- ${t("platformFee")} (${p.feePercent}%)`}
            value={`-${formatCurrency(p.commissionAmount, cur)}`}
            sub
          />
        )}
        {p.taxAmount > 0 && (
          <Row
            label={`- ${t("tax")} (${p.taxPercent}%)`}
            value={`-${formatCurrency(Math.round(p.taxAmount * 100) / 100, cur)}`}
            sub
          />
        )}
        {p.fixedCost > 0 && (
          <Row
            label={`- ${t("fixedCost")}`}
            value={`-${formatCurrency(p.fixedCost, cur)}`}
            sub
          />
        )}

        <div className={`my-2 border-t ${s.border} opacity-40`} />

        {/* Net income */}
        <div className="flex items-baseline justify-between">
          <span className="font-medium">{t("netIncome")}</span>
          <span className={`text-xl font-bold ${isDeficit ? "text-red-600" : ""}`}>
            {formatCurrency(p.netIncome, cur)}
          </span>
        </div>

        {/* Hours divider */}
        <Row
          label={`\u00F7 ${t("expectedHoursLabel")}`}
          value={`${debounced.expectedHours}h`}
          sub
        />

        <div className={`my-2 border-t ${s.border} opacity-40`} />

        {/* Real hourly rate — hero number */}
        {p.realHourlyRate !== null && (
          <div className="flex items-baseline justify-between">
            <span className="font-semibold">{t("realHourlyRate")}</span>
            <span className={`text-2xl font-bold ${s.text}`}>
              {formatCurrency(Math.round(p.realHourlyRate * 100) / 100, cur)}
              <span className="ml-0.5 text-sm font-normal text-muted-foreground">/h</span>
            </span>
          </div>
        )}

        {/* Comparison with past projects */}
        {comparisonDiff !== null && avgRate !== null && (
          <p className="mt-1 text-xs text-muted-foreground">
            {t("comparison", {
              avg: formatCurrency(Math.round(avgRate), cur),
              diff: `${Math.abs(comparisonDiff)}`,
              direction: comparisonDiff >= 0
                ? t("comparisonHigher")
                : t("comparisonLower"),
            })}
          </p>
        )}
      </div>

      {/* Checklist */}
      <div className={`mt-4 border-t pt-3 ${s.border} opacity-40`}>
        <p className={`mb-2 text-xs font-medium ${s.text}`}>
          {t("checklistTitle")}
        </p>
        <div className="space-y-1.5">
          {CHECKLIST_ITEMS.map((key) => (
            <label key={key} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!checked[key]}
                onChange={() => setChecked((prev) => ({ ...prev, [key]: !prev[key] }))}
                className="size-4 rounded"
              />
              <span className={checked[key] ? "text-muted-foreground line-through opacity-50" : "text-foreground"}>
                {t(key)}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, sub }: { label: string; value: string; sub?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between ${sub ? "pl-2 text-muted-foreground" : ""}`}>
      <span>{label}</span>
      <span className={sub ? "tabular-nums" : "font-medium tabular-nums"}>{value}</span>
    </div>
  );
}
