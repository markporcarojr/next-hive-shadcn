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

type Harvest = {
  id: number;
  harvestType: string;
  harvestAmount: number;
  harvestDate: string; // ISO string
};

const columns: ColumnDef<Harvest>[] = [
  {
    accessorKey: "harvestType",
    header: "Type",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.harvestType}</span>
    ),
  },
  {
    accessorKey: "harvestAmount",
    header: "Amount (lbs)",
    cell: ({ row }) => <span>{row.original.harvestAmount}</span>,
  },
  {
    accessorKey: "harvestDate",
    header: "Date",
    cell: ({ row }) => (
      <span>
        {formatDate(new Date(row.original.harvestDate).toISOString())}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
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
