"use client";

import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/money/currency";
import type { ClientSummary } from "@/db/queries/analytics";

interface Props {
  clients: ClientSummary[];
  currency: string;
}

export function ClientSummaryCards({ clients, currency }: Props) {
  const t = useTranslations("analytics");

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {clients.map((client) => (
        <div
          key={client.clientName}
          className="rounded-[16px] border border-border/50 bg-card p-4 space-y-2"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">
              {client.clientName === "Independent"
                ? t("independent")
                : client.clientName}
            </h3>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
              {client.projectCount} {t("projects")}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-muted-foreground">{t("totalHours")}</p>
              <p className="text-sm font-bold">{client.totalHours}h</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("avgRate")}</p>
              <p className="text-sm font-bold">
                {client.avgRealHourly !== null
                  ? formatCurrency(client.avgRealHourly, currency)
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("net")}</p>
              <p
                className={`text-sm font-bold ${client.totalNet < 0 ? "text-destructive" : ""}`}
              >
                {formatCurrency(client.totalNet, currency)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
