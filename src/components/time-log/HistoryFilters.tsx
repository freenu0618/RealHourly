"use client";

import { useTranslations } from "next-intl";

interface HistoryFiltersProps {
  projects: { id: string; name: string }[];
  filterProject: string;
  onProjectChange: (val: string) => void;
  filterCategory: string;
  onCategoryChange: (val: string) => void;
  locale: string;
}

const CATEGORIES = [
  "planning", "design", "development", "meeting",
  "revision", "admin", "email", "research", "other",
];

export default function HistoryFilters({
  projects,
  filterProject,
  onProjectChange,
  filterCategory,
  onCategoryChange,
}: HistoryFiltersProps) {
  const t = useTranslations("history");
  const tCat = useTranslations("timeLog");

  const selectClass =
    "h-10 rounded-xl border bg-card px-3 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/10";

  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={filterProject}
        onChange={(e) => onProjectChange(e.target.value)}
        className={selectClass}
        aria-label={t("filterProject")}
      >
        <option value="">{t("allProjects")}</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      <select
        value={filterCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className={selectClass}
        aria-label={t("filterCategory")}
      >
        <option value="">{t("allCategories")}</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {tCat(`category${c.charAt(0).toUpperCase() + c.slice(1)}`)}
          </option>
        ))}
      </select>
    </div>
  );
}
