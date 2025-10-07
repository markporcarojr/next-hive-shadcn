import { HiveTableSkeleton } from "./HiveTableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <main className="w-full max-w-6xl mx-auto flex flex-col gap-6 p-6 bg-background rounded-xl shadow-lg">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="flex justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <Skeleton className="h-10 w-24" />
        </div>
        <HiveTableSkeleton />
        {/* Section cards skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-lg border p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
