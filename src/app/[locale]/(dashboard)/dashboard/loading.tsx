import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonKPI, SkeletonChart } from "@/components/ui/skeleton-card";

export default function Loading() {
  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div>
        <Skeleton className="h-9 w-64 rounded-xl" />
        <Skeleton className="mt-2 h-4 w-32 rounded-xl" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonKPI key={i} />
        ))}
      </div>
      <SkeletonChart className="h-[220px]" />
      <SkeletonChart className="h-[200px]" />
    </div>
  );
}
