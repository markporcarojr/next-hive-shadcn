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
import { ExpenseFormInput } from "@/lib/schemas/expense";
import { IconDotsVertical } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function ExpenseTable({
  expenses,
}: {
  expenses: ExpenseFormInput[];
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/finance/expenses/${deleteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success(`Deleted expense ${deleteId}`);
        setDeleteId(null);
        router.refresh();
      } else {
        toast.error("Failed to delete expense");
      }
    } catch {
      toast.error("Error deleting expense");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<ExpenseFormInput>[] = [
    {
      accessorKey: "item",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Item" />
      ),
      cell: ({ row }) => (
        <Link href={`/finance/expenses/${row.original.id}`}>
          <Button
            variant="ghost"
            className="w-full justify-start px-2 h-auto font-normal cursor-pointer"
          >
            {row.original.item}
          </Button>
        </Link>
      ),
      filterFn: "fuzzy", // ✅ Uses the global fuzzy logic
    },

    {
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Amount" />
      ),
      cell: ({ row }) => <span>${row.original.amount.toFixed(2)}</span>,
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
              <a href={`/finance/expenses/edit/${row.original.id}`}>Edit</a>
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
        data={expenses}
        columns={columns}
        searchKey="item"
        searchPlaceholder="Search expenses..."
        mobileColumns={["item", "amount", "actions"]}
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
              expense from your records.
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
