"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { createClientSupabaseClient } from "@/lib/supabase/client";

export default function VerifyPage() {
  const t = useTranslations("auth");
  const [resending, setResending] = useState(false);

  async function handleResend() {
    setResending(true);
    try {
      const supabase = createClientSupabaseClient();
      const { data } = await supabase.auth.getSession();
      const email = data.session?.user?.email;
      if (email) {
        await supabase.auth.resend({ type: "signup", email });
        toast.success(t("checkEmail"));
      }
    } catch {
      toast.error(t("errorNetwork"));
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="relative w-full max-w-[480px] rounded-[32px] border border-white/60 bg-white/80 p-8 shadow-[0_20px_40px_-10px_rgba(212,184,156,0.4)] backdrop-blur-sm dark:border-white/10 dark:bg-card/80 md:p-12">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="mb-2 flex size-16 items-center justify-center rounded-2xl border border-[#F5E6D3] bg-gradient-to-br from-[#FFF8E7] to-[#FFF0E0] shadow-sm dark:border-[#4A3B2A] dark:from-[#2c3633] dark:to-[#1e2624]">
          <span className="text-3xl drop-shadow-sm">{"\u2615"}</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-muted-foreground">RealHourly</h2>
      </div>

      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <span className="text-5xl">{"\uD83D\uDCE7"}</span>
        <h1 className="text-xl font-bold">{t("verifyTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("verifyDescription")}</p>
        <Button
          variant="outline"
          onClick={handleResend}
          disabled={resending}
          className="mt-2 rounded-xl"
        >
          {resending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          {t("resend")}
        </Button>
        <Link
          href="/login"
          className="mt-2 text-sm font-medium text-primary hover:underline"
        >
          {t("backToLogin")}
        </Link>
      </div>
    </main>
  );
}
