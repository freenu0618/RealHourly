import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { ErrorBoundary } from "@/components/error-boundary";
import { NotificationBell } from "@/components/ai-actions/NotificationBell";
import { AIChatWrapper } from "@/components/chat/AIChatWrapper";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 px-4 backdrop-blur-sm">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <NotificationBell />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:px-10">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </SidebarInset>
      <AIChatWrapper />
    </SidebarProvider>
  );
}
