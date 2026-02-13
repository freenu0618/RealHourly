"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";

export function LandingFooter() {
  const t = useTranslations("landing");
  const locale = useLocale();

  return (
    <footer className="border-t px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 md:flex-row">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Image
              src="/images/logo.png"
              alt="RealHourly"
              width={24}
              height={24}
              className="rounded"
            />
            <span className="font-bold">RealHourly</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("footerTagline")}
          </p>
        </div>

        <div className="flex gap-12 text-sm">
          <div>
            <h4 className="mb-2 font-medium">{t("footerProduct")}</h4>
            <a
              href="#features"
              className="block text-muted-foreground hover:text-foreground"
            >
              {t("footerFeatures")}
            </a>
            <a
              href="#pricing"
              className="block text-muted-foreground hover:text-foreground"
            >
              {t("footerPricing")}
            </a>
          </div>
          <div>
            <h4 className="mb-2 font-medium">{t("footerSupport")}</h4>
            <a
              href="#faq"
              className="block text-muted-foreground hover:text-foreground"
            >
              {t("footerFaq")}
            </a>
            <Link
              href="/contact"
              className="block text-muted-foreground hover:text-foreground"
            >
              {t("footerContact")}
            </Link>
          </div>
          <div>
            <h4 className="mb-2 font-medium">{t("footerLegal")}</h4>
            <Link
              href="/terms"
              className="block text-muted-foreground hover:text-foreground"
            >
              {t("footerTerms")}
            </Link>
            <Link
              href="/privacy"
              className="block text-muted-foreground hover:text-foreground"
            >
              {t("footerPrivacy")}
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-6xl border-t pt-8 text-center text-xs text-muted-foreground">
        {t("footerCopyright")}
      </div>
    </footer>
  );
}
