// app/inventory/page.tsx
"use client";

import { InventoryInput } from "@/lib/schemas/inventory";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Link from "next/link";
import { useEffect, useState } from "react";

const ITEMS_PER_PAGE = 5;

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryInput[]>([]);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [inventoryToDelete, setInventoryToDelete] = useState<number | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/inventory");
      const data = await res.json();
      setItems(data);
    };
    fetchData();
  }, []);

  // Check if items data is loaded
  if (!items || items.length === 0) {
    return (
      <main className="p-8">
        <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
        <p className="mt-4 text-muted-foreground">No inventory data found.</p>
      </main>
    );
  }

  const filteredItems =
    items && items.length > 0
      ? selectedLocation
        ? items.filter((item) => item.location === selectedLocation)
        : items
      : [];

  // Ensure filteredItems has data before calculating start
  const start =
    filteredItems && filteredItems.length > 0 ? (page - 1) * ITEMS_PER_PAGE : 0;
  const displayed =
    filteredItems && filteredItems.length > 0
      ? filteredItems.slice(start, start + ITEMS_PER_PAGE)
      : [];

  const uniqueLocations =
    items && items.length > 0
      ? Array.from(new Set(items.map((item) => item.location)))
      : [];

  const handleDelete = async () => {
    if (!inventoryToDelete) return;

    const res = await fetch(`/api/inventory?id=${inventoryToDelete}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setItems((prev) => prev.filter((h) => h.id !== inventoryToDelete));
      setModalOpen(false);
      setInventoryToDelete(null);
      toast.success("Inventory item deleted successfully");
    } else {
      toast.error("Failed to delete inventory record");
    }
  };

  return (
    <main className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
        <div className="flex gap-4 items-center">
          <Select value={selectedLocation || ""} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All locations</SelectItem>
              {uniqueLocations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button asChild className="bg-yellow-500 hover:bg-yellow-600">
            <Link href="/inventory/new">Add Inventory Item</Link>
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {displayed.map((item) => (
          <Card key={item.id} className="border shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Location: {item.location}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <div className="flex justify-between items-center mt-4">
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/inventory/edit/${item.id}`}>Edit</Link>
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setInventoryToDelete(item.id!);
                    setModalOpen(true);
                  }}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length > ITEMS_PER_PAGE && (
        <div className="mt-8 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setPage(Math.max(1, page - 1))}
                  className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: Math.ceil(filteredItems.length / ITEMS_PER_PAGE) }, (_, i) => (
                <PaginationItem key={i + 1}>
                  <PaginationLink
                    onClick={() => setPage(i + 1)}
                    isActive={page === i + 1}
                    className="cursor-pointer"
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setPage(Math.min(Math.ceil(filteredItems.length / ITEMS_PER_PAGE), page + 1))}
                  className={page === Math.ceil(filteredItems.length / ITEMS_PER_PAGE) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="mb-4">Are you sure you want to delete this record?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
