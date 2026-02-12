import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* Chat area skeleton */}
        <div className="flex flex-1 flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 border-b px-5 py-3">
            <Skeleton className="size-9 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 p-5">
            <div className="flex gap-3">
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <Skeleton className="h-16 w-3/4 rounded-2xl" />
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-10 w-1/2 rounded-2xl" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <Skeleton className="h-24 w-2/3 rounded-2xl" />
            </div>
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
