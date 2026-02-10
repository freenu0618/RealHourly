import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonChart } from "@/components/ui/skeleton-card";

export default function Loading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <Skeleton className="h-9 w-48 rounded-xl" />
        <Skeleton className="mt-2 h-4 w-72 rounded-xl" />
      </div>
      {/* Insight cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-24 rounded-[20px]" />
        <Skeleton className="h-24 rounded-[20px]" />
        <Skeleton className="h-24 rounded-[20px]" />
      </div>
      {/* Charts */}
      <SkeletonChart className="h-[280px]" />
      <SkeletonChart className="h-[280px]" />
    </div>
  );
}
