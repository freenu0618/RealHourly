"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Dashboard Error Boundary
 *
 * @description Error boundary for dashboard routes. Shows error message
 * with "Try Again" button that calls reset() to attempt re-render.
 *
 * @param error - Error object from Next.js
 * @param reset - Function to reset error boundary
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common");

  useEffect(() => {
    // Log error to console in development
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-6" />
        <h2 className="text-2xl font-bold mb-4">{t("errorTitle")}</h2>
        <p className="text-muted-foreground mb-8">
          {error.message || t("errorMessage")}
        </p>
        <Button onClick={reset} size="lg">
          {t("tryAgain")}
        </Button>
      </div>
    </div>
  );
}
