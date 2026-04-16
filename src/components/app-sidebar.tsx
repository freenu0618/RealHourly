"use client";

import Image from "next/image";
import {
  FolderKanban,
  Clock,
  ClipboardList,
  ClipboardCheck,
  Settings,
  LogOut,
  Moon,
  Sun,
  Home,
  BarChart3,
  FileText,
  Sparkles,
  Users,
  BookOpen,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Link, usePathname } from "@/i18n/navigation";
import { createClientSupabaseClient } from "@/lib/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const t = useTranslations("nav");
  const tAuth = useTranslations("auth");
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [moreOpen, setMoreOpen] = useState(false);

  // Primary nav — always visible
  const primaryNav = [
    { href: "/dashboard", label: t("dashboard"), icon: Home },
    { href: "/time-log", label: t("newEntry"), icon: Clock, exact: true },
    { href: "/projects", label: t("projects"), icon: FolderKanban },
    { href: "/reports", label: t("reports"), icon: FileText },
  ];

  // Secondary nav — inside "More" collapsible
  const secondaryNav = [
    { href: "/clients", label: t("clients"), icon: Users },
    { href: "/analytics", label: t("analytics"), icon: BarChart3 },
    { href: "/timesheets", label: t("timesheets"), icon: ClipboardCheck },
    { href: "/chat", label: t("aiConsultant") ?? "AI Consultant", icon: Sparkles },
    { href: "/guide", label: t("guide") ?? "Guide", icon: BookOpen },
  ];

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const NavItem = ({ href, label, icon: Icon, exact }: { href: string; label: string; icon: React.ElementType; exact?: boolean }) => {
    const active = isActive(href, exact);
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={active}
          className="rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
        >
          <Link href={href}>
            <div
              className={`flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <Icon className="size-4" />
            </div>
            <span>{label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar>
      {/* Header: Logo */}
      <SidebarHeader className="border-b border-sidebar-border px-5 py-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image
            src="/images/logo.webp"
            alt="RealHourly"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="text-lg font-bold tracking-tight">RealHourly</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Primary navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-3">
            {t("menu") ?? "Menu"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primaryNav.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Secondary nav — collapsible "More" group */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenuButton
                onClick={() => setMoreOpen((v) => !v)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium w-full justify-between"
              >
                <span className="text-muted-foreground">More</span>
                <ChevronDown
                  className={`size-4 text-muted-foreground transition-transform ${moreOpen ? "rotate-180" : ""}`}
                />
              </SidebarMenuButton>
              {moreOpen && (
                <SidebarMenu className="mt-1">
                  {secondaryNav.map((item) => (
                    <NavItem key={item.href} {...item} />
                  ))}
                </SidebarMenu>
              )}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItem href="/settings" label={t("settings")} icon={Settings} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer: Theme toggle + Logout */}
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle dark mode"
              className="rounded-xl"
            >
              <Sun className="size-4 dark:hidden" />
              <Moon className="hidden size-4 dark:block" />
              <span className="dark:hidden">Dark mode</span>
              <span className="hidden dark:inline">Light mode</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="rounded-xl text-destructive hover:bg-destructive/10"
              onClick={async () => {
                const supabase = createClientSupabaseClient();
                await supabase.auth.signOut();
                window.location.href = "/login";
              }}
              aria-label={tAuth("logout")}
            >
              <LogOut className="size-4" />
              <span>{tAuth("logout")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
