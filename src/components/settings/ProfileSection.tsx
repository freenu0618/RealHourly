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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

/**
 * ProfileSection
 *
 * @description Displays user profile information (email, provider, display name)
 * Allows editing display name with PATCH to API
 */

interface ProfileSectionProps {
  email: string;
  displayName: string | null;
  provider: "google" | "email";
  onUpdate: (newDisplayName: string) => void;
}

export function ProfileSection({
  email,
  displayName,
  provider,
  onUpdate,
}: ProfileSectionProps) {
  const t = useTranslations("settings");

  const [currentDisplayName, setCurrentDisplayName] = useState(
    displayName || ""
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const response = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: currentDisplayName }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      onUpdate(currentDisplayName);
      toast.success(t("saved"));
    } catch (error) {
      toast.error(t("saveFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  const providerLabel =
    provider === "google" ? t("providerGoogle") : t("providerEmail");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("profile")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Email (read-only) */}
        <div className="space-y-2">
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            type="email"
            value={email}
            disabled
            className="bg-muted text-muted-foreground"
          />
        </div>

        {/* Provider badge */}
        <div className="space-y-2">
          <Label>{t("provider")}</Label>
          <div className="inline-flex items-center rounded-md border border-border bg-muted px-3 py-1.5 text-sm">
            {providerLabel}
          </div>
        </div>

        {/* Display name */}
        <div className="space-y-2">
          <Label htmlFor="displayName">{t("displayName")}</Label>
          <Input
            id="displayName"
            type="text"
            value={currentDisplayName}
            onChange={(e) => setCurrentDisplayName(e.target.value)}
            placeholder={t("displayNamePlaceholder")}
          />
        </div>

        {/* Save button */}
        <Button
          onClick={handleSave}
          disabled={isSaving || currentDisplayName === (displayName || "")}
        >
          {isSaving ? t("saving") : t("save")}
        </Button>
      </CardContent>
    </Card>
  );
}
