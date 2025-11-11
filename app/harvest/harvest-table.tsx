"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { DataTableSortableHeader } from "@/components/data-table";
import { formatDate } from "@/lib/formatDate";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

type Harvest = {
  id: number;
  harvestType: string;
  harvestAmount: number;
  harvestDate: string; // ISO string
};

export default function HarvestTable({ data }: { data: Harvest[] }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const router = useRouter();

  // 🧹 Clean delete handler
  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/harvest/${deleteId}`, { method: "DELETE" });

      if (res.ok) {
        toast.success("Deleted harvest");
        router.refresh();
      } else {
        toast.error("Failed to delete harvest");
      }
    } catch {
      toast.error("Error deleting harvest");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
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
      filterFn: "fuzzy",
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
              <Link href={`/harvest/edit/${row.original.id}`}>Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={isDeleting}
              onClick={() => setDeleteId(row.original.id)}
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
        searchKey="harvestType"
        searchPlaceholder="Search harvests..."
      />

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Harvest</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              selected harvest record from your data.
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
