"use client";

import { DataTable } from "@/components/data-table";
import { DataTableSkeleton } from "@/components/data-table-skeleton";
import { useEffect, useState } from "react";

export default function ExpenseTableWrapper({ data, columns }: any) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <DataTableSkeleton />;

  return <DataTable data={data} columns={columns} searchKey="item" />;
}
