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
import { Badge } from "@/components/ui/badge";
import { SwarmInput } from "@/lib/schemas/swarmTrap";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface SwarmListProps {
  swarms: SwarmInput[];
}

export default function ClientSwarmList({ swarms }: SwarmListProps) {
  const [swarmToDelete, setSwarmToDelete] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!swarmToDelete) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/swarm/${swarmToDelete}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Swarm trap deleted successfully");
        // Reload the page to reflect changes
        window.location.reload();
      } else {
        toast.error("Failed to delete swarm trap");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete swarm trap");
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
      setSwarmToDelete(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg">Swarm Traps</CardTitle>
        <Button asChild>
          <Link href="/swarm/new">Add Trap</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {swarms.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No swarm traps found. Add your first trap!
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Installed At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {swarms.map((swarm) => (
                <TableRow key={swarm.id}>
                  <TableCell className="font-medium">{swarm.label}</TableCell>

                  <TableCell>
                    {format(new Date(swarm.installedAt), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    {swarm.removedAt ? (
                      <Badge variant="secondary">Removed</Badge>
                    ) : (
                      <Badge>Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {swarm.notes || "No notes"}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/swarm/edit/${swarm.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Dialog
                        open={isDeleteDialogOpen && swarmToDelete === swarm.id}
                        onOpenChange={(open) => {
                          setIsDeleteDialogOpen(open);
                          if (!open) setSwarmToDelete(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSwarmToDelete(swarm.id!)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirm Deletion</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete &quot;
                              {swarm.label}&quot;? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsDeleteDialogOpen(false);
                                setSwarmToDelete(null);
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
