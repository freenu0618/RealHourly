"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

export function LandingFooter() {
  const t = useTranslations("landing");
  const pathname = usePathname();
  const isHome = pathname === "/";
  const linkClassName =
    "flex min-h-11 items-center rounded-sm py-2 text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

  const sectionLink = (
    href: "#features" | "#pricing" | "#faq",
    label: string,
  ) => {
    const className = linkClassName;

    if (isHome) {
      return (
        <a href={href} className={className}>
          {label}
        </a>
      );
    }

    return (
      <Link href={`/${href}` as "/"} className={className}>
        {label}
      </Link>
    );
  };

  return (
    <footer className="border-t px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 md:flex-row">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Image
              src="/images/logo.webp"
              alt=""
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

        <div className="grid w-full grid-cols-2 gap-x-6 gap-y-6 text-sm sm:w-auto sm:grid-cols-3 sm:gap-x-12">
          <div>
            <h4 className="mb-2 font-medium">{t("footerProduct")}</h4>
            {sectionLink("#features", t("footerFeatures"))}
            {sectionLink("#pricing", t("footerPricing"))}
            <Link
              href="/features"
              className={linkClassName}
            >
              {t("footerGuide")}
            </Link>
            <Link
              href="/calculator"
              className={linkClassName}
            >
              {t("footerCalculator")}
            </Link>
          </div>
          <div>
            <h4 className="mb-2 font-medium">{t("footerSupport")}</h4>
            {sectionLink("#faq", t("footerFaq"))}
            <Link
              href="/contact"
              className={linkClassName}
            >
              {t("footerContact")}
            </Link>
          </div>
          <div>
            <h4 className="mb-2 font-medium">{t("footerLegal")}</h4>
            <Link
              href="/terms"
              className={linkClassName}
            >
              {t("footerTerms")}
            </Link>
            <Link
              href="/privacy"
              className={linkClassName}
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
