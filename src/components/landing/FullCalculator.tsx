"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FadeIn } from "@/components/ui/fade-in";
import { NumberTicker } from "@/components/ui/number-ticker";
import { BorderBeam } from "@/components/ui/border-beam";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calculator, Trophy, Target } from "lucide-react";
import { toast } from "sonner";

const PLATFORM_PRESETS = [
  { name: "Upwork", fee: 10, icon: "🟢" },
  { name: "Fiverr", fee: 20, icon: "🟢" },
  { name: "크몽", fee: 20, icon: "🟠" },
  { name: "숨고", fee: 15, icon: "🔵" },
  { name: "Toptal", fee: 0, icon: "🟣" },
  { name: "Direct", fee: 0, icon: "⚪" },
  { name: "Custom", fee: null, icon: "⚙️" },
] as const;

const MONTHS_PER_WEEK = 4.33;

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
  const [feeRate, setFeeRate] = useState(10);
  const [selectedPreset, setSelectedPreset] = useState<string>("Upwork");
  const [taxRate, setTaxRate] = useState(10);
  const [toolCost, setToolCost] = useState(50);
  const [meetingHours, setMeetingHours] = useState(3);
  const [emailHours, setEmailHours] = useState(2);
  const [revisionPercent, setRevisionPercent] = useState(15);
  const [targetIncome, setTargetIncome] = useState(6000);
  const [workingDays, setWorkingDays] = useState(20);
  const [maxHoursDay, setMaxHoursDay] = useState(6);

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
      feeAmount,
      taxAmount,
      net,
      nominal,
      realWith,
      realWithout,
      totalUnbilled,
      lossPercent: amount > 0 ? Math.round((totalCost / amount) * 100) : 0,
      timeLoss: adjustedHours > 0 ? Math.round((totalUnbilled / adjustedHours) * 100) : 0,
      netPct: pct(net),
      feePct: pct(feeAmount),
      taxPct: pct(taxAmount),
      toolPct: pct(toolCost),
      withoutBar: nominal > 0 ? Math.min(100, (realWithout / nominal) * 100) : 0,
      withBar: nominal > 0 ? Math.min(100, (realWith / nominal) * 100) : 0,
    };
  }, [amount, hours, feeRate, taxRate, toolCost, meetingHours, emailHours, revisionPercent]);

  const platformComparison = useMemo(() => {
    return PLATFORM_PRESETS
      .filter((preset) => preset.fee !== null)
      .map((preset) => {
        const feeAmount = amount * ((preset.fee ?? 0) / 100);
        const taxAmount = amount * (taxRate / 100);
        const revisionHours = hours * (revisionPercent / 100);
        const adjustedHours = hours + meetingHours + emailHours + revisionHours;
        const net = amount - feeAmount - taxAmount - toolCost;
        const realRate = adjustedHours > 0 ? net / adjustedHours : 0;

        return {
          name: preset.name,
          icon: preset.icon,
          fee: preset.fee ?? 0,
          net,
          realRate,
        };
      })
      .sort((a, b) => b.realRate - a.realRate);
  }, [amount, hours, taxRate, toolCost, revisionPercent, meetingHours, emailHours]);

  const goal = useMemo(() => {
    const monthlyCapacity = workingDays * maxHoursDay;
    const monthlyAdminHours = (meetingHours + emailHours) * MONTHS_PER_WEEK;
    const revisionMultiplier = 1 + revisionPercent / 100;
    const availableBillableHours = Math.max(0, (monthlyCapacity - monthlyAdminHours) / revisionMultiplier);
    const retentionRate = Math.max(0.05, 1 - feeRate / 100 - taxRate / 100);
    const requiredGross = (targetIncome + toolCost) / retentionRate;
    const requiredRate = availableBillableHours > 0 ? requiredGross / availableBillableHours : 0;
    const requiredHoursWeek = availableBillableHours / MONTHS_PER_WEEK;
    const projectsNeeded = r.net > 0 ? targetIncome / r.net : 0;
    const rateRatio = r.nominal > 0 ? requiredRate / r.nominal : Infinity;
    const status = rateRatio <= 1 ? "goalAchievable" : rateRatio <= 1.3 ? "goalTight" : "goalExceeds";

    return {
      monthlyCapacity,
      availableBillableHours,
      requiredRate,
      requiredHoursWeek,
      projectsNeeded,
      status,
    };
  }, [workingDays, maxHoursDay, meetingHours, emailHours, revisionPercent, feeRate, taxRate, targetIncome, toolCost, r.net, r.nominal]);

  const handlePresetClick = useCallback((preset: (typeof PLATFORM_PRESETS)[number]) => {
    setSelectedPreset(preset.name);
    if (preset.fee !== null) {
      setFeeRate(preset.fee);
    }
  }, []);

  const handleShare = useCallback(() => {
    const text = `My contract rate: $${r.nominal.toFixed(0)}/hr → Real rate: $${r.realWith.toFixed(0)}/hr (after fees, taxes & hidden time). Calculate yours at real-hourly.com`;
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => {
        toast.success(c("shareCopied"));
      });
    }
  }, [c, r.nominal, r.realWith]);

  const ni = "w-full rounded-xl border bg-background px-4 py-3 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary";

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
            <div className="flex flex-wrap gap-2 mb-3">
              {PLATFORM_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    selectedPreset === preset.name
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary hover:text-foreground"
                  }`}
                >
                  <span>{preset.icon}</span>
                  <span>{preset.name}</span>
                  {preset.fee !== null && <span className="opacity-70">({preset.fee}%)</span>}
                </button>
              ))}
            </div>
            <Slider value={[feeRate]} onValueChange={(v) => { setFeeRate(v[0]); setSelectedPreset("Custom"); }} min={0} max={30} step={1} aria-label={t("calcFeeLabel")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t("calcTaxLabel")} <span className="text-muted-foreground">({taxRate}%)</span></label>
            <Slider value={[taxRate]} onValueChange={(v) => setTaxRate(v[0])} min={0} max={50} step={1} aria-label={t("calcTaxLabel")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t("calcToolLabel")} <span className="text-muted-foreground">(${toolCost})</span></label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">$</span>
              <input type="number" value={toolCost} onChange={(e) => setToolCost(Number(e.target.value))} min={0} step={10} className={`${ni} pl-9`} aria-label={t("calcToolLabel")} />
            </div>
          </div>

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
              <Slider value={[revisionPercent]} onValueChange={(v) => setRevisionPercent(v[0])} min={0} max={60} step={1} aria-label={c("revisionPercent")} />
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.2} className="relative overflow-hidden rounded-[24px] border bg-card p-8">
          <BorderBeam size={250} duration={12} delay={9} />
          <div className="space-y-6">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{t("calcNominalLabel")}</span>
              <span className="font-mono">${r.nominal.toFixed(2)}</span>
            </div>

            <div className="text-center py-5 border-y">
              <p className="text-sm text-muted-foreground mb-2">{t("calcResultLabel")}</p>
              <div className="text-5xl font-bold text-primary">
                $<NumberTicker value={r.realWith} decimalPlaces={2} />
              </div>
            </div>

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

            <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm text-center">
              <p>
                <span className="font-semibold">{r.totalUnbilled.toFixed(1)}h</span> {c("totalUnbilled")}{" "}
                <span className="text-destructive font-medium">= {r.timeLoss}%</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t("calcLossMessage", { percent: r.lossPercent })}
              </p>
            </div>

            <div className="flex justify-center">
              <Button variant="outline" size="sm" onClick={handleShare}>
                📊 {c("shareTitle")}
              </Button>
            </div>

            <div className="space-y-2 pt-1">
              <Link href="/login" className="block w-full">
                <ShimmerButton className="w-full justify-center gap-2 text-sm font-semibold" shimmerDuration="2.5s">
                  {c("ctaLabel")}
                  <ArrowRight className="w-4 h-4" />
                </ShimmerButton>
              </Link>
              <p className="text-center text-xs text-muted-foreground">{c("saveResultDesc")}</p>
            </div>

            <div className="mt-2 p-4 rounded-xl border bg-muted/50 text-center">
              <p className="text-sm text-muted-foreground mb-3">{c("trackCta")}</p>
              <Link href="/login">
                <ShimmerButton className="justify-center text-sm font-semibold" shimmerDuration="2.5s">
                  {c("trackCtaButton")}
                </ShimmerButton>
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>

      <FadeIn delay={0.25} className="mt-8 grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-[24px] border bg-card p-6">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-semibold">{c("comparePlatforms")}</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{c("comparePlatformsDesc")}</p>
          <div className="overflow-hidden rounded-2xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">{c("platformName")}</th>
                  <th className="px-4 py-3 text-right font-medium">{c("feePercent")}</th>
                  <th className="px-4 py-3 text-right font-medium">{c("netIncome")}</th>
                  <th className="px-4 py-3 text-right font-medium">{c("realRate")}</th>
                </tr>
              </thead>
              <tbody>
                {platformComparison.map((platform, index) => (
                  <tr key={platform.name} className="border-t">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 font-medium">
                        <span>{platform.icon}</span>
                        <span>{platform.name}</span>
                        {index === 0 && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                            {c("bestOption")}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{platform.fee}%</td>
                    <td className="px-4 py-3 text-right font-mono">${platform.net.toFixed(0)}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold">${platform.realRate.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-[24px] border bg-card p-6">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">{c("goalTitle")}</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{c("goalDesc")}</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{c("targetIncome")}</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">$</span>
                <input type="number" value={targetIncome} onChange={(e) => setTargetIncome(Number(e.target.value))} min={0} step={100} className={`${ni} pl-9`} aria-label={c("targetIncome")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{c("workingDays")}</label>
                <input type="number" value={workingDays} onChange={(e) => setWorkingDays(Number(e.target.value))} min={1} max={31} step={1} className={ni} aria-label={c("workingDays")} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{c("maxHoursDay")}</label>
                <input type="number" value={maxHoursDay} onChange={(e) => setMaxHoursDay(Number(e.target.value))} min={1} max={24} step={0.5} className={ni} aria-label={c("maxHoursDay")} />
              </div>
            </div>

            <div className="rounded-2xl bg-muted/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{c("requiredRate")}</span>
                <span className="text-2xl font-bold text-primary">${goal.requiredRate.toFixed(2)}{c("perHour")}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-background p-3 border">
                  <p className="text-muted-foreground mb-1">{c("requiredHoursWeek")}</p>
                  <p className="font-semibold">{goal.requiredHoursWeek.toFixed(1)} {c("hoursUnit")}</p>
                </div>
                <div className="rounded-xl bg-background p-3 border">
                  <p className="text-muted-foreground mb-1">{c("requiredProjects")}</p>
                  <p className="font-semibold">{goal.projectsNeeded.toFixed(1)} {c("projectsUnit")}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{c("billableCapacity")}</span>
                <span className="font-medium">{goal.availableBillableHours.toFixed(1)} / {goal.monthlyCapacity.toFixed(1)}h</span>
              </div>
              <div className="inline-flex rounded-full border px-3 py-1 text-xs font-semibold">
                {c(goal.status)}
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
