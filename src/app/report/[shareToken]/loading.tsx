import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="space-y-2 text-center">
        <Skeleton className="mx-auto h-10 w-64 rounded-xl" />
        <Skeleton className="mx-auto h-5 w-40 rounded" />
      </div>
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-24 rounded-[20px]" />
        <Skeleton className="h-24 rounded-[20px]" />
        <Skeleton className="h-24 rounded-[20px]" />
      </div>
      {/* Chart area */}
      <Skeleton className="h-[260px] rounded-[20px]" />
      {/* Entries list */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
