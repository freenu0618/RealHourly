"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FadeIn } from "@/components/ui/fade-in";
import { NumberTicker } from "@/components/ui/number-ticker";
import { BorderBeam } from "@/components/ui/border-beam";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";

const PLATFORM_PRESETS = [
  { name: "Upwork", fee: 10, icon: "🟢" },
  { name: "Fiverr", fee: 20, icon: "🟢" },
  { name: "크몽", fee: 20, icon: "🟠" },
  { name: "숨고", fee: 15, icon: "🔵" },
  { name: "Toptal", fee: 0, icon: "🟣" },
  { name: "Direct", fee: 0, icon: "⚪" },
  { name: "Custom", fee: null, icon: "⚙️" },
] as const;

export function InteractiveCalcSection() {
  const t = useTranslations("landing");

  // Simple inputs
  const [amount, setAmount] = useState(3000);
  const [hours, setHours] = useState(40);
  const [feeRate, setFeeRate] = useState(10);
  const [selectedPreset, setSelectedPreset] = useState<string>("Upwork");

  // Advanced inputs
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [taxRate, setTaxRate] = useState(10);
  const [toolCost, setToolCost] = useState(50);
  const [meetingHours, setMeetingHours] = useState(3);
  const [emailHours, setEmailHours] = useState(2);
  const [revisionPercent, setRevisionPercent] = useState(15);

  const {
    gross, feeAmount, taxAmount, totalCost, net,
    nominalRate, realRate, lossPercent,
    netPercent, feePercent, taxPercent, toolPercent,
  } = useMemo(() => {
    const gross = amount;
    const feeAmount = gross * (feeRate / 100);
    const taxAmount = gross * (taxRate / 100);
    const totalCost = feeAmount + taxAmount + toolCost;
    const net = gross - totalCost;
    const revisionHours = hours * (revisionPercent / 100);
    const totalUnbilled = showAdvanced ? (meetingHours + emailHours + revisionHours) : 0;
    const adjustedHours = hours + totalUnbilled;
    const nominalRate = hours > 0 ? gross / hours : 0;
    const realRate = adjustedHours > 0 ? net / adjustedHours : 0;
    const lossPercent = gross > 0 ? Math.round((totalCost / gross) * 100) : 0;
    const netPercent = gross > 0 ? (net / gross) * 100 : 0;
    const feePercent = gross > 0 ? (feeAmount / gross) * 100 : 0;
    const taxPercent = gross > 0 ? (taxAmount / gross) * 100 : 0;
    const toolPercent = gross > 0 ? (toolCost / gross) * 100 : 0;

    return { gross, feeAmount, taxAmount, totalCost, net, nominalRate, realRate, lossPercent, netPercent, feePercent, taxPercent, toolPercent };
  }, [amount, hours, feeRate, taxRate, toolCost, meetingHours, emailHours, revisionPercent, showAdvanced]);

  function handlePresetClick(preset: (typeof PLATFORM_PRESETS)[number]) {
    setSelectedPreset(preset.name);
    if (preset.fee !== null) {
      setFeeRate(preset.fee);
    }
  }

  const ni = "w-full rounded-xl border bg-background px-4 py-3 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary";

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
            {/* Simple: Project Amount */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("calcInputAmount")} <span className="text-muted-foreground">(${amount})</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min={0}
                  step={100}
                  className={`${ni} pl-9`}
                  aria-label={t("calcInputAmount")}
                />
              </div>
            </div>

            {/* Simple: Expected Hours */}
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
                className={ni}
                aria-label={t("calcInputHours")}
              />
            </div>

            {/* Simple: Platform Preset */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("calcFeeLabel")} <span className="text-muted-foreground">({feeRate}%)</span>
              </label>
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
              <Slider
                value={[feeRate]}
                onValueChange={(v) => { setFeeRate(v[0]); setSelectedPreset("Custom"); }}
                min={0}
                max={30}
                step={1}
                aria-label={t("calcFeeLabel")}
              />
            </div>

            {/* Advanced Options Toggle */}
            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced((v) => !v)}
                className="gap-1 text-xs"
              >
                {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {showAdvanced ? "Hide advanced options" : "Show advanced options"}
              </Button>
            </div>

            {/* Advanced Inputs */}
            {showAdvanced && (
              <div className="space-y-4 pt-2 border-t">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t("calcTaxLabel")} <span className="text-muted-foreground">({taxRate}%)</span>
                  </label>
                  <Slider
                    value={[taxRate]}
                    onValueChange={(v) => setTaxRate(v[0])}
                    min={0}
                    max={50}
                    step={1}
                    aria-label={t("calcTaxLabel")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t("calcToolLabel")} <span className="text-muted-foreground">(${toolCost})</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">$</span>
                    <input
                      type="number"
                      value={toolCost}
                      onChange={(e) => setToolCost(Number(e.target.value))}
                      min={0}
                      step={10}
                      className={`${ni} pl-9`}
                      aria-label={t("calcToolLabel")}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Meeting hours / week <span className="text-muted-foreground">({meetingHours}h)</span>
                  </label>
                  <input
                    type="number"
                    value={meetingHours}
                    onChange={(e) => setMeetingHours(Number(e.target.value))}
                    min={0}
                    step={0.5}
                    className={ni}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email / admin hours / week <span className="text-muted-foreground">({emailHours}h)</span>
                  </label>
                  <input
                    type="number"
                    value={emailHours}
                    onChange={(e) => setEmailHours(Number(e.target.value))}
                    min={0}
                    step={0.5}
                    className={ni}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Revision time <span className="text-muted-foreground">({revisionPercent}% of billed)</span>
                  </label>
                  <Slider
                    value={[revisionPercent]}
                    onValueChange={(v) => setRevisionPercent(v[0])}
                    min={0}
                    max={60}
                    step={1}
                  />
                </div>
              </div>
            )}
          </FadeIn>

          {/* Right: Results */}
          <FadeIn delay={0.2} className="relative overflow-hidden rounded-[24px] border bg-card p-8">
            <BorderBeam size={250} duration={12} delay={9} />

            <div className="space-y-6">
              {/* Comparison Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{t("calcNominalLabel")}</span>
                  <span className="font-mono">${nominalRate.toFixed(2)}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-muted-foreground/30" style={{ width: "100%" }} />
                </div>
              </div>

              {/* Real Rate (Large Number) */}
              <div className="text-center py-6 border-y">
                <p className="text-sm text-muted-foreground mb-2">{t("calcResultLabel")}</p>
                <div className="text-5xl font-bold text-primary">
                  $<NumberTicker value={realRate} decimalPlaces={2} />
                </div>
              </div>

              {/* Breakdown Bars */}
              <div className="space-y-3">
                {[
                  { label: t("calcNetIncome"), val: net, pct: netPercent, cls: "bg-green-600 dark:bg-green-400", tc: "text-green-600 dark:text-green-400" },
                  { label: t("calcFeeAmount"), val: feeAmount, pct: feePercent, cls: "bg-orange-600 dark:bg-orange-400", tc: "text-orange-600 dark:text-orange-400" },
                  { label: t("calcTaxAmount"), val: taxAmount, pct: taxPercent, cls: "bg-red-600 dark:bg-red-400", tc: "text-red-600 dark:text-red-400" },
                  { label: t("calcToolAmount"), val: toolCost, pct: toolPercent, cls: "bg-gray-600 dark:bg-gray-400", tc: "text-gray-600 dark:text-gray-400" },
                ].map(({ label, val, pct, cls, tc }) => (
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

              {/* Loss Message */}
              <div className="text-center text-sm text-destructive font-medium">
                {t("calcLossMessage", { percent: lossPercent })}
              </div>

              {/* CTA */}
              <Link href="/login?view=signup" className="block w-full">
                <ShimmerButton className="w-full justify-center gap-2 text-sm font-semibold" shimmerDuration="2.5s">
                  {t("calcCta")}
                  <ArrowRight className="w-4 h-4" />
                </ShimmerButton>
              </Link>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
