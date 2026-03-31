"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { IconDotsVertical } from "@tabler/icons-react";
import { toast } from "sonner";
import { InspectionWithHive } from "@/lib/schemas/inspection";
import { DataTable, DataTableSortableHeader } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Checkbox } from "@/components/ui/checkbox";

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
        toast.success("Deleted inspection");
        router.refresh();
      } else {
        toast.error("Failed to delete inspection");
      }
    } catch {
      toast.error("Error deleting inspection");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleBulkDelete = async (ids: number[]) => {
    setIsDeleting(true);
    try {
      await Promise.all(
        ids.map((id) => fetch(`/api/inspection/${id}`, { method: "DELETE" })),
      );
      toast.success(
        `${ids.length} inspection${ids.length > 1 ? "s" : ""} deleted`,
      );
      router.refresh();
    } catch {
      toast.error("Error deleting inspections");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<InspectionWithHive>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
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
            {row.original.hive?.hiveNumber ?? "—"}
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
      cell: ({ row }) => <span>{row.original.temperament ?? "—"}</span>,
    },
    {
      accessorKey: "hiveStrength",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Strength" />
      ),
      cell: ({ row }) => <span>{row.original.hiveStrength ?? "—"}</span>,
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
              <Link href={`/inspection/edit/${row.original.id}`}>Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              disabled={isDeleting}
              onClick={() => setDeleteId(row.original.id ?? null)}
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
        onDeleteRows={handleBulkDelete}
        searchKey="hiveNumber"
        searchPlaceholder="Search inspections..."
        mobileColumns={["hiveNumber", "inspectionDate", "actions"]}
      />

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Inspection</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              inspection record from your data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
