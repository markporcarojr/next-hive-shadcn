// app/finance/income/page.tsx
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
import { formatDate } from "@/lib/formatDate";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function IncomePage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return <div className="text-red-600">Unauthorized</div>;

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return <div className="text-red-600">User not found</div>;

  const incomes = await prisma.income.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });
  const invoices = await prisma.invoice.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  return (
    <>
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg">Income</CardTitle>
          <Button asChild>
            <Link href="/finance/income/new">Add Income</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="text-left">
                <TableHead>Source</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incomes.map((income) => (
                <TableRow key={income.id}>
                  <TableCell>{income.source}</TableCell>
                  <TableCell>${income.amount.toFixed(2)}</TableCell>
                  <TableCell>{formatDate(income.date.toISOString())}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-base">Invoices</CardTitle>
          <Button asChild>
            <Link href="/finance/invoices/new">New Invoice</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-muted-foreground text-center py-4">
              No invoices yet. Click &quot;New Invoice&quot; below to create
              your first one.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="text-left">
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
                        className="underline"
                      >
                        {invoice.id}
                      </Link>
                    </TableCell>
                    <TableCell>{invoice.customerName}</TableCell>
                    <TableCell>{invoice.email}</TableCell>
                    <TableCell>{invoice.phone}</TableCell>
                    <TableCell>${invoice.total.toFixed(2)}</TableCell>
                    <TableCell>
                      {new Date(invoice.date).toISOString().split("T")[0]}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
