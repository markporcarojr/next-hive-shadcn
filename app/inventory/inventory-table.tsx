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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconDotsVertical } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { InventoryInput } from "@/lib/schemas/inventory";
import Link from "next/link";

export default function InventoryTable({ items }: { items: InventoryInput[] }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/inventory/${deleteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        console.log("Deleted item", deleteId);
        setDeleteId(null);
        router.refresh();
      } else {
        console.error("Failed to delete item", deleteId);
        alert("Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting item", error);
      alert("Error deleting item");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<InventoryInput>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Item Name" />
      ),
      cell: ({ row }) => (
        <Link href={`/inventory/${row.original.id}`}>
          <Button
            variant="ghost"
            className="w-full justify-start px-2 h-auto font-normal cursor-pointer"
          >
            {row.original.name}
          </Button>
        </Link>
      ),
      filterFn: "fuzzy", // ✅ Uses the global fuzzy logic
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Quantity" />
      ),
      cell: ({ row }) => <span>{row.original.quantity}</span>,
    },
    {
      accessorKey: "location",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Location" />
      ),
      cell: ({ row }) => <span>{row.original.location}</span>,
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
              <a href={`/inventory/edit/${row.original.id}`}>Edit</a>
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
        data={items}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search inventory..."
      />

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this inventory item from your
              records.
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
