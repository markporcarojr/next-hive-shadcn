"use client";

import { DataTable, DataTableSortableHeader } from "@/components/data-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { hiveFormSchema } from "@/lib/schemas/hive";
import { IconDotsVertical } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

type Hive = z.infer<typeof hiveFormSchema>;

export default function HiveTable({ data }: { data: Hive[] }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const router = useRouter();

  // 🧹 Delete handler
  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/hives/${deleteId}`, { method: "DELETE" });

      if (res.ok) {
        toast.success(`Deleted hive #${deleteId}`);
        router.refresh();
      } else {
        toast.error("Failed to delete hive");
      }
    } catch {
      toast.error("Error deleting hive");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

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
              <Link href={`/hives/edit/${row.original.id}`}>Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              disabled={isDeleting}
              onClick={() => setDeleteId(row.original.id || null)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <DataTable
        data={data}
        columns={columns}
        searchKey="hiveNumber"
        searchPlaceholder="Search by hive number..."
      />

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hive</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              selected hive and its related inspection data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
