import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {
  Anchor,
  Badge,
  Button,
  Card,
  Group,
  ScrollArea,
  Table,
  Text,
  Title,
} from "@mantine/core";
import Link from "next/link";

export default async function InvoicePage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return <Text c="red">Unauthorized</Text>;

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return <Text c="red">User not found</Text>;

  const invoices = await prisma.invoice.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  return (
    <Card withBorder p="lg" shadow="sm" radius="md">
      <Group justify="space-between" mb="md">
        <Title order={3}>Invoices</Title>
        <Button component={Link} href="/finance/invoices/new">
          New Invoice
        </Button>
      </Group>

      {invoices.length === 0 ? (
        <Text c="dimmed" ta="center">
          No invoices yet. Click &quot;New Invoice&quot; to create your first
          one.
        </Text>
      ) : (
        <ScrollArea h={500} type="auto">
          <Table striped highlightOnHover withColumnBorders>
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
                    <Anchor
                      component={Link}
                      href={`/finance/invoices/${invoice.id}`}
                    >
                      {invoice.id}
                    </Anchor>
                  </td>
                  <td>{invoice.customerName}</td>
                  <td>{invoice.email || <Badge color="gray">N/A</Badge>}</td>
                  <td>{invoice.phone || <Badge color="gray">N/A</Badge>}</td>
                  <td>{`$${invoice.total.toFixed(2)}`}</td>
                  <td>{new Date(invoice.date).toISOString().split("T")[0]}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ScrollArea>
      )}
    </Card>
  );
}
