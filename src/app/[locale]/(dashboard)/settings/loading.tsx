import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <Skeleton className="h-9 w-32 rounded-xl" />
      {/* Profile section */}
      <div className="rounded-[20px] border p-6 space-y-4">
        <Skeleton className="h-5 w-24 rounded" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
      {/* Preferences section */}
      <div className="rounded-[20px] border p-6 space-y-4">
        <Skeleton className="h-5 w-28 rounded" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
        </div>
      </div>
      {/* Account section */}
      <div className="rounded-[20px] border p-6 space-y-4">
        <Skeleton className="h-5 w-20 rounded" />
        <Skeleton className="h-10 w-40 rounded-xl" />
      </div>
    </div>
  );
}
