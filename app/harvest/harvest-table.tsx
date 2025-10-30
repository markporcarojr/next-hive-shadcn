"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconDotsVertical } from "@tabler/icons-react";
import { DataTable } from "@/components/data-table";
import { formatDate } from "@/lib/formatDate";
import { DataTableSortableHeader } from "@/components/data-table";
import Link from "next/link";

type Harvest = {
  id: number;
  harvestType: string;
  harvestAmount: number;
  harvestDate: string; // ISO string
};

const columns: ColumnDef<Harvest>[] = [
  {
    accessorKey: "harvestType",
    header: ({ column }) => (
      <DataTableSortableHeader column={column} title="Type" />
    ),
    cell: ({ row }) => (
      <Link href={`/harvest/${row.original.id}`}>
        <Button
          variant="ghost"
          className="w-full justify-start px-2 h-auto font-normal cursor-pointer"
        >
          {row.original.harvestType}
        </Button>
      </Link>
    ),
    filterFn: "fuzzy", // ✅ Uses the global fuzzy logic
  },
  {
    accessorKey: "harvestAmount",
    header: ({ column }) => (
      <DataTableSortableHeader column={column} title="Amount (lbs)" />
    ),
    cell: ({ row }) => <span>{row.original.harvestAmount}</span>,
  },
  {
    accessorKey: "harvestDate",
    header: ({ column }) => (
      <DataTableSortableHeader column={column} title="Date" />
    ),
    cell: ({ row }) => (
      <span>
        {formatDate(new Date(row.original.harvestDate).toISOString())}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <IconDotsVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem asChild>
            <a href={`/harvest/edit/${row.original.id}`}>Edit</a>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={
              () => console.log("Delete harvest", row.original.id)
              // TODO: hook to DELETE /api/harvest/[id]
            }
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export default function HarvestTable({ data }: { data: Harvest[] }) {
  return (
    <DataTable
      data={data}
      columns={columns}
      searchKey="harvestType"
      searchPlaceholder="Search harvests..."
    />
  );
}
