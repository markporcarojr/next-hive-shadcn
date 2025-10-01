"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { Edit, Trash2 } from "lucide-react";

import { InspectionWithHive } from "@/lib/schemas/inspection";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

interface InspectionTableProps {
  inspections: InspectionWithHive[];
}

export default function InspectionTable({ inspections }: InspectionTableProps) {
  const [inspectionToDelete, setInspectionToDelete] = useState<number | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!inspectionToDelete) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/inspection/${inspectionToDelete}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Inspection deleted successfully");
        // refresh page state instead of reload (optional)
        window.location.reload();
      } else {
        toast.error("Failed to delete inspection");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete inspection");
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
      setInspectionToDelete(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg">Inspection Log</CardTitle>
        <Button asChild>
          <Link href="/inspection/new">Add Inspection</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {inspections.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No inspections found. Create your first inspection!
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hive</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Temperament</TableHead>
                <TableHead>Strength</TableHead>
                <TableHead>Queen</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inspections.map((inspection) => (
                <TableRow key={inspection.id}>
                  <TableCell className="font-medium">
                    <Link href={`/inspection/edit/${inspection.id}`}>
                      Hive #{inspection.hive.hiveNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {format(
                      new Date(inspection.inspectionDate),
                      "MMM dd, yyyy"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{inspection.temperament}</Badge>
                  </TableCell>
                  <TableCell>{inspection.hiveStrength}</TableCell>
                  <TableCell>{inspection.queen ? "✓" : "✗"}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {inspection.inspectionNote || "No notes"}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/inspection/edit/${inspection.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>

                      <Dialog
                        open={
                          isDeleteDialogOpen &&
                          inspectionToDelete === inspection.id
                        }
                        onOpenChange={(open) => {
                          setIsDeleteDialogOpen(open);
                          if (!open) setInspectionToDelete(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setInspectionToDelete(inspection.id!)
                            }
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirm Deletion</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete this inspection
                              record? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsDeleteDialogOpen(false);
                                setInspectionToDelete(null);
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
