"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { FolderKanban, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateProjectDialog } from "./CreateProjectDialog";
import { ProjectCard } from "./ProjectCard";

interface Project {
  id: string;
  name: string;
  currency: string;
  isActive: boolean;
  status: string;
  progressPercent: number;
  expectedFee: number | null;
  expectedHours: number | null;
  clientName: string | null;
  totalMinutes: number;
  realHourly: number | null;
  nominalHourly: number | null;
}

const FILTER_TABS = ["active", "completed", "paused", "all"] as const;
type FilterTab = (typeof FILTER_TABS)[number];

export function ProjectsListClient() {
  const t = useTranslations("projects");
  const tCommon = useTranslations("common");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<FilterTab>("active");

  const fetchProjects = useCallback(async (status: FilterTab) => {
    setLoading(true);
    setError(false);
    try {
      const url = status === "all"
        ? "/api/projects"
        : `/api/projects?status=${status}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const { data } = await res.json();
      setProjects(data);
    } catch {
      setError(true);
      toast.error(tCommon("error"));
    } finally {
      setLoading(false);
    }
  }, [tCommon]);

  useEffect(() => {
    fetchProjects(filter);
  }, [fetchProjects, filter]);

  const handleFilterChange = (value: string) => {
    setFilter(value as FilterTab);
  };

  const filterLabel = (tab: FilterTab) => {
    switch (tab) {
      case "active": return t("filterActive");
      case "completed": return t("filterCompleted");
      case "paused": return t("filterPaused");
      case "all": return t("filterAll");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <CreateProjectDialog />
      </div>

      <Tabs value={filter} onValueChange={handleFilterChange}>
        <TabsList className="rounded-xl">
          {FILTER_TABS.map((tab) => (
            <TabsTrigger key={tab} value={tab} className="rounded-lg text-xs">
              {filterLabel(tab)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-[20px]" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">{tCommon("error")}</p>
          <Button variant="outline" onClick={() => fetchProjects(filter)}>
            <RefreshCw className="mr-2 size-4" />
            {tCommon("retry")}
          </Button>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed p-12 text-center">
          <FolderKanban className="size-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">{t("noProjects")}</p>
          <p className="text-sm text-muted-foreground">{t("createFirst")}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
