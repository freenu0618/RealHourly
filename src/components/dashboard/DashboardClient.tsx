"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  DollarSign,
  Clock,
  TrendingDown,
  FolderKanban,
  Plus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { formatCurrency } from "@/lib/money/currency";

interface ProjectSummary {
  id: string;
  name: string;
  currency: string;
  isActive: boolean;
  progressPercent: number;
  expectedFee: number | null;
}

export function DashboardClient() {
  const t = useTranslations("dashboard");
  const tProjects = useTranslations("projects");
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/projects?active=true");
        if (!res.ok) throw new Error();
        const { data } = await res.json();
        setProjects(data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const totalRevenue = projects.reduce(
    (sum, p) => sum + (p.expectedFee ?? 0),
    0,
  );
  const currency = projects[0]?.currency ?? "USD";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed p-12 text-center">
          <FolderKanban className="size-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">{t("noProjects")}</p>
          <Button asChild>
            <Link href="/projects">
              <Plus className="mr-2 size-4" />
              {tProjects("create")}
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KPICard
              icon={DollarSign}
              label={t("totalRevenue")}
              value={formatCurrency(totalRevenue, currency)}
            />
            <KPICard
              icon={FolderKanban}
              label={t("activeProjects")}
              value={String(projects.length)}
            />
            <KPICard
              icon={Clock}
              label={t("totalHours")}
              value="—"
            />
            <KPICard
              icon={TrendingDown}
              label={t("avgHourlyRate")}
              value="—"
            />
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold">
              {t("activeProjects")}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <Link key={p.id} href={`/projects/${p.id}`}>
                  <Card className="transition-colors hover:bg-muted/50">
                    <CardContent className="pt-4">
                      <p className="font-medium">{p.name}</p>
                      <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          {p.expectedFee != null
                            ? formatCurrency(p.expectedFee, p.currency)
                            : "—"}
                        </span>
                        <span>{p.progressPercent}%</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{
                            width: `${Math.min(p.progressPercent, 100)}%`,
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function KPICard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 pt-4">
        <div className="rounded-md bg-primary/10 p-2">
          <Icon className="size-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
