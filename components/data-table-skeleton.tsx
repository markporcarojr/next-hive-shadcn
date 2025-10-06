"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { IconLayoutColumns } from "@tabler/icons-react";

export function DataTableSkeleton() {
  return (
    <div className="w-full flex flex-col gap-4">
      {/* Search + Controls */}
      <div className="flex items-center justify-between">
        {/* Search input skeleton */}
        <div className="flex items-center gap-2 w-full max-w-sm">
          <Skeleton className="h-9 w-full rounded-md" />
        </div>

        {/* Columns button skeleton */}
        <Button variant="outline" size="sm" disabled className="opacity-50">
          <IconLayoutColumns className="mr-2 h-4 w-4" />
          <span className="hidden lg:inline">Customize Columns</span>
          <span className="lg:hidden">Columns</span>
        </Button>
      </div>

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full border-collapse">
          <thead className="bg-muted">
            <tr>
              {[...Array(5)].map((_, i) => (
                <th key={i} className="p-3 text-left">
                  <Skeleton className="h-4 w-24 rounded" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-t">
                {[...Array(5)].map((_, j) => (
                  <td key={j} className="p-3">
                    <Skeleton className="h-4 w-full rounded" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between">
        <div className="hidden lg:flex text-sm text-muted-foreground">
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="flex items-center gap-6">
          <Skeleton className="h-8 w-24 rounded" /> {/* Rows per page */}
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-8 rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
