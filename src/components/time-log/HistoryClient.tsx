"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Calendar, List, Download, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { exportToCSV, exportToJSON } from "@/lib/utils/export-entries";
import CalendarView from "./CalendarView";
import HistoryList from "./HistoryList";
import HistoryFilters from "./HistoryFilters";
import HistorySummary from "./HistorySummary";

interface HistoryEntry {
  id: string;
  date: string;
  minutes: number;
  category: string;
  intent: string;
  taskDescription: string;
  projectId: string;
  projectName: string;
  clientName: string | null;
}

interface Summary {
  totalMinutes: number;
  totalEntries: number;
  byCategory: { category: string; minutes: number; count: number }[];
  byProject: { projectId: string; projectName: string; minutes: number }[];
}

interface HistoryClientProps {
  projects: { id: string; name: string }[];
  locale: string;
}

function getMonthRange(date: Date) {
  const y = date.getFullYear();
  const m = date.getMonth();
  const from = `${y}-${String(m + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(y, m + 1, 0).getDate();
  const to = `${y}-${String(m + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { from, to };
}

type Tab = "calendar" | "list";

export default function HistoryClient({ projects, locale }: HistoryClientProps) {
  const t = useTranslations("history");
  const [tab, setTab] = useState<Tab>("calendar");
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalMinutes: 0,
    totalEntries: 0,
    byCategory: [],
    byProject: [],
  });
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [filterProject, setFilterProject] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchHistory = useCallback(
    async (from: string, to: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ from, to });
        if (filterProject) params.set("projectId", filterProject);
        if (filterCategory) params.set("category", filterCategory);

        const res = await fetch(`/api/time/history?${params}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setEntries(json.data.entries);
        setSummary(json.data.summary);
      } catch {
        toast.error(t("fetchError"));
      } finally {
        setLoading(false);
      }
    },
    [filterProject, filterCategory, t],
  );

  useEffect(() => {
    const { from, to } = getMonthRange(currentMonth);
    fetchHistory(from, to);
  }, [currentMonth, fetchHistory]);

  useEffect(() => {
    if (!selectMode || tab === "calendar") {
      setSelectedIds(new Set());
    }
  }, [selectMode, tab]);

  const handleEdit = async (
    entryId: string,
    data: { date?: string; minutes?: number; category?: string; taskDescription?: string; intent?: string },
  ) => {
    const res = await fetch(`/api/time/${entryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      toast.error(t("editError"));
      throw new Error("Failed to update");
    }
    toast.success(t("editSuccess"));
    const { from, to } = getMonthRange(currentMonth);
    await fetchHistory(from, to);
  };

  const handleDelete = async (entryId: string) => {
    const res = await fetch(`/api/time/${entryId}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error(t("deleteError"));
      throw new Error("Failed to delete");
    }
    toast.success(t("deleteSuccess"));
    const { from, to } = getMonthRange(currentMonth);
    await fetchHistory(from, to);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    const confirmed = window.confirm(
      t("bulkDeleteConfirm", { count: selectedIds.size })
    );
    if (!confirmed) return;

    const deletePromises = Array.from(selectedIds).map((id) =>
      fetch(`/api/time/${id}`, { method: "DELETE" })
        .then((res) => ({ id, success: res.ok }))
        .catch(() => ({ id, success: false }))
    );

    const results = await Promise.allSettled(deletePromises);
    const successCount = results.filter(
      (r) => r.status === "fulfilled" && r.value.success
    ).length;

    if (successCount > 0) {
      toast.success(t("bulkDeleteSuccess", { count: successCount }));
      setSelectedIds(new Set());
      const { from, to } = getMonthRange(currentMonth);
      await fetchHistory(from, to);
    } else {
      toast.error(t("deleteError"));
    }
  };

  const handleDuplicate = async (entry: HistoryEntry) => {
    const today = new Date().toISOString().slice(0, 10);
    try {
      const res = await fetch("/api/time/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entries: [
            {
              projectId: entry.projectId,
              date: today,
              minutes: entry.minutes,
              category: entry.category,
              intent: entry.intent,
              taskDescription: entry.taskDescription,
            },
          ],
        }),
      });
      if (!res.ok) throw new Error("Failed to duplicate");
      toast.success(t("duplicateSuccess"));
      const { from, to } = getMonthRange(currentMonth);
      await fetchHistory(from, to);
    } catch {
      toast.error(t("duplicateError"));
    }
  };

  const handleExportCSV = () => {
    exportToCSV(entries, currentMonth);
    toast.success(t("exportSuccess"));
  };

  const handleExportJSON = () => {
    exportToJSON(entries, currentMonth);
    toast.success(t("exportSuccess"));
  };

  const filteredByDate = selectedDate
    ? entries.filter((e) => e.date === selectedDate)
    : entries;

  const showBulkToolbar = selectMode && selectedIds.size > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <div className="flex items-center gap-3">
          {tab === "list" && (
            <Button
              variant={selectMode ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectMode(!selectMode);
                if (selectMode) setSelectedIds(new Set());
              }}
            >
              <CheckSquare className="size-4 mr-1.5" />
              {t("selectMode")}
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="size-4 mr-1.5" />
                {t("export")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportCSV}>
                {t("exportCSV")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportJSON}>
                {t("exportJSON")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex rounded-full bg-muted p-1">
            <button
              type="button"
              onClick={() => setTab("calendar")}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all",
                tab === "calendar" ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Calendar className="size-4" />
              {t("calendarTab")}
            </button>
            <button
              type="button"
              onClick={() => setTab("list")}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all",
                tab === "list" ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <List className="size-4" />
              {t("listTab")}
            </button>
          </div>
        </div>
      </div>

      <HistoryFilters
        projects={projects}
        filterProject={filterProject}
        onProjectChange={setFilterProject}
        filterCategory={filterCategory}
        onCategoryChange={setFilterCategory}
        locale={locale}
      />

      <HistorySummary summary={summary} locale={locale} loading={loading} />

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          {t("loading")}
        </div>
      ) : tab === "calendar" ? (
        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-4 shadow-sm md:p-6">
            <CalendarView
              entries={entries}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              locale={locale}
            />
          </div>
          {selectedDate && (
            <div>
              <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                {selectedDate} {t("selectedEntries")}
              </h2>
              <HistoryList
                entries={filteredByDate}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                locale={locale}
              />
            </div>
          )}
        </div>
      ) : (
        <HistoryList
          entries={entries}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          locale={locale}
          selectable={selectMode}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
        />
      )}

      {showBulkToolbar && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-card border shadow-lg rounded-full px-6 py-3 flex items-center gap-4">
            <span className="text-sm font-medium">
              {t("selectedCount", { count: selectedIds.size })}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedIds(new Set())}
              >
                {t("deselectAll")}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                {t("bulkDelete")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
