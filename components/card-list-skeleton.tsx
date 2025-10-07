"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function CardListSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg">
          <Skeleton className="h-6 w-32" />
        </CardTitle>
        <Button disabled className="opacity-50">
          <Skeleton className="h-4 w-20" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full border-collapse">
            <thead className="bg-muted">
              <tr>
                {[...Array(4)].map((_, i) => (
                  <th key={i} className="p-3 text-left">
                    <Skeleton className="h-4 w-24 rounded" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-t">
                  {[...Array(4)].map((_, j) => (
                    <td key={j} className="p-3">
                      <Skeleton className="h-4 w-full rounded" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
