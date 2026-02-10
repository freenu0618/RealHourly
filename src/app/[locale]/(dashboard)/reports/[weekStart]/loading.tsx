import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonChart } from "@/components/ui/skeleton-card";

export default function Loading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <Skeleton className="h-8 w-20 rounded-xl" />
      <div>
        <Skeleton className="h-9 w-56 rounded-xl" />
        <Skeleton className="mt-2 h-5 w-40 rounded-xl" />
      </div>
      {/* AI insight */}
      <Skeleton className="h-24 rounded-[20px]" />
      {/* Daily chart */}
      <SkeletonChart className="h-[260px]" />
      {/* Category / comparison */}
      <div className="grid gap-4 md:grid-cols-2">
        <SkeletonChart className="h-[220px]" />
        <SkeletonChart className="h-[220px]" />
      </div>
    </div>
  );
}
