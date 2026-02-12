"use client";

import { useTranslations } from "next-intl";
import { X, Check } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";
import { BorderBeam } from "@/components/ui/border-beam";

export function ComparisonSection() {
  const t = useTranslations("landing");

  const rows = [
    { labelKey: "comp1Label", oldKey: "comp1Old", newKey: "comp1New" },
    { labelKey: "comp2Label", oldKey: "comp2Old", newKey: "comp2New" },
    { labelKey: "comp3Label", oldKey: "comp3Old", newKey: "comp3New" },
    { labelKey: "comp4Label", oldKey: "comp4Old", newKey: "comp4New" },
    { labelKey: "comp5Label", oldKey: "comp5Old", newKey: "comp5New" },
    { labelKey: "comp6Label", oldKey: "comp6Old", newKey: "comp6New" },
  ] as const;

  return (
    <section className="bg-card/50 px-6 py-20">
      <FadeIn blur>
        <h2 className="mb-12 text-center text-2xl font-bold">
          {t("comparisonTitle")}
        </h2>
      </FadeIn>

      <FadeIn>
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {/* Before card */}
          <div className="rounded-[20px] border border-destructive/20 bg-destructive/5 p-6 opacity-80">
            <div className="mb-5 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/15">
                <X className="size-4 text-destructive" />
              </div>
              <h3 className="font-bold text-destructive/80">
                {t("compHeaderOld")}
              </h3>
            </div>
            <ul className="space-y-4">
              {rows.map((row) => (
                <li key={row.oldKey} className="flex items-start gap-3">
                  <X className="mt-0.5 size-4 shrink-0 text-destructive/50" />
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {t(row.labelKey)}
                    </span>
                    <p className="text-sm text-destructive/70 line-through decoration-destructive/30">
                      {t(row.oldKey)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* After card */}
          <div className="relative overflow-hidden rounded-[20px] border border-primary/20 bg-primary/5 p-6">
            <BorderBeam size={200} duration={12} />
            <div className="mb-5 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15">
                <Check className="size-4 text-primary" />
              </div>
              <h3 className="font-bold text-primary">
                {t("compHeaderNew")}
              </h3>
            </div>
            <ul className="space-y-4">
              {rows.map((row) => (
                <li key={row.newKey} className="flex items-start gap-3">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {t(row.labelKey)}
                    </span>
                    <p className="text-sm font-medium text-primary">
                      {t(row.newKey)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
