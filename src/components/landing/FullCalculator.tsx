"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FadeIn } from "@/components/ui/fade-in";
import { NumberTicker } from "@/components/ui/number-ticker";
import { BorderBeam } from "@/components/ui/border-beam";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { ArrowRight, Calculator } from "lucide-react";

/**
 * FullCalculator — Standalone calculator page extending InteractiveCalcSection
 * with unbilled time inputs. Shows nominal/real rates, cost breakdown, and CTA.
 * @example <FullCalculator />
 */
export function FullCalculator() {
  const t = useTranslations("landing");
  const c = useTranslations("calculatorPage");

  const [amount, setAmount] = useState(3000);
  const [hours, setHours] = useState(40);
  const [feeRate, setFeeRate] = useState(20);
  const [taxRate, setTaxRate] = useState(10);
  const [toolCost, setToolCost] = useState(50);
  const [meetingHours, setMeetingHours] = useState(3);
  const [emailHours, setEmailHours] = useState(2);
  const [revisionPercent, setRevisionPercent] = useState(15);

  const r = useMemo(() => {
    const revisionHours = hours * (revisionPercent / 100);
    const totalUnbilled = meetingHours + emailHours + revisionHours;
    const adjustedHours = hours + totalUnbilled;
    const feeAmount = amount * (feeRate / 100);
    const taxAmount = amount * (taxRate / 100);
    const totalCost = feeAmount + taxAmount + toolCost;
    const net = amount - totalCost;
    const nominal = hours > 0 ? amount / hours : 0;
    const realWith = adjustedHours > 0 ? net / adjustedHours : 0;
    const realWithout = hours > 0 ? net / hours : 0;
    const pct = (n: number) => (amount > 0 ? (n / amount) * 100 : 0);
    return {
      feeAmount, taxAmount, net, nominal, realWith, realWithout,
      totalUnbilled: totalUnbilled.toFixed(1),
      lossPercent: amount > 0 ? Math.round((totalCost / amount) * 100) : 0,
      timeLoss: adjustedHours > 0 ? Math.round((totalUnbilled / adjustedHours) * 100) : 0,
      netPct: pct(net), feePct: pct(feeAmount), taxPct: pct(taxAmount),
      toolPct: pct(toolCost),
      withoutBar: nominal > 0 ? Math.min(100, (realWithout / nominal) * 100) : 0,
      withBar: nominal > 0 ? Math.min(100, (realWith / nominal) * 100) : 0,
    };
  }, [amount, hours, feeRate, taxRate, toolCost, meetingHours, emailHours, revisionPercent]);

  const ni = "w-full rounded-xl border bg-background px-4 py-3 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary";
  const ri = "w-full accent-primary h-2 rounded-lg cursor-pointer bg-muted [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-lg [&::-webkit-slider-runnable-track]:bg-muted [&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-lg [&::-moz-range-track]:bg-muted [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:-mt-1.5 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer";

  const breakdowns = [
    { label: t("calcNetIncome"), val: r.net, pct: r.netPct, c: "bg-green-600 dark:bg-green-400", tc: "text-green-600 dark:text-green-400" },
    { label: t("calcFeeAmount"), val: r.feeAmount, pct: r.feePct, c: "bg-orange-600 dark:bg-orange-400", tc: "text-orange-600 dark:text-orange-400" },
    { label: t("calcTaxAmount"), val: r.taxAmount, pct: r.taxPct, c: "bg-red-600 dark:bg-red-400", tc: "text-red-600 dark:text-red-400" },
    { label: t("calcToolAmount"), val: toolCost, pct: r.toolPct, c: "bg-gray-600 dark:bg-gray-400", tc: "text-gray-600 dark:text-gray-400" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <FadeIn className="mb-8">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          {c("backToLanding")}
        </Link>
      </FadeIn>

      <FadeIn delay={0.05} className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-3 text-primary">
          <Calculator className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold mb-3">{c("title")}</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">{c("subtitle")}</p>
      </FadeIn>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Left: Input form */}
        <FadeIn delay={0.1} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">{t("calcInputAmount")} <span className="text-muted-foreground">(${amount})</span></label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">$</span>
              <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} min={0} step={100} className={`${ni} pl-9`} aria-label={t("calcInputAmount")} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t("calcInputHours")} <span className="text-muted-foreground">({hours}h)</span></label>
            <input type="number" value={hours} onChange={(e) => setHours(Number(e.target.value))} min={1} step={1} className={ni} aria-label={t("calcInputHours")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t("calcFeeLabel")} <span className="text-muted-foreground">({feeRate}%)</span></label>
            <input type="range" value={feeRate} onChange={(e) => setFeeRate(Number(e.target.value))} min={0} max={30} step={1} className={ri} aria-label={t("calcFeeLabel")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t("calcTaxLabel")} <span className="text-muted-foreground">({taxRate}%)</span></label>
            <input type="range" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} min={0} max={50} step={1} className={ri} aria-label={t("calcTaxLabel")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t("calcToolLabel")} <span className="text-muted-foreground">(${toolCost})</span></label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">$</span>
              <input type="number" value={toolCost} onChange={(e) => setToolCost(Number(e.target.value))} min={0} step={10} className={`${ni} pl-9`} aria-label={t("calcToolLabel")} />
            </div>
          </div>

          {/* Unbilled time section */}
          <div className="pt-5 border-t space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{c("unbilledTitle")}</h2>
            <div>
              <label className="block text-sm font-medium mb-2">{c("meetingHours")} <span className="text-muted-foreground">({meetingHours}h)</span></label>
              <input type="number" value={meetingHours} onChange={(e) => setMeetingHours(Number(e.target.value))} min={0} step={0.5} className={ni} aria-label={c("meetingHours")} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{c("emailHours")} <span className="text-muted-foreground">({emailHours}h)</span></label>
              <input type="number" value={emailHours} onChange={(e) => setEmailHours(Number(e.target.value))} min={0} step={0.5} className={ni} aria-label={c("emailHours")} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{c("revisionPercent")} <span className="text-muted-foreground">({revisionPercent}%)</span></label>
              <input type="range" value={revisionPercent} onChange={(e) => setRevisionPercent(Number(e.target.value))} min={0} max={60} step={1} className={ri} aria-label={c("revisionPercent")} />
            </div>
          </div>
        </FadeIn>

        {/* Right: Results panel */}
        <FadeIn delay={0.2} className="relative overflow-hidden rounded-[24px] border bg-card p-8">
          <BorderBeam size={250} duration={12} delay={9} />
          <div className="space-y-6">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{t("calcNominalLabel")}</span>
              <span className="font-mono">${r.nominal.toFixed(2)}</span>
            </div>

            {/* Real rate hero */}
            <div className="text-center py-5 border-y">
              <p className="text-sm text-muted-foreground mb-2">{t("calcResultLabel")}</p>
              <div className="text-5xl font-bold text-primary">
                $<NumberTicker value={r.realWith} decimalPlaces={2} />
              </div>
            </div>

            {/* Rate comparison bars */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">{c("comparison")}</p>
              {[
                { label: c("withoutUnbilled"), val: r.realWithout, bar: r.withoutBar, cls: "bg-blue-500" },
                { label: c("withUnbilled"), val: r.realWith, bar: r.withBar, cls: "bg-primary" },
              ].map(({ label, val, bar, cls }) => (
                <div key={label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{label}</span>
                    <span className="font-mono font-semibold">${val.toFixed(2)}</span>
                  </div>
                  <div className="h-3 bg-muted rounded overflow-hidden">
                    <div className={`h-full ${cls}`} style={{ width: `${bar}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Cost breakdown bars */}
            <div className="space-y-2">
              {breakdowns.map(({ label, val, pct, c: cls, tc }) => (
                <div key={label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className={tc}>{label}</span>
                    <span className="font-mono">${val.toFixed(0)}</span>
                  </div>
                  <div className="h-3 bg-muted rounded overflow-hidden">
                    <div className={`h-full ${cls}`} style={{ width: `${Math.max(0, pct)}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Unbilled summary */}
            <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm text-center">
              <p>
                <span className="font-semibold">{r.totalUnbilled}h</span> {c("totalUnbilled")}{" "}
                <span className="text-destructive font-medium">= {r.timeLoss}%</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t("calcLossMessage", { percent: r.lossPercent })}
              </p>
            </div>

            {/* CTA */}
            <div className="space-y-2 pt-1">
              <Link href="/login" className="block w-full">
                <ShimmerButton className="w-full justify-center gap-2 text-sm font-semibold" shimmerDuration="2.5s">
                  {c("ctaLabel")}
                  <ArrowRight className="w-4 h-4" />
                </ShimmerButton>
              </Link>
              <p className="text-center text-xs text-muted-foreground">{c("saveResultDesc")}</p>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
