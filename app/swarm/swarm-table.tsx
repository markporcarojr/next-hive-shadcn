"use client";

import { IconDotsVertical } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Bug, PlusCircle } from "lucide-react";

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SwarmInput } from "@/lib/schemas/swarmTrap";
import { Checkbox } from "@/components/ui/checkbox";

export default function SwarmTable({ swarms }: { swarms: SwarmInput[] }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Log catch dialog state
  const [logTrapId, setLogTrapId] = useState<number | null>(null);
  const [catchDate, setCatchDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [catchNotes, setCatchNotes] = useState("");
  const [isSavingCatch, setIsSavingCatch] = useState(false);

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
        ids.map((id) => fetch(`/api/swarm/${id}`, { method: "DELETE" })),
      );
      toast.success(`${ids.length} item${ids.length > 1 ? "s" : ""} deleted`);
      router.refresh();
    } catch {
      toast.error("Error deleting items");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogCatch = async () => {
    if (!logTrapId) return;
    setIsSavingCatch(true);
    try {
      const res = await fetch("/api/swarm-catches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trapId: logTrapId,
          catchDate,
          notes: catchNotes,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Swarm catch logged!");
      router.refresh(); // re-fetches catchCount from server
      setLogTrapId(null);
      setCatchNotes("");
    } catch {
      toast.error("Failed to log catch");
    } finally {
      setIsSavingCatch(false);
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
      accessorKey: "catchCount",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Catches" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 rounded-md bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-sm font-medium text-amber-700 dark:text-amber-400">
            <Bug size={13} />
            {row.original.catchCount ?? 0}
          </div>
        </div>
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
            <DropdownMenuItem
              onClick={() => {
                setCatchDate(new Date().toISOString().split("T")[0]);
                setCatchNotes("");
                setLogTrapId(row.original.id ?? null);
              }}
            >
              <PlusCircle size={14} className="mr-2" />
              Log Catch
            </DropdownMenuItem>
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
        mobileColumns={["label", "installedAt", "catchCount", "actions"]}
      />

      {/* Delete confirmation */}
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

      {/* Log Catch dialog */}
      <Dialog
        open={logTrapId !== null}
        onOpenChange={(open) => !open && setLogTrapId(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log Swarm Catch</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="catchDate">Catch Date</Label>
              <Input
                id="catchDate"
                type="date"
                value={catchDate}
                onChange={(e) => setCatchDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="catchNotes">Notes (optional)</Label>
              <Textarea
                id="catchNotes"
                placeholder="Swarm size, behavior, anything notable..."
                value={catchNotes}
                onChange={(e) => setCatchNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogTrapId(null)}>
              Cancel
            </Button>
            <Button onClick={handleLogCatch} disabled={isSavingCatch}>
              {isSavingCatch ? "Saving..." : "Log Swarm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
