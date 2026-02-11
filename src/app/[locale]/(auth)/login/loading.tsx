import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="relative w-full max-w-[480px] rounded-[32px] border border-white/60 bg-white/80 p-8 shadow-[0_20px_40px_-10px_rgba(212,184,156,0.4)] backdrop-blur-sm dark:border-white/10 dark:bg-card/80 md:p-12 animate-in fade-in duration-200">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <Skeleton className="size-[72px] rounded-2xl" />
        <Skeleton className="h-6 w-28 rounded" />
      </div>
      {/* Tabs */}
      <Skeleton className="mb-6 h-11 w-full rounded-full" />
      {/* Google button */}
      <Skeleton className="h-12 w-full rounded-xl" />
      {/* Divider */}
      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <Skeleton className="h-4 w-8 rounded" />
        <div className="h-px flex-1 bg-border" />
      </div>
      {/* Form fields */}
      <div className="flex flex-col gap-4">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </main>
  );
}
