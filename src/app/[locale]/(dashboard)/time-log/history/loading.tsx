import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-48 rounded-xl" />
        <Skeleton className="h-10 w-40 rounded-xl" />
      </div>
      {/* Filter row */}
      <div className="flex gap-3">
        <Skeleton className="h-10 w-44 rounded-xl" />
        <Skeleton className="h-10 w-44 rounded-xl" />
      </div>
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-20 rounded-[20px]" />
        <Skeleton className="h-20 rounded-[20px]" />
        <Skeleton className="h-20 rounded-[20px]" />
      </div>
      {/* Calendar/list skeleton */}
      <Skeleton className="h-[320px] rounded-[20px]" />
    </div>
  );
}
