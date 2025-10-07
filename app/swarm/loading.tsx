import { CardListSkeleton } from "@/components/card-list-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function SwarmLoading() {
  return (
    <>
      <CardListSkeleton />
      <div className="w-full h-[600px] rounded-lg border">
        <Skeleton className="w-full h-full" />
      </div>
    </>
  );
}
