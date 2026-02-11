import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="animate-in fade-in duration-200">
      {/* Hero skeleton */}
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <Skeleton className="h-12 w-80 rounded-xl" />
        <Skeleton className="h-6 w-96 rounded-xl" />
        <Skeleton className="h-12 w-40 rounded-xl" />
      </div>
    </div>
  );
}
