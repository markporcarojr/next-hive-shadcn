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
import { SwarmInput } from "@/lib/schemas/swarmTrap";
import { Checkbox } from "@/components/ui/checkbox";

export default function SwarmTable({ swarms }: { swarms: SwarmInput[] }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/swarm/${deleteId}`, { method: "DELETE" });

      if (res.ok) {
        toast.success("Swarm trap deleted");
        router.refresh();
      } else {
        toast.error("Failed to delete swarm trap");
      }
    } catch {
      toast.error("Error deleting swarm trap");
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

  const columns: ColumnDef<SwarmInput>[] = [
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
      accessorKey: "label",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Label" />
      ),
      cell: ({ row }) => (
        <Link href={`/swarm/${row.original.id}`}>
          <Button
            variant="ghost"
            className="w-full justify-start px-2 h-auto font-normal cursor-pointer"
          >
            {row.original.label}
          </Button>
        </Link>
      ),
      filterFn: "fuzzy",
    },
    {
      accessorKey: "installedAt",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Installed" />
      ),
      cell: ({ row }) => (
        <span>{new Date(row.original.installedAt).toLocaleDateString()}</span>
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
              <Link href={`/swarm/edit/${row.original.id}`}>Edit</Link>
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
        data={swarms}
        columns={columns}
        searchKey="label"
        onDeleteRows={handleBulkDelete}
        searchPlaceholder="Search swarm traps..."
        mobileColumns={["label", "installedAt", "actions"]}
      />

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Swarm Trap</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              selected swarm trap record from your account.
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
