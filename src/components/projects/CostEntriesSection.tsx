"use client";

import React, { useState, useEffect } from "react";
import { DollarSign, Pencil, Trash2, Plus, Camera } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReceiptUploader } from "./ReceiptUploader";
import { ReceiptPreviewCard } from "./ReceiptPreviewCard";
import type { ParsedReceipt } from "@/lib/validators/receipt";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/money/currency";

/**
 * CostEntriesSection
 *
 * @description Displays and manages cost entries for a project
 * @example
 * <CostEntriesSection
 *   projectId="123"
 *   currency="USD"
 *   isEditable={true}
 * />
 */
interface CostEntriesSectionProps {
  projectId: string;
  currency: string;
  isEditable: boolean;
}

interface CostEntry {
  id: string;
  amount: number;
  costType: string;
  notes: string | null;
  date: string | null;
}

const COST_TYPES = ["tool", "contractor", "misc"];

export function CostEntriesSection({
  projectId,
  currency,
  isEditable,
}: CostEntriesSectionProps) {
  const t = useTranslations("projects");
  const tReceipt = useTranslations("receipt");

  const [costEntries, setCostEntries] = useState<CostEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showReceiptUploader, setShowReceiptUploader] = useState(false);
  const [receiptResult, setReceiptResult] = useState<{ parsed: ParsedReceipt; thumbnail: string } | null>(null);

  const [newAmount, setNewAmount] = useState("");
  const [newCostType, setNewCostType] = useState<string>("tool");
  const [newNotes, setNewNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchCostEntries = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/cost-entries`);
      if (!response.ok) throw new Error("Failed to fetch cost entries");
      const data = await response.json();
      setCostEntries(data.data || []);
    } catch (error) {
      toast.error(t("fetchFailed"));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCostEntries();
  }, [projectId]);

  const handleDelete = async (costEntryId: string) => {
    try {
      const response = await fetch(`/api/cost-entries/${costEntryId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete cost entry");

      toast.success(t("costDeleted"));
      fetchCostEntries();
    } catch (error) {
      toast.error(t("deleteFailed"));
      console.error(error);
    }
  };

  const handleAddCost = async () => {
    if (!newAmount || parseFloat(newAmount) <= 0) {
      toast.error(t("amountRequired"));
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/cost-entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(newAmount),
          costType: newCostType,
          notes: newNotes.trim() || null,
        }),
      });

      if (!response.ok) throw new Error("Failed to add cost entry");

      toast.success(t("costAdded"));
      setIsAddDialogOpen(false);
      setNewAmount("");
      setNewCostType("tool");
      setNewNotes("");
      fetchCostEntries();
    } catch (error) {
      toast.error(t("addFailed"));
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="rounded-[20px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {t("costEntries")}
          </CardTitle>
          {isEditable && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => setShowReceiptUploader((v) => !v)}
              >
                <Camera className="h-4 w-4 mr-1" />
                {tReceipt("upload")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                {t("addCost")}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Receipt uploader */}
        {isEditable && showReceiptUploader && !receiptResult && (
          <ReceiptUploader
            projectId={projectId}
            currency={currency}
            onParsed={(parsed, thumbnail) => {
              setReceiptResult({ parsed, thumbnail });
              setShowReceiptUploader(false);
            }}
          />
        )}

        {/* Receipt HITL preview */}
        {receiptResult && (
          <ReceiptPreviewCard
            projectId={projectId}
            parsed={receiptResult.parsed}
            thumbnail={receiptResult.thumbnail}
            onSaved={() => {
              setReceiptResult(null);
              fetchCostEntries();
            }}
            onCancel={() => setReceiptResult(null)}
          />
        )}

        {isLoading ? (
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        ) : costEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noCosts")}</p>
        ) : (
          <div className="space-y-3">
            {costEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 rounded-xl border"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{t(`costType.${entry.costType}`)}</Badge>
                    <span className="font-semibold">
                      {formatCurrency(entry.amount, currency, "en")}
                    </span>
                  </div>
                  {entry.notes && (
                    <p className="text-sm text-muted-foreground">{entry.notes}</p>
                  )}
                  {entry.date && (
                    <p className="text-xs text-muted-foreground">{entry.date}</p>
                  )}
                </div>
                {isEditable && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDelete(entry.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("addCost")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">{t("amount")}</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="costType">{t("costType.label")}</Label>
              <Select value={newCostType} onValueChange={setNewCostType}>
                <SelectTrigger id="costType" className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COST_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(`costType.${type}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t("notes")}</Label>
              <Input
                id="notes"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="rounded-xl"
                placeholder={t("notesOptional")}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsAddDialogOpen(false)}
              disabled={isSaving}
            >
              {t("cancel")}
            </Button>
            <Button onClick={handleAddCost} disabled={isSaving}>
              {isSaving ? t("saving") : t("add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
