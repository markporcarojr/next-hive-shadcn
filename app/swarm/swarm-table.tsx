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
import { SwarmInput } from "@/lib/schemas/swarmTrap";
import Link from "next/link";

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
        console.log("Deleted swarm trap", deleteId);
        setDeleteId(null);
        router.refresh();
      } else {
        console.error("Failed to delete swarm trap", deleteId);
        alert("Failed to delete swarm trap");
      }
    } catch (error) {
      console.error("Error deleting swarm trap", error);
      alert("Error deleting swarm trap");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<SwarmInput>[] = [
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
              <a href={`/swarm/edit/${row.original.id}`}>Edit</a>
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
        data={swarms}
        columns={columns}
        searchKey="label"
        searchPlaceholder="Search swarm traps..."
      />

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this swarm trap record.
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
