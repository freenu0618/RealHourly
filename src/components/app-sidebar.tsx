"use client";

import {
  FolderKanban,
  Clock,
  ClipboardList,
  Settings,
  LogOut,
  Moon,
  Sun,
  Home,
} from "lucide-react";
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
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const t = useTranslations("nav");
  const tAuth = useTranslations("auth");
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const navItems = [
    { href: "/dashboard", label: t("dashboard"), icon: Home, emoji: "\uD83C\uDFE0" },
    { href: "/projects", label: t("projects"), icon: FolderKanban, emoji: "\uD83D\uDCCA" },
    { href: "/time-log", label: t("newEntry"), icon: Clock, emoji: "\u270D\uFE0F", exact: true },
    { href: "/time-log/history", label: t("history"), icon: ClipboardList, emoji: "\uD83D\uDCCB" },
    { href: "/settings", label: t("settings"), icon: Settings, emoji: "\u2699\uFE0F" },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-5 py-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/20 text-xl">
            {"\u2615"}
          </div>
          <span className="text-lg font-bold tracking-tight">RealHourly</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      "exact" in item && item.exact
                        ? pathname === item.href
                        : pathname.startsWith(item.href)
                    }
                    className="rounded-xl px-3 py-3 text-sm font-medium transition-colors"
                  >
                    <Link href={item.href}>
                      <span className="text-base">{item.emoji}</span>
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
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
              className="rounded-xl"
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
