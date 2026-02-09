"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClientSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClientSupabaseClient();
    await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    setSent(true);
  }

  return (
    <main className="relative w-full max-w-[480px] rounded-[32px] border border-white/60 bg-white/80 p-8 shadow-[0_20px_40px_-10px_rgba(212,184,156,0.4)] backdrop-blur-sm dark:border-white/10 dark:bg-card/80 md:p-12">
      {/* Logo */}
      <div className="mb-10 flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="mb-2 flex size-16 items-center justify-center rounded-2xl border border-[#F5E6D3] bg-gradient-to-br from-[#FFF8E7] to-[#FFF0E0] shadow-sm transition-transform duration-300 hover:scale-105 dark:border-[#4A3B2A] dark:from-[#2c3633] dark:to-[#1e2624]">
            <span className="text-3xl drop-shadow-sm">{"\u2615"}</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-muted-foreground">RealHourly</h2>
        </div>
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-black tracking-tight md:text-4xl">
            {t("loginTitle")} {"\uD83D\uDC4B"}
          </h1>
          <p className="text-base font-medium text-muted-foreground">
            {t("loginDescription")}
          </p>
        </div>
      </div>

      {sent ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-primary/10 p-8 text-center">
          <span className="text-5xl">{"\u2709\uFE0F"}</span>
          <p className="text-sm font-medium text-muted-foreground">
            {t("checkEmail")}
          </p>
        </div>
      ) : (
        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="space-y-2">
            <label className="sr-only" htmlFor="email">{t("email")}</label>
            <Input
              id="email"
              type="email"
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-14 rounded-full border-2 border-transparent bg-muted pl-5 pr-5 text-base outline-none transition-all focus:border-primary/50 focus:bg-card focus:ring-4 focus:ring-primary/10"
            />
          </div>
          <Button
            type="submit"
            className="h-14 w-full rounded-full bg-primary text-lg font-bold shadow-lg shadow-primary/20 transition-all hover:bg-[#6CA395] hover:shadow-primary/30 active:scale-[0.98]"
            disabled={loading}
          >
            {loading ? "..." : t("loginWithEmail")}
          </Button>
        </form>
      )}

      {/* Footer */}
      <div className="mt-8 flex items-center justify-center gap-1 text-sm text-muted-foreground">
        <span>{t("noAccount")}</span>
        <a
          className="ml-1 font-bold text-primary underline-offset-2 transition-all hover:text-[#6CA395] hover:underline"
          href="#"
        >
          {t("signUp")}
        </a>
      </div>
    </main>
  );
}
