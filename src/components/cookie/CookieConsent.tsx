"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

/**
 * Cookie Consent Banner
 *
 * @description Bottom-fixed banner shown on first visit. Allows users to accept all cookies
 * or necessary only. Stores consent in localStorage and controls GA tracking.
 *
 * @example
 * <CookieConsent />
 */
export function CookieConsent() {
  const t = useTranslations("cookie");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("cookie-consent", "all");
    setIsVisible(false);

    // Enable GA tracking if gtag is available
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("consent", "update", {
        analytics_storage: "granted",
      });
    }
  };

  const handleNecessaryOnly = () => {
    localStorage.setItem("cookie-consent", "necessary");
    setIsVisible(false);

    // Disable GA tracking if gtag is available
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("consent", "update", {
        analytics_storage: "denied",
      });
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 transition-opacity duration-300"
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="bg-card border-t shadow-lg md:rounded-t-xl">
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6">
            <div className="flex items-start gap-3">
              <Cookie className="h-5 w-5 flex-shrink-0 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-foreground">
                  {t("message")}{" "}
                  <Link
                    href="/privacy"
                    className="text-primary underline underline-offset-4 hover:text-primary/80"
                  >
                    {t("privacyLink")}
                  </Link>
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleNecessaryOnly}
                className="w-full sm:w-auto"
              >
                {t("necessaryOnly")}
              </Button>
              <Button
                size="sm"
                onClick={handleAcceptAll}
                className="w-full sm:w-auto"
              >
                {t("acceptAll")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
