import { setRequestLocale } from "next-intl/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";
import { LandingContent } from "@/components/landing/LandingContent";

type Props = {
  params: Promise<{ locale: string }>;
};

export const metadata = {
  title: "RealHourly - Find Your Real Hourly Rate",
  description:
    "AI-powered freelancer profitability dashboard. Hidden fees, taxes, and unpaid time — see your real rate.",
  openGraph: {
    title: "RealHourly - Find Your Real Hourly Rate",
    description: "AI-powered freelancer profitability dashboard",
    type: "website" as const,
    images: ["/api/og"],
  },
};

export default async function LandingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect({ href: "/dashboard", locale });
  }

  return <LandingContent />;
}
