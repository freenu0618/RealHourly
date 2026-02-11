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

export function SkeletonPage({
  title = true,
  cards = 0,
  cardColumns = 4,
  list = 0,
  chart = false,
}: {
  title?: boolean;
  cards?: number;
  cardColumns?: 2 | 3 | 4;
  list?: number;
  chart?: boolean;
}) {
  const colsClass =
    cardColumns === 2
      ? "sm:grid-cols-2"
      : cardColumns === 3
        ? "sm:grid-cols-2 lg:grid-cols-3"
        : "sm:grid-cols-2 lg:grid-cols-4";
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {title && <Skeleton className="h-9 w-48 rounded-xl" />}
      {cards > 0 && (
        <div className={`grid gap-4 ${colsClass}`}>
          {Array.from({ length: cards }).map((_, i) => (
            <SkeletonKPI key={i} />
          ))}
        </div>
      )}
      {chart && <SkeletonChart />}
      {list > 0 && <SkeletonList count={list} />}
    </div>
  );
}
