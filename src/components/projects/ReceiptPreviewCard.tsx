"use client";

import { useState } from "react";
import Image from "next/image";
import { AlertTriangle, Save, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ParsedReceipt } from "@/lib/validators/receipt";

const COST_TYPES = ["platform_fee", "tax", "tool", "contractor", "misc"] as const;

interface ReceiptPreviewCardProps {
  projectId: string;
  parsed: ParsedReceipt;
  thumbnail: string;
  onSaved: () => void;
  onCancel: () => void;
}

export function ReceiptPreviewCard({
  projectId,
  parsed,
  thumbnail,
  onSaved,
  onCancel,
}: ReceiptPreviewCardProps) {
  const t = useTranslations("receipt");
  const tProjects = useTranslations("projects");

  const [amount, setAmount] = useState(String(parsed.amount));
  const [date, setDate] = useState(parsed.date ?? "");
  const [costType, setCostType] = useState(parsed.costType);
  const [notes, setNotes] = useState(parsed.notes);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      toast.error(tProjects("amountRequired"));
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/cost-entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numAmount,
          costType,
          date: date || undefined,
          notes: notes.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(tProjects("costAdded"));
      onSaved();
    } catch {
      toast.error(tProjects("addFailed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-primary/30 bg-primary/5 p-4">
      <div className="flex items-start gap-3">
        {/* Thumbnail */}
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border">
          <Image src={thumbnail} alt="Receipt" fill className="object-cover" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium">{t("extracted")}</p>
          {parsed.confidence < 0.7 && (
            <Badge variant="outline" className="gap-1 border-amber-300 bg-amber-50 text-amber-700">
              <AlertTriangle className="size-3" />
              {t("lowConfidence")}
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="icon" className="size-8" onClick={onCancel}>
          <X className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">{tProjects("amount")}</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="rounded-lg"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{tProjects("date")}</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{tProjects("costType.label")}</Label>
          <Select value={costType} onValueChange={(v) => setCostType(v as typeof costType)}>
            <SelectTrigger className="rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COST_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {tProjects(`costType.${type}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{tProjects("notes")}</Label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="rounded-lg"
            placeholder={tProjects("notesOptional")}
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
          {t("cancel")}
        </Button>
        <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1">
          <Save className="size-3" />
          {saving ? tProjects("saving") : t("save")}
        </Button>
      </div>
    </div>
  );
}
