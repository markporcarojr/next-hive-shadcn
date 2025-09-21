"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HiveInput } from "@/lib/schemas/hive";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface HiveListProps {
  hives: HiveInput[];
}

export default function ClientHiveList({ hives }: HiveListProps) {
  const [hiveToDelete, setHiveToDelete] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!hiveToDelete) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/hives/${hiveToDelete}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Hive deleted successfully");
        // Reload the page to reflect changes
        window.location.reload();
      } else {
        toast.error("Failed to delete hive");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete hive");
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
      setHiveToDelete(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg">Hives</CardTitle>
        <Button asChild>
          <Link href="/hives/new">Add Hive</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {hives.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hives found. Create your first hive!
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hive #</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Queen Color</TableHead>
                <TableHead>Strength</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hives.map((hive) => (
                <TableRow key={hive.id}>
                  <TableCell className="font-medium">#{hive.hiveNumber}</TableCell>
                  <TableCell>{hive.hiveSource}</TableCell>
                  <TableCell>
                    {format(new Date(hive.hiveDate), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>{hive.queenColor || "-"}</TableCell>
                  <TableCell>{hive.hiveStrength || "-"}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/hives/edit/${hive.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Dialog
                        open={isDeleteDialogOpen && hiveToDelete === hive.id}
                        onOpenChange={(open) => {
                          setIsDeleteDialogOpen(open);
                          if (!open) setHiveToDelete(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setHiveToDelete(hive.id!)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirm Deletion</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete Hive #{hive.hiveNumber}? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsDeleteDialogOpen(false);
                                setHiveToDelete(null);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={handleDelete}
                              disabled={loading}
                            >
                              {loading ? "Deleting..." : "Delete"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}