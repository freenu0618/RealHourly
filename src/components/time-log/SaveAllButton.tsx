"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDraftStore } from "@/store/use-draft-store";

interface SaveAllButtonProps {
  onSaved: () => void;
}

export function SaveAllButton({ onSaved }: SaveAllButtonProps) {
  const t = useTranslations("timeLog");
  const { entries, canSaveAll, clearAll } = useDraftStore();
  const [saving, setSaving] = useState(false);

  const enabled = canSaveAll() && entries.length > 0 && !saving;

  async function handleSave() {
    setSaving(true);
    try {
      const payload = entries.map((e) => ({
        projectId: e.matchedProjectId!,
        date: e.date,
        minutes: e.durationMinutes!,
        category: e.category,
        intent: e.intent,
        taskDescription: e.taskDescription,
        sourceText: e.projectNameRaw,
        issues: e.issues,
      }));

      const res = await fetch("/api/time/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: payload }),
      });

      if (!res.ok) throw new Error("Save failed");

      const { data } = await res.json();
      const plannedCount = entries.filter((e) => e.intent === "planned").length;

      toast.success(t("saved", { count: data.inserted }));
      if (plannedCount > 0) {
        toast.info(t("savedPlanned", { count: plannedCount }));
      }

      clearAll();
      onSaved();
    } catch {
      toast.error(t("parseFailed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Button
      onClick={handleSave}
      disabled={!enabled}
      size="lg"
      className="gap-2"
    >
      {saving ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          {t("saving")}
        </>
      ) : (
        <>
          <Save className="size-4" />
          {entries.length > 0
            ? t("saveCount", { count: entries.length })
            : t("saveAll")}
        </>
      )}
    </Button>
  );
}
