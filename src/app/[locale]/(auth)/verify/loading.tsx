import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="relative w-full max-w-[480px] rounded-[32px] border border-white/60 bg-white/80 p-8 shadow-[0_20px_40px_-10px_rgba(212,184,156,0.4)] backdrop-blur-sm dark:border-white/10 dark:bg-card/80 md:p-12 animate-in fade-in duration-200">
      <div className="mb-8 flex flex-col items-center gap-2">
        <Skeleton className="size-16 rounded-2xl" />
        <Skeleton className="h-6 w-28 rounded" />
      </div>
      <div className="flex flex-col items-center gap-4 py-4">
        <Skeleton className="size-14 rounded-full" />
        <Skeleton className="h-7 w-40 rounded" />
        <Skeleton className="h-4 w-64 rounded" />
        <Skeleton className="mt-2 h-10 w-32 rounded-xl" />
      </div>
    </main>
  );
}
