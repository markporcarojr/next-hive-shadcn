"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function DetailPageSkeleton() {
  return (
    <Card className="max-w-2xl mx-auto mb-8 p-8">
      <Skeleton className="h-8 w-32 mb-6" />
      
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i}>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        
        <div className="my-4">
          <Skeleton className="h-px w-full" />
        </div>
        
        <Skeleton className="h-6 w-24 mb-2" />
        
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-2">
            <div className="flex-1">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="w-24">
              <Skeleton className="h-4 w-12 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="w-32">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
        
        <div className="my-4">
          <Skeleton className="h-px w-full" />
        </div>
        
        <div>
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
        
        <div className="flex gap-2 mt-4">
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
    </Card>
  );
}
