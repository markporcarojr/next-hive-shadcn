import { DataTableSkeleton } from "@/components/data-table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function HivesLoading() {
  return (
    <main className="w-full max-w-6xl mx-auto flex flex-col gap-6 p-6 bg-background rounded-xl shadow-lg border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Your Hives</h2>
        <Skeleton className="h-10 w-24" />
      </div>
      <DataTableSkeleton />
    </main>
  );
}
