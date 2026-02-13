"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProfitabilityPreview } from "@/components/projects/ProfitabilityPreview";

interface FormValues {
  name: string;
  clientName: string;
  aliasesText: string;
  expectedFee: number;
  expectedHours: number;
  currency: string;
  platformFeePreset: string;
  platformFeeRate: number;
  taxEnabled: boolean;
  taxRate: number;
  fixedCostAmount: number;
  agreedRevisionCount: string;
}

const PRESET_LABELS: Record<string, string> = {
  none: "None (0%)",
  upwork: "Upwork (10%)",
  fiverr: "Fiverr (20%)",
  kmong: "\uD06C\uBABD (20%)",
  soomgo: "\uC228\uACE0 (20%)",
  custom: "Custom",
};

export function CreateProjectDialog() {
  const t = useTranslations("projects");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [avgRealHourly, setAvgRealHourly] = useState<number | null>(null);

  const fetchAvgRate = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) return;
      const { data } = await res.json();
      const withRate = (data as { expectedFee: number; expectedHours: number; platformFeeRate: number; taxRate: number }[])
        .filter((p) => p.expectedFee > 0 && p.expectedHours > 0);
      if (withRate.length === 0) return;
      const avg = withRate.reduce((sum, p) => {
        const afterComm = p.expectedFee * (1 - p.platformFeeRate);
        const afterTax = afterComm * (1 - p.taxRate);
        return sum + afterTax / p.expectedHours;
      }, 0) / withRate.length;
      setAvgRealHourly(Math.round(avg * 100) / 100);
    } catch { /* non-critical */ }
  }, []);

  useEffect(() => {
    if (open) fetchAvgRate();
  }, [open, fetchAvgRate]);

  const { register, handleSubmit, watch, setValue, formState } =
    useForm<FormValues>({
      defaultValues: {
        name: "",
        clientName: "",
        aliasesText: "",
        expectedFee: 0,
        expectedHours: 0,
        currency: "USD",
        platformFeePreset: "none",
        platformFeeRate: 0,
        taxEnabled: true,
        taxRate: 3.3,
        fixedCostAmount: 0,
        agreedRevisionCount: "",
      },
    });

  const preset = watch("platformFeePreset");
  const taxEnabled = watch("taxEnabled");
  const watchedFee = watch("expectedFee");
  const watchedHours = watch("expectedHours");
  const watchedCurrency = watch("currency");
  const watchedTaxRate = watch("taxRate");
  const watchedFixedCost = watch("fixedCostAmount");
  const watchedCustomRate = watch("platformFeeRate");

  const PRESET_RATES: Record<string, number> = {
    none: 0,
    upwork: 0.1,
    fiverr: 0.2,
    kmong: 0.2,
    soomgo: 0.2,
    custom: watchedCustomRate || 0,
  };
  const effectivePlatformFeeRate = PRESET_RATES[preset] ?? 0;
  const effectiveTaxRate = taxEnabled ? (watchedTaxRate || 0) / 100 : 0;
  const showPreview = watchedFee > 0 && watchedHours > 0;

  async function onSubmit(values: FormValues) {
    try {
      const aliases = values.aliasesText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          clientName: values.clientName || undefined,
          aliases: aliases.length > 0 ? aliases : undefined,
          expectedFee: values.expectedFee,
          expectedHours: values.expectedHours,
          currency: values.currency,
          platformFeePreset: values.platformFeePreset,
          platformFeeRate: values.platformFeeRate,
          taxEnabled: values.taxEnabled,
          taxRate: values.taxRate / 100,
          fixedCostAmount: values.fixedCostAmount > 0 ? values.fixedCostAmount : undefined,
          fixedCostType: values.fixedCostAmount > 0 ? "misc" : undefined,
          agreedRevisionCount: values.agreedRevisionCount
            ? parseInt(values.agreedRevisionCount, 10)
            : null,
        }),
      });

      if (!res.ok) throw new Error();

      const { data } = await res.json();
      toast.success(t("created"));
      setOpen(false);
      router.push(`/projects/${data.id}`);
    } catch {
      toast.error(t("createFailed"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 rounded-xl bg-primary font-bold shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md">
          <span className="text-base">{"\u2728"}</span>
          {t("create")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{"\uD83D\uDCC1"} {t("create")}</DialogTitle>
          <DialogDescription className="sr-only">{t("create")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <Label>{t("name")}</Label>
            <Input
              {...register("name", { required: true })}
              className="rounded-xl"
              placeholder="e.g. Website Redesign"
            />
          </div>

          {/* Client Name (optional) */}
          <div className="space-y-1.5">
            <Label>{t("clientName")}</Label>
            <Input
              {...register("clientName")}
              className="rounded-xl"
              placeholder="e.g. ABC Corp"
            />
          </div>

          {/* Aliases (optional) */}
          <div className="space-y-1.5">
            <Label>{t("aliases")}</Label>
            <Input
              {...register("aliasesText")}
              className="rounded-xl"
              placeholder={t("aliasesPlaceholder")}
            />
            <p className="text-xs text-muted-foreground">
              {t("aliasesHint")}
            </p>
          </div>

          {/* Fee + Hours + Currency */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>{t("expectedFee")}</Label>
              <Input
                type="number"
                step="0.01"
                min={0}
                onWheel={(e) => e.currentTarget.blur()}
                {...register("expectedFee", { valueAsNumber: true, min: 0 })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("expectedHours")}</Label>
              <Input
                type="number"
                min={0}
                onWheel={(e) => e.currentTarget.blur()}
                {...register("expectedHours", { valueAsNumber: true, min: 0 })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("currency")}</Label>
              <Select
                value={watch("currency")}
                onValueChange={(v) => setValue("currency", v)}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["USD", "KRW", "EUR", "GBP", "JPY"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Platform Fee Preset */}
          <div className="space-y-1.5">
            <Label>{t("platformFee")}</Label>
            <Select
              value={preset}
              onValueChange={(v) => setValue("platformFeePreset", v)}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PRESET_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {preset === "custom" && (
              <Input
                type="number"
                step="0.01"
                min={0}
                max={1}
                placeholder="0.15 = 15%"
                onWheel={(e) => e.currentTarget.blur()}
                {...register("platformFeeRate", { valueAsNumber: true })}
                className="mt-1 rounded-xl"
              />
            )}
          </div>

          {/* Tax */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="taxEnabled"
              {...register("taxEnabled")}
              className="size-4 rounded"
            />
            <Label htmlFor="taxEnabled">{t("taxEnabled")}</Label>
            {taxEnabled && (
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  step="0.1"
                  min={0}
                  max={100}
                  onWheel={(e) => e.currentTarget.blur()}
                  {...register("taxRate", { valueAsNumber: true })}
                  className="w-20 rounded-xl"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            )}
          </div>

          {/* Agreed Revision Count */}
          <div className="space-y-1.5">
            <Label>{t("agreedRevisionCount")}</Label>
            <Input
              type="number"
              min={0}
              max={50}
              step={1}
              onWheel={(e) => e.currentTarget.blur()}
              {...register("agreedRevisionCount")}
              className="rounded-xl"
              placeholder={t("agreedRevisionCountPlaceholder")}
            />
            <p className="text-xs text-muted-foreground">
              {t("agreedRevisionCountHint")}
            </p>
          </div>

          {/* Fixed Cost */}
          <div className="space-y-1.5">
            <Label>{t("monthlyFixedCost")}</Label>
            <Input
              type="number"
              step="0.01"
              min={0}
              onWheel={(e) => e.currentTarget.blur()}
              {...register("fixedCostAmount", { valueAsNumber: true, min: 0 })}
              className="rounded-xl"
            />
          </div>

          {showPreview && (
            <ProfitabilityPreview
              expectedFee={watchedFee}
              expectedHours={watchedHours}
              platformFeeRate={effectivePlatformFeeRate}
              taxRate={effectiveTaxRate}
              fixedCostAmount={watchedFixedCost || 0}
              currency={watchedCurrency}
              avgRealHourly={avgRealHourly}
            />
          )}

          <Button
            type="submit"
            className="w-full rounded-xl bg-primary py-3 font-bold shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/30 active:scale-[0.98]"
            disabled={formState.isSubmitting}
          >
            {t("create")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
