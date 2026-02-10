"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * EditProjectDialog
 *
 * @description Dialog for editing project details
 * @example
 * <EditProjectDialog
 *   open={true}
 *   onOpenChange={setOpen}
 *   project={projectData}
 *   onUpdated={() => refetch()}
 * />
 */
interface EditProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: {
    id: string;
    name: string;
    aliases: string[];
    expectedFee: number | null;
    expectedHours: number | null;
    currency: string;
    platformFeeRate: number | null;
    taxRate: number | null;
  };
  onUpdated: () => void;
}

const CURRENCIES = ["USD", "KRW", "EUR", "GBP", "JPY"];

export function EditProjectDialog({
  open,
  onOpenChange,
  project,
  onUpdated,
}: EditProjectDialogProps) {
  const t = useTranslations("projects");

  const [name, setName] = useState(project.name);
  const [expectedFee, setExpectedFee] = useState(project.expectedFee?.toString() || "");
  const [expectedHours, setExpectedHours] = useState(project.expectedHours?.toString() || "");
  const [currency, setCurrency] = useState(project.currency);
  const [platformFeeRate, setPlatformFeeRate] = useState(
    project.platformFeeRate ? (project.platformFeeRate * 100).toString() : ""
  );
  const [taxRate, setTaxRate] = useState(
    project.taxRate ? (project.taxRate * 100).toString() : ""
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error(t("nameRequired"));
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          expectedFee: expectedFee ? parseFloat(expectedFee) : null,
          expectedHours: expectedHours ? parseFloat(expectedHours) : null,
          currency,
          platformFeeRate: platformFeeRate ? parseFloat(platformFeeRate) / 100 : null,
          taxRate: taxRate ? parseFloat(taxRate) / 100 : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update project");
      }

      toast.success(t("updated"));
      onUpdated();
      onOpenChange(false);
    } catch (error) {
      toast.error(t("updateFailed"));
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("editProject")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("projectName")}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expectedFee">{t("expectedFee")}</Label>
              <Input
                id="expectedFee"
                type="number"
                min="0"
                step="0.01"
                value={expectedFee}
                onChange={(e) => setExpectedFee(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedHours">{t("expectedHours")}</Label>
              <Input
                id="expectedHours"
                type="number"
                min="0"
                step="0.1"
                value={expectedHours}
                onChange={(e) => setExpectedHours(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">{t("currency")}</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency" className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((curr) => (
                  <SelectItem key={curr} value={curr}>
                    {curr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platformFeeRate">{t("platformFeeRate")} (%)</Label>
              <Input
                id="platformFeeRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={platformFeeRate}
                onChange={(e) => setPlatformFeeRate(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxRate">{t("taxRate")} (%)</Label>
              <Input
                id="taxRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? t("saving") : t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
