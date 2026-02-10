import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <Skeleton className="h-9 w-32 rounded-xl" />
    </div>
  );
}
