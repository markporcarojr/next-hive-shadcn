"use client";

import { DataTable } from "@/components/data-table";
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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InspectionWithHive } from "@/lib/schemas/inspection";
import { IconDotsVertical } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DataTableSortableHeader } from "@/components/data-table";
import Link from "next/link";

export default function InspectionTable({
  inspections,
}: {
  inspections: InspectionWithHive[];
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/inspection/${deleteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        console.log("Deleted inspection", deleteId);
        setDeleteId(null);
        router.refresh();
      } else {
        console.error("Failed to delete inspection", deleteId);
        alert("Failed to delete inspection");
      }
    } catch (error) {
      console.error("Error deleting inspection", error);
      alert("Error deleting inspection");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<InspectionWithHive>[] = [
    {
      id: "hiveNumber",
      accessorFn: (row) => row.hive?.hiveNumber?.toString() ?? "",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Hive" />
      ),
      cell: ({ row }) => (
        <Link href={`/inspection/${row.original.id}`}>
          <Button
            variant="ghost"
            className="w-full justify-start px-2 h-auto font-normal cursor-pointer"
          >
            {row.original.hive.hiveNumber}
          </Button>
        </Link>
      ),
      filterFn: (row, id, value) => {
        const hiveNumber = row.getValue(id) as string;
        return hiveNumber.toLowerCase().includes(value.toLowerCase());
      },
    },
    {
      accessorKey: "inspectionDate",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Date" />
      ),
      cell: ({ row }) => (
        <span>
          {new Date(row.original.inspectionDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      accessorKey: "temperament",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Temperament" />
      ),
    },
    {
      accessorKey: "hiveStrength",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Strength" />
      ),
    },
    {
      accessorKey: "queen",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Queen" />
      ),
      cell: ({ row }) => <span>{row.original.queen ? "Yes" : "No"}</span>,
    },
    {
      accessorKey: "brood",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Brood" />
      ),
      cell: ({ row }) => <span>{row.original.brood ? "Yes" : "No"}</span>,
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
              <a href={`/inspection/edit/${row.original.id}`}>Edit</a>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDeleteId(row.original.id ?? null)}
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
    <>
      <DataTable
        data={inspections}
        columns={columns}
        searchKey="hiveNumber"
        searchPlaceholder="Search inspections..."
      />

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              inspection from your records.
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
