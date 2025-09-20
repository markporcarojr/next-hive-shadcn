import { PaginationBar } from "@/components/paganation-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/formatDate";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";

const ITEMS_PER_PAGE = 4;

export default async function HarvestPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return notFound();

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });
  if (!user) return notFound();

  const page = Number(searchParams?.page) || 1;

  const [harvests, total] = await Promise.all([
    prisma.harvest.findMany({
      where: { userId: user.id },
      orderBy: { harvestDate: "desc" },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
    prisma.harvest.count({ where: { userId: user.id } }),
  ]);

  async function handleDelete(id: number) {
    "use server";
    await prisma.harvest.delete({ where: { id } });
    revalidatePath("/harvest");
  }

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Your Harvests</h2>
        <Button asChild>
          <Link href="/harvest/new">Add Harvest</Link>
        </Button>
      </div>

      <div className="space-y-4">
        {harvests.map((entry) => (
          <Card key={entry.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">{entry.harvestType}</CardTitle>
              <Badge variant="secondary">
                {formatDate(entry.harvestDate.toISOString())}
              </Badge>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div>Amount: {entry.harvestAmount} lbs</div>
              <div className="flex gap-2 mt-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/harvest/edit/${entry.id}`}>Edit</Link>
                </Button>

                {/* Delete with confirmation dialog */}
                <Dialog>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Deletion</DialogTitle>
                    </DialogHeader>
                    <p>
                      Are you sure you want to delete this harvest record? This
                      action cannot be undone.
                    </p>
                    <DialogFooter>
                      <Button variant="outline">Cancel</Button>
                      <form action={async () => handleDelete(entry.id)}>
                        <Button size="sm" variant="destructive" type="submit">
                          Confirm Delete
                        </Button>
                      </form>
                    </DialogFooter>
                  </DialogContent>

                  <Button size="sm" variant="destructive" asChild>
                    <DialogTrigger>Delete</DialogTrigger>
                  </Button>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <PaginationBar
          page={page}
          totalPages={Math.ceil(total / ITEMS_PER_PAGE)}
          basePath={"/harvest"}
        />
      </div>
    </main>
  );
}
