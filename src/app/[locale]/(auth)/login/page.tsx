"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  resetPassword,
} from "@/lib/auth/auth-actions";

type View = "login" | "signup" | "reset";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [view, setView] = useState<View>("login");

  return (
    <main className="relative w-full max-w-[480px] rounded-[32px] border border-white/60 bg-white/80 p-8 shadow-[0_20px_40px_-10px_rgba(212,184,156,0.4)] backdrop-blur-sm dark:border-white/10 dark:bg-card/80 md:p-12">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <Image
          src="/images/logo.png"
          alt="RealHourly"
          width={72}
          height={72}
          className="mb-1 transition-transform duration-300 hover:scale-105"
          priority
        />
        <h2 className="text-xl font-bold tracking-tight text-muted-foreground">RealHourly</h2>
      </div>

      {/* Tabs */}
      {view !== "reset" && (
        <div className="mb-6 flex rounded-full bg-muted p-1">
          <button
            type="button"
            onClick={() => setView("login")}
            className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition-all ${
              view === "login"
                ? "bg-card shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("loginTab")}
          </button>
          <button
            type="button"
            onClick={() => setView("signup")}
            className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition-all ${
              view === "signup"
                ? "bg-card shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("signUpTab")}
          </button>
        </div>
      )}

      {view === "login" && (
        <LoginView t={t} router={router} onForgot={() => setView("reset")} onSwitch={() => setView("signup")} />
      )}
      {view === "signup" && (
        <SignUpView t={t} router={router} onSwitch={() => setView("login")} />
      )}
      {view === "reset" && (
        <ResetView t={t} onBack={() => setView("login")} />
      )}
    </main>
  );
}

/* ── Google Button ── */

function GoogleButton({ label, onClick }: { label: string; onClick: () => void }) {
  const [loading, setLoading] = useState(false);
  const t = useTranslations("auth");

  async function handleClick() {
    setLoading(true);
    try {
      await onClick();
    } catch {
      toast.error(t("errorGoogle"));
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-card text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 dark:bg-muted"
    >
      {loading ? (
        <Loader2 className="size-5 animate-spin" />
      ) : (
        <>
          <GoogleIcon />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

/* ── Divider ── */

function Divider({ text }: { text: string }) {
  return (
    <div className="my-5 flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs font-medium text-muted-foreground">{text}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

/* ── Shared input style ── */
const inputClass =
  "h-12 rounded-xl border-2 border-transparent bg-muted pl-4 pr-4 text-sm outline-none transition-all focus:border-primary/50 focus:bg-card focus:ring-4 focus:ring-primary/10";

/* ── Login View ── */

function LoginView({
  t,
  router,
  onForgot,
  onSwitch,
}: {
  t: (key: string) => string;
  router: ReturnType<typeof useRouter>;
  onForgot: () => void;
  onSwitch: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("Invalid login")) {
        toast.error(t("errorInvalidCredentials"));
      } else {
        toast.error(t("errorNetwork"));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Heading */}
      <div className="mb-6 space-y-1 text-center">
        <h1 className="text-2xl font-black tracking-tight md:text-3xl">
          {t("welcomeBack")} {"\uD83D\uDC4B"}
        </h1>
      </div>

      {/* Google */}
      <GoogleButton label={t("continueWithGoogle")} onClick={signInWithGoogle} />
      <Divider text={t("or")} />

      {/* Email form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          type="email"
          placeholder={t("emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className={inputClass}
        />
        <Input
          type="password"
          placeholder={t("passwordPlaceholder")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className={inputClass}
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onForgot}
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            {t("forgotPassword")}
          </button>
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-xl bg-primary text-base font-bold shadow-lg shadow-primary/20 transition-all hover:bg-[#6CA395] hover:shadow-primary/30 active:scale-[0.98]"
        >
          {loading ? <Loader2 className="size-5 animate-spin" /> : t("loginWithEmail")}
        </Button>
      </form>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-center gap-1 text-sm text-muted-foreground">
        <span>{t("noAccount")}</span>
        <button
          type="button"
          onClick={onSwitch}
          className="ml-1 font-bold text-primary transition-all hover:text-[#6CA395] hover:underline"
        >
          {t("signUpTab")}
        </button>
      </div>
    </>
  );
}

/* ── Sign Up View ── */

function SignUpView({
  t,
  router,
  onSwitch,
}: {
  t: (key: string) => string;
  router: ReturnType<typeof useRouter>;
  onSwitch: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

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
      const data = await signUpWithEmail(email, password);
      // If auto-confirm is on, user session exists immediately
      if (data.session) {
        router.push("/dashboard");
      } else {
        setSent(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("already registered") || msg.includes("already been registered")) {
        toast.error(t("errorDuplicate"));
      } else {
        toast.error(t("errorNetwork"));
      }
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <span className="text-5xl">{"\uD83D\uDCE7"}</span>
        <h1 className="text-xl font-bold">{t("checkEmail")}</h1>
        <p className="text-sm text-muted-foreground">{t("emailSent")}</p>
        <button
          type="button"
          onClick={onSwitch}
          className="mt-2 text-sm font-medium text-primary hover:underline"
        >
          {t("backToLogin")}
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Heading */}
      <div className="mb-6 space-y-1 text-center">
        <h1 className="text-2xl font-black tracking-tight md:text-3xl">
          {t("letsStart")} {"\u2728"}
        </h1>
      </div>

      {/* Google */}
      <GoogleButton label={t("startWithGoogle")} onClick={signInWithGoogle} />
      <Divider text={t("or")} />

      {/* Email form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          type="email"
          placeholder={t("emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className={inputClass}
        />
        <div className="space-y-1">
          <Input
            type="password"
            placeholder={t("passwordPlaceholder")}
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
          placeholder={t("confirmPassword")}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          className={inputClass}
        />
        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-xl bg-primary text-base font-bold shadow-lg shadow-primary/20 transition-all hover:bg-[#6CA395] hover:shadow-primary/30 active:scale-[0.98]"
        >
          {loading ? <Loader2 className="size-5 animate-spin" /> : t("signUp")}
        </Button>
      </form>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-center gap-1 text-sm text-muted-foreground">
        <span>{t("hasAccount")}</span>
        <button
          type="button"
          onClick={onSwitch}
          className="ml-1 font-bold text-primary transition-all hover:text-[#6CA395] hover:underline"
        >
          {t("loginTab")}
        </button>
      </div>
    </>
  );
}

/* ── Reset Password View ── */

function ResetView({
  t,
  onBack,
}: {
  t: (key: string) => string;
  onBack: () => void;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast.success(t("checkEmail"));
    } catch {
      toast.error(t("errorNetwork"));
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <span className="text-5xl">{"\uD83D\uDCE7"}</span>
        <h1 className="text-xl font-bold">{t("checkEmail")}</h1>
        <p className="text-sm text-muted-foreground">{t("emailSent")}</p>
        <button
          type="button"
          onClick={onBack}
          className="mt-2 text-sm font-medium text-primary hover:underline"
        >
          {t("backToLogin")}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 space-y-1 text-center">
        <h1 className="text-2xl font-black tracking-tight">{t("resetPassword")}</h1>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          type="email"
          placeholder={t("emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className={inputClass}
        />
        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-xl bg-primary text-base font-bold shadow-lg shadow-primary/20 transition-all hover:bg-[#6CA395] hover:shadow-primary/30 active:scale-[0.98]"
        >
          {loading ? <Loader2 className="size-5 animate-spin" /> : t("sendResetLink")}
        </Button>
      </form>
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-primary hover:underline"
        >
          {t("backToLogin")}
        </button>
      </div>
    </>
  );
}
