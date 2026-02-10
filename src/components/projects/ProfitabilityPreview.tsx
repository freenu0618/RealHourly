"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/money/currency";

interface ProfitabilityPreviewProps {
  expectedFee: number;
  expectedHours: number;
  platformFeeRate: number;
  taxRate: number;
  fixedCostAmount: number;
  currency: string;
}

function calculatePreview(input: {
  expectedFee: number;
  expectedHours: number;
  platformFeeRate: number;
  taxRate: number;
  fixedCostAmount: number;
}) {
  const gross = input.expectedFee;
  const platformFeeAmount = gross * input.platformFeeRate;
  const taxAmount = gross * input.taxRate;
  const fixedCost = input.fixedCostAmount;
  const net = gross - platformFeeAmount - taxAmount - fixedCost;

  const nominalHourly =
    input.expectedHours > 0 ? gross / input.expectedHours : null;
  const realHourly =
    input.expectedHours > 0 ? net / input.expectedHours : null;
  const dropPercent =
    nominalHourly && realHourly
      ? Math.round((1 - realHourly / nominalHourly) * 100)
      : null;

  return {
    grossFee: gross,
    platformFeeAmount,
    taxAmount,
    estimatedFixedCost: fixedCost,
    estimatedNet: net,
    estimatedHourlyRate: realHourly,
    rateDropPercent: dropPercent,
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
}: ProfitabilityPreviewProps) {
  const t = useTranslations("profitabilityPreview");
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const preview = calculatePreview({
    expectedFee,
    expectedHours,
    platformFeeRate,
    taxRate,
    fixedCostAmount,
  });

  const isDeficit = preview.estimatedNet < 0;
  const isHighDrop =
    preview.rateDropPercent !== null && preview.rateDropPercent >= 30;
  const hasCosts =
    preview.platformFeeAmount > 0 ||
    preview.taxAmount > 0 ||
    preview.estimatedFixedCost > 0;

  const toggleCheck = (key: string) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <Lightbulb className="size-4 text-amber-600 dark:text-amber-400" />
        <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
          {t("title")}
        </span>
        {isDeficit && (
          <Badge variant="destructive" className="text-xs">
            {t("deficit")}
          </Badge>
        )}
        {!isDeficit && isHighDrop && (
          <Badge variant="destructive" className="text-xs">
            {t("rateDropWarning")}
          </Badge>
        )}
      </div>

      {/* Breakdown */}
      <div className="space-y-1.5 text-sm">
        <BreakdownRow
          label={t("grossFee")}
          amount={preview.grossFee}
          currency={currency}
        />
        {preview.platformFeeAmount > 0 && (
          <BreakdownRow
            label={t("platformFee")}
            amount={-preview.platformFeeAmount}
            currency={currency}
            sub
          />
        )}
        {preview.taxAmount > 0 && (
          <BreakdownRow
            label={t("tax")}
            amount={-preview.taxAmount}
            currency={currency}
            sub
          />
        )}
        {preview.estimatedFixedCost > 0 && (
          <BreakdownRow
            label={t("fixedCost")}
            amount={-preview.estimatedFixedCost}
            currency={currency}
            sub
          />
        )}
        {!hasCosts && (
          <p className="text-xs text-muted-foreground">{t("noCosts")}</p>
        )}

        <div className="my-2 border-t border-amber-200 dark:border-amber-800" />

        {/* Net */}
        <div className="flex items-baseline justify-between">
          <span className="font-medium text-amber-800 dark:text-amber-300">
            {t("estimatedNet")}
          </span>
          <span
            className={`text-2xl font-bold ${isDeficit ? "text-red-600" : "text-foreground"}`}
          >
            {formatCurrency(preview.estimatedNet, currency)}
          </span>
        </div>

        {/* Hourly rate */}
        {preview.estimatedHourlyRate !== null && (
          <div className="flex items-baseline justify-between">
            <span className="text-muted-foreground">
              {t("estimatedRate")}
            </span>
            <span className="flex items-baseline gap-2">
              <span
                className={`text-lg font-semibold ${isDeficit ? "text-red-600" : "text-foreground"}`}
              >
                {formatCurrency(preview.estimatedHourlyRate, currency)}/h
              </span>
              <span className="text-xs text-muted-foreground">
                {t("basedOnHours", { hours: expectedHours })}
              </span>
            </span>
          </div>
        )}

        {/* Drop percent */}
        {preview.rateDropPercent !== null && preview.rateDropPercent > 0 && (
          <p
            className={`text-xs ${isHighDrop ? "font-medium text-red-600" : "text-muted-foreground"}`}
          >
            {t("rateDropPercent", { percent: preview.rateDropPercent })}
          </p>
        )}
      </div>

      {/* Checklist */}
      <div className="mt-4 border-t border-amber-200 pt-3 dark:border-amber-800">
        <p className="mb-2 text-xs font-medium text-amber-800 dark:text-amber-300">
          {t("checklistTitle")}
        </p>
        <div className="space-y-1.5">
          {CHECKLIST_ITEMS.map((key) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                checked={!!checked[key]}
                onChange={() => toggleCheck(key)}
                className="size-4 rounded border-amber-300"
              />
              <span
                className={
                  checked[key]
                    ? "text-muted-foreground line-through opacity-50"
                    : "text-foreground"
                }
              >
                {t(key)}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function BreakdownRow({
  label,
  amount,
  currency,
  sub,
}: {
  label: string;
  amount: number;
  currency: string;
  sub?: boolean;
}) {
  return (
    <div
      className={`flex items-baseline justify-between ${sub ? "pl-2 text-muted-foreground" : ""}`}
    >
      <span>{label}</span>
      <span className={sub ? "" : "font-medium"}>
        {amount < 0 ? "- " : ""}
        {formatCurrency(Math.abs(amount), currency)}
      </span>
    </div>
  );
}
