import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

// shadcn/ui imports
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export default async function InvoicePage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return <div className="text-red-600">Unauthorized</div>;

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return <div className="text-red-600">User not found</div>;

  const invoices = await prisma.invoice.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg">Invoices</CardTitle>
        <Button asChild>
          <Link href="/finance/invoices/new">New Invoice</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <div className="text-muted-foreground text-center py-8">
            No invoices yet. Click &quot;New Invoice&quot; to create your first
            one.
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <Link
                        href={`/finance/invoices/${invoice.id}`}
                        className={cn("text-blue-600 hover:underline")}
                      >
                        {invoice.id}
                      </Link>
                    </TableCell>
                    <TableCell>{invoice.customerName}</TableCell>
                    <TableCell>
                      {invoice.email ? (
                        invoice.email
                      ) : (
                        <Badge variant="secondary">N/A</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {invoice.phone ? (
                        invoice.phone
                      ) : (
                        <Badge variant="secondary">N/A</Badge>
                      )}
                    </TableCell>
                    <TableCell>{`$${invoice.total.toFixed(2)}`}</TableCell>
                    <TableCell>
                      {new Date(invoice.date).toISOString().split("T")[0]}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
