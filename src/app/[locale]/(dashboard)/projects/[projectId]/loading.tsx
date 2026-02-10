import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonKPI, SkeletonChart, SkeletonList } from "@/components/ui/skeleton-card";

export default function Loading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Status banner */}
      <Skeleton className="h-14 w-full rounded-[20px]" />
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
      </div>
      {/* Progress */}
      <Skeleton className="h-6 w-full rounded-xl" />
      {/* KPI grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonKPI key={i} />
        ))}
      </div>
      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <SkeletonChart className="h-[260px]" />
        <SkeletonChart className="h-[260px]" />
      </div>
      {/* Time entries + cost entries */}
      <SkeletonChart className="h-[200px]" />
      <SkeletonList count={3} />
    </div>
  );
}
