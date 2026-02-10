"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

/**
 * DataSection
 *
 * @description Data export functionality (CSV download)
 * Triggers GET /api/settings/export and downloads the CSV file
 */

export function DataSection() {
  const t = useTranslations("settings");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const response = await fetch("/api/settings/export");

      if (!response.ok) {
        throw new Error("Export failed");
      }

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "realhourly-export.csv";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob from response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create hidden anchor and trigger download
      const anchor = document.createElement("a");
      anchor.style.display = "none";
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(anchor);

      toast.success(t("exportSuccess"));
    } catch (error) {
      toast.error(t("exportFailed"));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("data")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">{t("exportCsv")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("exportDescription")}
          </p>
        </div>

        <Button onClick={handleExport} disabled={isExporting} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? t("exporting") : t("exportCsv")}
        </Button>
      </CardContent>
    </Card>
  );
}
