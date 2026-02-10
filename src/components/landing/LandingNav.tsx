"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { useTheme } from "next-themes";
import { Menu, X, Sun, Moon, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export function LandingNav() {
  const t = useTranslations("landing");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const links = [
    { href: "#features", label: t("nav.features") },
    { href: "#how-it-works", label: t("nav.howItWorks") },
    { href: "#pricing", label: t("nav.pricing") },
    { href: "#faq", label: t("nav.faq") },
  ];

  function toggleLocale() {
    const next = locale === "ko" ? "en" : "ko";
    router.replace(pathname, { locale: next });
  }

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-xl shadow-sm border-b border-border/50"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/logo.png" alt="RealHourly" width={28} height={28} className="rounded-lg" />
          <span className="text-lg font-bold text-foreground">RealHourly</span>
        </Link>

        {/* Desktop center menu */}
        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop right */}
        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <button
            type="button"
            onClick={toggleLocale}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Globe className="size-3.5" />
            {locale === "ko" ? "KR" : "EN"}
          </button>
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
            {t("nav.login")}
          </Link>
          <Link
            href="/login"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            {t("nav.cta")}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button type="button" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? t("nav.close") : "Menu"}>
          {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-background px-6 pb-6 pt-4 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                {link.label}
              </a>
            ))}
            <button type="button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="flex items-center gap-2 text-left text-sm text-muted-foreground hover:text-foreground">
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
            <button type="button" onClick={toggleLocale} className="flex items-center gap-2 text-left text-sm text-muted-foreground hover:text-foreground">
              <Globe className="size-4" />
              {locale === "ko" ? "English" : "한국어"}
            </button>
            <Link href="/login" onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {t("nav.login")}
            </Link>
            <Link href="/login" className="rounded-xl bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground">
              {t("nav.cta")}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
