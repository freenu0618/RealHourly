"use client";

import { useState } from "react";
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
import { Plus } from "lucide-react";

interface FormValues {
  name: string;
  expectedFee: number;
  expectedHours: number;
  currency: string;
  platformFeePreset: string;
  platformFeeRate: number;
  taxEnabled: boolean;
  taxRate: number;
  fixedCostAmount: number;
}

const PRESET_LABELS: Record<string, string> = {
  none: "None (0%)",
  upwork: "Upwork (10%)",
  fiverr: "Fiverr (20%)",
  kmong: "크몽 (20%)",
  custom: "Custom",
};

export function CreateProjectDialog() {
  const t = useTranslations("projects");
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, watch, setValue, formState } =
    useForm<FormValues>({
      defaultValues: {
        name: "",
        expectedFee: 0,
        expectedHours: 0,
        currency: "USD",
        platformFeePreset: "none",
        platformFeeRate: 0,
        taxEnabled: true,
        taxRate: 0.033,
        fixedCostAmount: 0,
      },
    });

  const preset = watch("platformFeePreset");
  const taxEnabled = watch("taxEnabled");

  async function onSubmit(values: FormValues) {
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          expectedFee: values.expectedFee,
          expectedHours: values.expectedHours,
          currency: values.currency,
          platformFeePreset: values.platformFeePreset,
          platformFeeRate: values.platformFeeRate,
          taxEnabled: values.taxEnabled,
          taxRate: values.taxRate,
          fixedCostAmount: values.fixedCostAmount > 0 ? values.fixedCostAmount : undefined,
          fixedCostType: values.fixedCostAmount > 0 ? "misc" : undefined,
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
        <Button className="gap-2">
          <Plus className="size-4" />
          {t("create")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("create")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <Label>{t("name")}</Label>
            <Input {...register("name", { required: true })} />
          </div>

          {/* Fee + Hours + Currency */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>{t("expectedFee")}</Label>
              <Input
                type="number"
                step="0.01"
                {...register("expectedFee", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-1">
              <Label>{t("expectedHours")}</Label>
              <Input
                type="number"
                {...register("expectedHours", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-1">
              <Label>{t("currency")}</Label>
              <Select
                value={watch("currency")}
                onValueChange={(v) => setValue("currency", v)}
              >
                <SelectTrigger>
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
          <div className="space-y-1">
            <Label>{t("platformFee")}</Label>
            <Select
              value={preset}
              onValueChange={(v) => setValue("platformFeePreset", v)}
            >
              <SelectTrigger>
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
                {...register("platformFeeRate", { valueAsNumber: true })}
                className="mt-1"
              />
            )}
          </div>

          {/* Tax */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="taxEnabled"
              {...register("taxEnabled")}
              className="size-4"
            />
            <Label htmlFor="taxEnabled">{t("taxEnabled")}</Label>
            {taxEnabled && (
              <Input
                type="number"
                step="0.001"
                min={0}
                max={1}
                placeholder="0.033 = 3.3%"
                {...register("taxRate", { valueAsNumber: true })}
                className="w-28"
              />
            )}
          </div>

          {/* Fixed Cost */}
          <div className="space-y-1">
            <Label>{t("monthlyFixedCost")}</Label>
            <Input
              type="number"
              step="0.01"
              {...register("fixedCostAmount", { valueAsNumber: true })}
            />
          </div>

          <Button type="submit" className="w-full" disabled={formState.isSubmitting}>
            {t("create")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
