"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function CtaSection() {
  const t = useTranslations("landing");

  return (
    <section className="bg-gradient-to-b from-primary/5 to-primary/10 px-6 py-20 text-center" data-animate>
      <h2 className="mb-4 text-2xl font-bold md:text-3xl">
        {t("ctaTitle")}
      </h2>
      <p className="mx-auto mb-8 max-w-lg text-muted-foreground">
        {t("ctaDesc")}
      </p>
      <Link
        href="/login"
        className="inline-block rounded-xl bg-primary px-8 py-4 text-lg font-medium text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-lg"
      >
        {t("ctaCta")} →
      </Link>
    </section>
  );
}
