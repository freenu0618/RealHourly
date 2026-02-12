"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updatePassword } from "@/lib/auth/auth-actions";

export default function ResetPasswordPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error(t("confirmPassword"));
      return;
    }
    if (password.length < 6) {
      toast.error(t("passwordMinLength"));
      return;
    }
    setLoading(true);
    try {
      await updatePassword(password);
      setDone(true);
      toast.success(t("passwordChanged"));
    } catch {
      toast.error(t("errorNetwork"));
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "h-12 rounded-xl border-2 border-transparent bg-muted pl-4 pr-4 text-sm outline-none transition-all focus:border-primary/50 focus:bg-card focus:ring-4 focus:ring-primary/10";

  return (
    <main className="relative w-full max-w-[480px] rounded-[32px] border border-white/60 bg-white/80 p-8 shadow-[0_20px_40px_-10px_rgba(43,107,147,0.15)] backdrop-blur-sm dark:border-white/10 dark:bg-card/80 md:p-12">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="mb-2 flex size-16 items-center justify-center rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm dark:border-blue-900 dark:from-[#1A1A1A] dark:to-[#141414]">
          <span className="text-3xl drop-shadow-sm">{"\u2615"}</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-muted-foreground">RealHourly</h2>
      </div>

      {done ? (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <span className="text-5xl">{"\u2705"}</span>
          <h1 className="text-xl font-bold">{t("passwordChanged")}</h1>
          <Button
            onClick={() => router.push("/login")}
            className="mt-2 rounded-xl bg-primary font-semibold shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            {t("backToLogin")}
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-6 space-y-1 text-center">
            <h1 className="text-2xl font-black tracking-tight">{t("resetPassword")}</h1>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="space-y-1">
              <Input
                type="password"
                placeholder={t("newPassword")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className={inputClass}
              />
              <p className="pl-1 text-xs text-muted-foreground">{t("passwordMinLength")}</p>
            </div>
            <Input
              type="password"
              placeholder={t("confirmNewPassword")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className={inputClass}
            />
            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-primary text-base font-bold shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/30 active:scale-[0.98]"
            >
              {loading ? <Loader2 className="size-5 animate-spin" /> : t("updatePassword")}
            </Button>
          </form>
        </>
      )}
    </main>
  );
}
