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
import { IconDotsVertical } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Invoice = {
  id: number;
  customerName: string;
  email: string | null;
  phone: string | null;
  total: number;
  date: Date;
};

export default function InvoiceTable({ invoices }: { invoices: Invoice[] }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/finance/invoices/${deleteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        console.log("Deleted invoice", deleteId);
        setDeleteId(null);
        router.refresh();
      } else {
        console.error("Failed to delete invoice", deleteId);
        alert("Failed to delete invoice");
      }
    } catch (error) {
      console.error("Error deleting invoice", error);
      alert("Error deleting invoice");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: "customerName",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Customer" />
      ),
      cell: ({ row }) => (
        <Link href={`/finance/invoices/${row.original.id}`}>
          <Button
            variant="ghost"
            className="w-full justify-start px-2 h-auto font-normal cursor-pointer"
          >
            {row.original.customerName}
          </Button>
        </Link>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Email" />
      ),
      cell: ({ row }) =>
        row.original.email ? (
          <span>{row.original.email}</span>
        ) : (
          <Badge variant="secondary">N/A</Badge>
        ),
    },
    {
      accessorKey: "phone",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Phone" />
      ),
      cell: ({ row }) =>
        row.original.phone ? (
          <span>{row.original.phone}</span>
        ) : (
          <Badge variant="secondary">N/A</Badge>
        ),
    },
    {
      accessorKey: "total",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Total" />
      ),
      cell: ({ row }) => <span>${row.original.total.toFixed(2)}</span>,
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Date" />
      ),
      cell: ({ row }) => (
        <span>{new Date(row.original.date).toLocaleDateString()}</span>
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
              <Link href={`/finance/invoices/edit/${row.original.id}`}>
                Edit
              </Link>
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
        data={invoices}
        columns={columns}
        searchKey="customerName"
        searchPlaceholder="Search invoices..."
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
              invoice from your records.
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
