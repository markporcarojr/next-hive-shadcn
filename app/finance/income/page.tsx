// app/finance/income/page.tsx
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Button, Card, Group, Table, Text, Title } from "@mantine/core";
import Link from "next/link";

export default async function IncomePage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return <Text c="red">Unauthorized</Text>;

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return <Text c="red">User not found</Text>;

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
      <Card withBorder p="lg" shadow="sm">
        <Group justify="space-between" mb="md">
          <Title order={3}>Income</Title>
          <Button component={Link} href="/finance/income/new">
            Add Income
          </Button>
        </Group>
        <Table highlightOnHover withColumnBorders>
          <thead className="text-left">
            <tr>
              <th>Source</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {incomes.map((income) => (
              <tr key={income.id}>
                <td>{income.source}</td>
                <td>${income.amount.toFixed(2)}</td>
                <td>{new Date(income.date).toISOString().split("T")[0]}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Card withBorder p="lg" shadow="sm">
        <Group justify="space-between" mt="md">
          <Title order={4}>Invoices</Title>
          <Button component={Link} href="/finance/invoices/new">
            New Invoice
          </Button>
        </Group>
        {invoices.length === 0 ? (
          <Text c="dimmed" ta="center">
            No invoices yet. Click &quot;New Invoice&quot; below to create your
            first one.
          </Text>
        ) : (
          <Table highlightOnHover withColumnBorders mt="md">
            <thead className="text-left">
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>
                    <Link href={`/finance/invoices/${invoice.id}`}>
                      {invoice.id}
                    </Link>
                  </td>
                  <td>{invoice.customerName}</td>
                  <td>{invoice.email}</td>
                  <td>{invoice.phone}</td>
                  <td>${invoice.total.toFixed(2)}</td>
                  <td>{new Date(invoice.date).toISOString().split("T")[0]}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
}
