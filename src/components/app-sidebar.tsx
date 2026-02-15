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

  const mainNav = [
    { href: "/dashboard", label: t("dashboard"), icon: Home },
    { href: "/projects", label: t("projects"), icon: FolderKanban },
    { href: "/time-log", label: t("newEntry"), icon: Clock, exact: true },
    { href: "/time-log/history", label: t("history"), icon: ClipboardList },
    { href: "/timesheets", label: t("timesheets"), icon: ClipboardCheck },
    { href: "/analytics", label: t("analytics"), icon: BarChart3 },
    { href: "/reports", label: t("reports"), icon: FileText },
    { href: "/clients", label: t("clients"), icon: Users },
  ];

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <Sidebar>
      {/* Header: Logo */}
      <SidebarHeader className="border-b border-sidebar-border px-5 py-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image
            src="/images/logo.png"
            alt="RealHourly"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="text-lg font-bold tracking-tight">RealHourly</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Main navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-3">
            {t("menu") ?? "Menu"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => {
                const active = isActive(item.href, item.exact);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className="rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
                    >
                      <Link href={item.href}>
                        <div
                          className={`flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                            active
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <item.icon className="size-4" />
                        </div>
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* AI & Tools */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-3">
            AI
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/chat")}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
                >
                  <Link href="/chat">
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        isActive("/chat")
                          ? "bg-brand-orange text-white"
                          : "bg-orange-50 text-brand-orange dark:bg-orange-950/30"
                      }`}
                    >
                      <Sparkles className="size-4" />
                    </div>
                    <span>{t("aiConsultant") ?? "AI Consultant"}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Guide & Settings */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/guide")}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
                >
                  <Link href="/guide">
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        isActive("/guide")
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <BookOpen className="size-4" />
                    </div>
                    <span>{t("guide") ?? "Guide"}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/settings")}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
                >
                  <Link href="/settings">
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        isActive("/settings")
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Settings className="size-4" />
                    </div>
                    <span>{t("settings")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
