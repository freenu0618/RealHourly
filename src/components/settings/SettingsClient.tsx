"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { ProfileSection } from "./ProfileSection";
import { PreferencesSection } from "./PreferencesSection";
import { AccountSection } from "./AccountSection";
import { DataSection } from "./DataSection";

/**
 * SettingsClient
 *
 * @description Main settings page wrapper that fetches user data and composes all settings sections
 * @example
 * <SettingsClient locale="ko" />
 */

interface ProfileData {
  email: string;
  displayName: string | null;
  provider: "google" | "email";
}

interface PreferencesData {
  defaultCurrency: "USD" | "KRW" | "EUR" | "GBP" | "JPY";
  hourlyGoal: number | null;
  timezone: string;
  locale: string;
}

interface SettingsClientProps {
  locale: string;
}

export function SettingsClient({ locale }: SettingsClientProps) {
  const t = useTranslations("settings");

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [preferencesData, setPreferencesData] = useState<PreferencesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch profile and preferences in parallel
        const [profileRes, preferencesRes] = await Promise.all([
          fetch("/api/settings/profile"),
          fetch("/api/settings/preferences"),
        ]);

        if (!profileRes.ok || !preferencesRes.ok) {
          throw new Error("Failed to fetch settings data");
        }

        const profileJson = await profileRes.json();
        const preferencesJson = await preferencesRes.json();

        setProfileData(profileJson.data);
        setPreferencesData(preferencesJson.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <div className="text-muted-foreground">{t("saving")}...</div>
        </div>
      </div>
    );
  }

  if (error || !profileData || !preferencesData) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <Card className="p-6">
            <p className="text-destructive">
              {error || "Failed to load settings"}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>

        <div className="space-y-6">
          {/* Profile Section */}
          <ProfileSection
            email={profileData.email}
            displayName={profileData.displayName}
            provider={profileData.provider}
            onUpdate={(newDisplayName) => {
              setProfileData({ ...profileData, displayName: newDisplayName });
            }}
          />

          {/* Preferences Section */}
          <PreferencesSection
            defaultCurrency={preferencesData.defaultCurrency}
            hourlyGoal={preferencesData.hourlyGoal}
            timezone={preferencesData.timezone}
            locale={preferencesData.locale}
            onUpdate={(updates) => {
              setPreferencesData({ ...preferencesData, ...updates });
            }}
          />

          {/* Account Section */}
          <AccountSection provider={profileData.provider} />

          {/* Data Section */}
          <DataSection />
        </div>
      </div>
    </div>
  );
}
