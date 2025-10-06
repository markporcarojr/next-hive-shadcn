"use client";

import { HiveTable } from "../hives/hive-table";
import { HiveTableSkeleton } from "./HiveTableSkeleton";
import { useEffect, useState } from "react";
import type { HiveInput } from "@/lib/schemas/hive";

interface HiveTableWrapperProps {
  data: HiveInput[];
}

export function HiveTableWrapper({ data }: HiveTableWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate a short delay for UX consistency or actual data hydration
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <HiveTableSkeleton />;

  return <HiveTable data={data} />;
}
