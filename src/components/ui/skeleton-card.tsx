import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={`rounded-[20px] border p-6 space-y-3 ${className ?? ""}`}>
      <Skeleton className="h-4 w-1/3 rounded" />
      <Skeleton className="h-8 w-1/2 rounded" />
      <Skeleton className="h-3 w-2/3 rounded" />
    </div>
  );
}

export function SkeletonKPI() {
  return (
    <div className="rounded-[20px] border p-6 space-y-2">
      <Skeleton className="h-3 w-20 rounded" />
      <Skeleton className="h-7 w-28 rounded" />
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-xl" />
      ))}
    </div>
  );
}

export function SkeletonChart({ className }: { className?: string }) {
  return <Skeleton className={`rounded-[20px] ${className ?? "h-[220px]"}`} />;
}
