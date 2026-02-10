"use client";

import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
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
import { DatePickerField } from "./DatePickerField";
import { CATEGORIES } from "@/types/time-log";
import type { Category } from "@/types/time-log";

const ManualEntrySchema = z.object({
  projectId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  minutes: z.number().int().min(1).max(1440),
  category: z.enum(CATEGORIES),
  taskDescription: z.string().min(1),
});

type ManualEntryValues = z.infer<typeof ManualEntrySchema>;

interface ManualEntryFormProps {
  projects: { id: string; name: string }[];
  onCancel: () => void;
}

export function ManualEntryForm({ projects, onCancel }: ManualEntryFormProps) {
  const t = useTranslations("timeLog");
  const { register, handleSubmit, setValue, watch, formState } =
    useForm<ManualEntryValues>({
      defaultValues: {
        projectId: "",
        date: new Date().toISOString().split("T")[0],
        minutes: 60,
        category: "development" as Category,
        taskDescription: "",
      },
    });

  const CATEGORY_EMOJI: Record<Category, string> = {
    planning: "\uD83D\uDCCB",
    design: "\uD83C\uDFA8",
    development: "\uD83D\uDCBB",
    meeting: "\uD83E\uDD1D",
    revision: "\uD83D\uDD04",
    admin: "\uD83D\uDCC2",
    email: "\uD83D\uDCE7",
    research: "\uD83D\uDD0D",
    other: "\uD83D\uDCE6",
  };

  const categoryLabelMap: Record<Category, string> = {
    planning: `${CATEGORY_EMOJI.planning} ${t("categoryPlanning")}`,
    design: `${CATEGORY_EMOJI.design} ${t("categoryDesign")}`,
    development: `${CATEGORY_EMOJI.development} ${t("categoryDevelopment")}`,
    meeting: `${CATEGORY_EMOJI.meeting} ${t("categoryMeeting")}`,
    revision: `${CATEGORY_EMOJI.revision} ${t("categoryRevision")}`,
    admin: `${CATEGORY_EMOJI.admin} ${t("categoryAdmin")}`,
    email: `${CATEGORY_EMOJI.email} ${t("categoryEmail")}`,
    research: `${CATEGORY_EMOJI.research} ${t("categoryResearch")}`,
    other: `${CATEGORY_EMOJI.other} ${t("categoryOther")}`,
  };

  async function onSubmit(values: ManualEntryValues) {
    try {
      const res = await fetch("/api/time/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entries: [
            {
              projectId: values.projectId,
              date: values.date,
              minutes: values.minutes,
              category: values.category,
              intent: "done",
              taskDescription: values.taskDescription,
              issues: [],
            },
          ],
        }),
      });

      if (!res.ok) throw new Error("Save failed");

      toast.success(t("saved", { count: 1 }));
      onCancel();
    } catch {
      toast.error(t("parseFailed"));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border p-4">
      <h3 className="text-sm font-semibold">{t("manualEntry")}</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1">
          <Label className="text-xs">{t("project")}</Label>
          <Select
            value={watch("projectId")}
            onValueChange={(v) => setValue("projectId", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("selectProject")} />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">{t("date")}</Label>
          <DatePickerField
            value={watch("date")}
            onChange={(d) => setValue("date", d)}
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">{t("duration")}</Label>
          <Input
            type="number"
            min={1}
            max={1440}
            {...register("minutes", { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">{t("category")}</Label>
          <Select
            value={watch("category")}
            onValueChange={(v) => setValue("category", v as Category)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {categoryLabelMap[cat]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 space-y-1">
          <Label className="text-xs">{t("task")}</Label>
          <Input {...register("taskDescription")} />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={formState.isSubmitting}>
          {t("saveAll")}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("chipToday")}
        </Button>
      </div>
    </form>
  );
}
