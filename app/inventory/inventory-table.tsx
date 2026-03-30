"use client";

import { IconDotsVertical } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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
import { InventoryInput } from "@/lib/schemas/inventory";
import { Checkbox } from "@/components/ui/checkbox";

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
        toast.success("Item deleted");
        router.refresh();
      } else {
        toast.error("Failed to delete item");
      }
    } catch {
      toast.error("Error deleting item");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleBulkDelete = async (ids: number[]) => {
    setIsDeleting(true);
    try {
      await Promise.all(
        ids.map((id) => fetch(`/api/YOUR_ROUTE/${id}`, { method: "DELETE" })),
      );
      toast.success(`${ids.length} item${ids.length > 1 ? "s" : ""} deleted`);
      router.refresh();
    } catch {
      toast.error("Error deleting items");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<InventoryInput>[] = [
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
      filterFn: "fuzzy",
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
              <Link href={`/inventory/edit/${row.original.id}`}>Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDeleteId(row.original.id ?? null)}
              disabled={isDeleting}
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
        onDeleteRows={handleBulkDelete}
        searchKey="name"
        searchPlaceholder="Search inventory..."
        mobileColumns={["name", "quantity", "actions"]}
      />

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              selected inventory item from your records.
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
