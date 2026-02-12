"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FadeIn } from "@/components/ui/fade-in";
import { NumberTicker } from "@/components/ui/number-ticker";
import { BorderBeam } from "@/components/ui/border-beam";
import { ArrowRight } from "lucide-react";

export function InteractiveCalcSection() {
  const t = useTranslations("landing");

  // Input state
  const [amount, setAmount] = useState(3000);
  const [hours, setHours] = useState(40);
  const [feeRate, setFeeRate] = useState(20);
  const [taxRate, setTaxRate] = useState(10);
  const [toolCost, setToolCost] = useState(50);

  // Calculate derived values
  const { gross, feeAmount, taxAmount, totalCost, net, nominalRate, realRate, lossPercent } = useMemo(() => {
    const gross = amount;
    const feeAmount = gross * (feeRate / 100);
    const taxAmount = gross * (taxRate / 100);
    const totalCost = feeAmount + taxAmount + toolCost;
    const net = gross - totalCost;
    const nominalRate = hours > 0 ? gross / hours : 0;
    const realRate = hours > 0 ? net / hours : 0;
    const lossPercent = gross > 0 ? Math.round((totalCost / gross) * 100) : 0;

    return { gross, feeAmount, taxAmount, totalCost, net, nominalRate, realRate, lossPercent };
  }, [amount, hours, feeRate, taxRate, toolCost]);

  // Calculate percentage widths for breakdown bars
  const netPercent = gross > 0 ? (net / gross) * 100 : 0;
  const feePercent = gross > 0 ? (feeAmount / gross) * 100 : 0;
  const taxPercent = gross > 0 ? (taxAmount / gross) * 100 : 0;
  const toolPercent = gross > 0 ? (toolCost / gross) * 100 : 0;

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <FadeIn className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("calcTitle")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("calcSubtitle")}
          </p>
        </FadeIn>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Left: Input Form */}
          <FadeIn delay={0.1} className="space-y-6">
            {/* Project Amount */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("calcInputAmount")} <span className="text-muted-foreground">({amount})</span>
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min={0}
                step={100}
                className="w-full rounded-xl border bg-background px-4 py-3 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Expected Hours */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("calcInputHours")} <span className="text-muted-foreground">({hours}h)</span>
              </label>
              <input
                type="number"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                min={1}
                step={1}
                className="w-full rounded-xl border bg-background px-4 py-3 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Platform Fee */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("calcFeeLabel")} <span className="text-muted-foreground">({feeRate}%)</span>
              </label>
              <input
                type="range"
                value={feeRate}
                onChange={(e) => setFeeRate(Number(e.target.value))}
                min={0}
                max={30}
                step={1}
                className="w-full accent-primary h-2 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Tax Rate */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("calcTaxLabel")} <span className="text-muted-foreground">({taxRate}%)</span>
              </label>
              <input
                type="range"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                min={0}
                max={50}
                step={1}
                className="w-full accent-primary h-2 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Tool Costs */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("calcToolLabel")} <span className="text-muted-foreground">({toolCost})</span>
              </label>
              <input
                type="number"
                value={toolCost}
                onChange={(e) => setToolCost(Number(e.target.value))}
                min={0}
                step={10}
                className="w-full rounded-xl border bg-background px-4 py-3 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </FadeIn>

          {/* Right: Results */}
          <FadeIn delay={0.2} className="relative overflow-hidden rounded-[24px] border bg-card p-8">
            <BorderBeam size={250} duration={12} delay={9} />

            <div className="space-y-6">
              {/* Comparison Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{t("calcNominalLabel")}</span>
                  <span className="font-mono">{nominalRate.toFixed(2)}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-muted-foreground/30"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Real Rate (Large Number) */}
              <div className="text-center py-6 border-y">
                <p className="text-sm text-muted-foreground mb-2">{t("calcResultLabel")}</p>
                <div className="text-5xl font-bold text-primary">
                  <NumberTicker value={realRate} decimalPlaces={2} />
                </div>
              </div>

              {/* Breakdown Bars */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-green-600 dark:text-green-400">{t("calcNetIncome")}</span>
                    <span className="font-mono">{net.toFixed(0)}</span>
                  </div>
                  <div className="h-3 bg-muted rounded overflow-hidden">
                    <div
                      className="h-full bg-green-600 dark:bg-green-400"
                      style={{ width: `${Math.max(0, netPercent)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-orange-600 dark:text-orange-400">{t("calcFeeAmount")}</span>
                    <span className="font-mono">{feeAmount.toFixed(0)}</span>
                  </div>
                  <div className="h-3 bg-muted rounded overflow-hidden">
                    <div
                      className="h-full bg-orange-600 dark:bg-orange-400"
                      style={{ width: `${feePercent}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-red-600 dark:text-red-400">{t("calcTaxAmount")}</span>
                    <span className="font-mono">{taxAmount.toFixed(0)}</span>
                  </div>
                  <div className="h-3 bg-muted rounded overflow-hidden">
                    <div
                      className="h-full bg-red-600 dark:bg-red-400"
                      style={{ width: `${taxPercent}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">{t("calcToolAmount")}</span>
                    <span className="font-mono">{toolCost.toFixed(0)}</span>
                  </div>
                  <div className="h-3 bg-muted rounded overflow-hidden">
                    <div
                      className="h-full bg-gray-600 dark:bg-gray-400"
                      style={{ width: `${toolPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Loss Message */}
              <div className="text-center text-sm text-destructive font-medium">
                {t("calcLossMessage", { percent: lossPercent })}
              </div>

              {/* CTA */}
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                {t("calcCta")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
