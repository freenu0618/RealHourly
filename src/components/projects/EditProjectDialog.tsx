"use client";

import React, { useState, useEffect } from "react";
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
import { toPercent, toRate } from "@/lib/utils/rate-conversion";

interface EditProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: {
    id: string;
    name: string;
    clientId: string | null;
    aliases: string[];
    startDate: string | null;
    expectedFee: number | null;
    expectedHours: number | null;
    currency: string;
    platformFeeRate: number | null;
    taxRate: number | null;
  };
  onUpdated: () => void;
}

interface ClientDTO {
  id: string;
  name: string;
}

const CURRENCIES = ["USD", "KRW", "EUR", "GBP", "JPY"];
const NO_CLIENT = "__none__";

export function EditProjectDialog({
  open,
  onOpenChange,
  project,
  onUpdated,
}: EditProjectDialogProps) {
  const t = useTranslations("projects");

  const [name, setName] = useState(project.name);
  const [clientId, setClientId] = useState(project.clientId ?? NO_CLIENT);
  const [aliasesText, setAliasesText] = useState(project.aliases.join(", "));
  const [startDate, setStartDate] = useState(project.startDate ?? "");
  const [expectedFee, setExpectedFee] = useState(
    project.expectedFee?.toString() || "",
  );
  const [expectedHours, setExpectedHours] = useState(
    project.expectedHours?.toString() || "",
  );
  const [currency, setCurrency] = useState(project.currency);
  const [platformFeeRate, setPlatformFeeRate] = useState(
    project.platformFeeRate ? toPercent(project.platformFeeRate).toString() : "",
  );
  const [taxRate, setTaxRate] = useState(
    project.taxRate ? toPercent(project.taxRate).toString() : "",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [clients, setClients] = useState<ClientDTO[]>([]);

  useEffect(() => {
    if (!open) return;
    fetch("/api/clients")
      .then((r) => r.json())
      .then((json) => setClients(json.data ?? []))
      .catch(() => {});
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error(t("nameRequired"));
      return;
    }

    const aliases = aliasesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    setIsSaving(true);
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          clientId: clientId === NO_CLIENT ? null : clientId,
          aliases,
          startDate: startDate || null,
          expectedFee: expectedFee ? parseFloat(expectedFee) : null,
          expectedHours: expectedHours ? parseFloat(expectedHours) : null,
          currency,
          platformFeeRate: platformFeeRate
            ? toRate(parseFloat(platformFeeRate))
            : null,
          taxRate: taxRate ? toRate(parseFloat(taxRate)) : null,
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
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
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

          <div className="space-y-2">
            <Label htmlFor="client">{t("client")}</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger id="client" className="rounded-xl">
                <SelectValue placeholder={t("selectClient")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CLIENT}>{t("noClient")}</SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="aliases">{t("aliases")}</Label>
            <Input
              id="aliases"
              value={aliasesText}
              onChange={(e) => setAliasesText(e.target.value)}
              placeholder={t("aliasesPlaceholder")}
              className="rounded-xl"
            />
            <p className="text-xs text-muted-foreground">{t("aliasesHint")}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">{t("startDate")}</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
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
              <Label htmlFor="platformFeeRate">
                {t("platformFeeRate")} (%)
              </Label>
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
