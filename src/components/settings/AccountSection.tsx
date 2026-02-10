"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { createClientSupabaseClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

/**
 * AccountSection
 *
 * @description Account management including password change, logout, and account deletion
 * Password change only shown for email provider users
 */

interface AccountSectionProps {
  provider: "google" | "email";
}

export function AccountSection({ provider }: AccountSectionProps) {
  const t = useTranslations("settings");
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error(t("passwordMismatch"));
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setIsChangingPassword(true);

      const supabase = createClientSupabaseClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      toast.success(t("passwordChanged"));
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(t("passwordChangeFailed"));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      router.push("/login");
    } catch (error) {
      toast.error("Logout failed");
      setIsLoggingOut(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("account")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Password Change (Email provider only) */}
        {provider === "email" && (
          <>
            <div className="space-y-4">
              <h3 className="text-sm font-medium">{t("changePassword")}</h3>

              <div className="space-y-2">
                <Label htmlFor="newPassword">{t("newPassword")}</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <Button
                onClick={handlePasswordChange}
                disabled={
                  isChangingPassword ||
                  !newPassword ||
                  !confirmPassword ||
                  newPassword !== confirmPassword
                }
              >
                {isChangingPassword ? t("saving") : t("changePassword")}
              </Button>
            </div>

            <Separator />
          </>
        )}

        {provider === "google" && (
          <>
            <div className="rounded-md bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                {t("passwordOnlyEmail")}
              </p>
            </div>
            <Separator />
          </>
        )}

        {/* Logout */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">{t("logout")}</h3>
          <Button
            variant="outline"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? t("saving") : t("logout")}
          </Button>
        </div>

        <Separator />

        {/* Delete Account (Coming Soon) */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-destructive">
            {t("deleteAccount")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("deleteAccountWarning")}
          </p>
          <Button variant="destructive" disabled>
            {t("deleteAccount")} (Coming Soon)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
