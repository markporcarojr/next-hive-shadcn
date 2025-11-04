"use client";

import { DataTable, DataTableSortableHeader } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconDotsVertical } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { hiveFormSchema } from "@/lib/schemas/hive";
import { z } from "zod";

type Hive = z.infer<typeof hiveFormSchema>;

export default function HiveTable({ data }: { data: Hive[] }) {
  const columns: ColumnDef<Hive>[] = [
    {
      id: "hiveNumber",
      accessorFn: (row) => row.hiveNumber?.toString() ?? "",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Hive" />
      ),
      cell: ({ row }) => (
        <Link href={`/inspection/${row.original.id}`}>
          <Button
            variant="ghost"
            className="w-full justify-start px-2 h-auto font-normal cursor-pointer"
          >
            {row.original.hiveNumber}
          </Button>
        </Link>
      ),
      filterFn: "fuzzy",
    },
    {
      accessorKey: "hiveSource",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Source" />
      ),
      cell: ({ row }) => <Badge>{row.original.hiveSource}</Badge>,
    },
    {
      accessorKey: "queenColor",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Queen Color" />
      ),
      cell: ({ row }) => {
        const color = row.original.queenColor?.toLowerCase();

        const colorMap: Record<string, string> = {
          yellow: "bg-yellow-500 text-black",
          red: "bg-red-500 text-white",
          blue: "bg-blue-500 text-white",
          green: "bg-green-500 text-white",
          white: "bg-white text-black border",
        };

        return (
          <Badge
            className={
              color
                ? (colorMap[color] ?? "bg-gray-300 text-black")
                : "bg-gray-300 text-black"
            }
          >
            {row.original.queenColor ?? "N/A"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "broodBoxes",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Brood Boxes" />
      ),
      cell: ({ row }) => <span>{row.original.broodBoxes ?? "-"}</span>,
    },
    {
      accessorKey: "superBoxes",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Supers" />
      ),
      cell: ({ row }) => <span>{row.original.superBoxes ?? "-"}</span>,
    },
    {
      accessorKey: "todo",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Todo" />
      ),
      cell: ({ row }) => <span>{row.original.todo ?? "—"}</span>,
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
              <a href={`/hives/edit/${row.original.id}`}>Edit</a>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => console.log("Delete hive", row.original.id)}
              className="text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      searchKey="hiveNumber"
      searchPlaceholder="Search by hive number..."
    />
  );
}
