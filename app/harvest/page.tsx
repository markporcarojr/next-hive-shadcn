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
  DialogClose,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/formatDate";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const ITEMS_PER_PAGE = 4;

export default async function HarvestPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return notFound();

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });
  if (!user) return notFound();

  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams?.page) || 1;

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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>H</AvatarFallback>
          </Avatar>
          <h2 className="text-3xl font-bold tracking-tight">Your Harvests</h2>
        </div>
      </div>
      <Button asChild>
        <Link href="/harvest/new">Add Harvest</Link>
      </Button>

      <Separator className="mb-8" />

      <ScrollArea className="h-[420px] pr-2">
        <div className="space-y-6">
          {harvests.map((entry) => (
            <Card key={entry.id} className="shadow-sm border">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="secondary">
                          {formatDate(entry.harvestDate.toISOString())}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        Harvested on{" "}
                        {formatDate(entry.harvestDate.toISOString())}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <CardTitle className="text-lg font-semibold">
                    {entry.harvestType}
                  </CardTitle>
                </div>
              </CardHeader>
              <Separator />
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="text-muted-foreground">
                    <span className="font-medium">Amount:</span>{" "}
                    {entry.harvestAmount} lbs
                  </div>
                  <div className="flex gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/harvest/edit/${entry.id}`}>Edit</Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit this harvest</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          Delete
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Harvest</DialogTitle>
                        </DialogHeader>
                        <div className="py-2">
                          Are you sure you want to delete this harvest record?
                          This action cannot be undone.
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline" type="button">
                              Cancel
                            </Button>
                          </DialogClose>
                          <form action={async () => handleDelete(entry.id)}>
                            <Button
                              size="sm"
                              variant="destructive"
                              type="submit"
                            >
                              Confirm Delete
                            </Button>
                          </form>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <Separator className="my-10" />

      <div className="flex justify-center">
        <PaginationBar
          page={page}
          totalPages={Math.ceil(total / ITEMS_PER_PAGE)}
          basePath={"/harvest"}
        />
      </div>
    </main>
  );
}
