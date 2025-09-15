"use client";

import {
  InvoiceInput,
  InvoiceItemInput,
  PRODUCT_TYPES,
  PRODUCT_TYPE_VALUES,
  invoiceSchema,
} from "@/lib/schemas/invoice";
import {
  Button,
  Card,
  Divider,
  Group,
  NumberInput,
  Select,
  Stack,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { useRouter } from "next/navigation";
import { useState } from "react";

const PRICE_MAP: Record<(typeof PRODUCT_TYPE_VALUES)[number], number> = {
  honey: 8,
  "honey bulk": 30,
  "candles small": 5,
  "candles med": 10,
  "candles lg": 15,
  "morel candle $8": 8,
  "morel candle $10": 10,
  "honey bundle": 20,
  misc: 0,
};

export default function NewInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState<InvoiceItemInput[]>([
    { product: "honey", quantity: 1, unitPrice: PRICE_MAP["honey"] },
  ]);

  const form = useForm<Omit<InvoiceInput, "items" | "total">>({
    initialValues: {
      customerName: "",
      email: "",
      phone: "",
      date: new Date(),
      notes: "",
    },
    validate: zodResolver(invoiceSchema.omit({ items: true, total: true })),
  });

  const calculateTotal = () =>
    items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const updateItem = (index: number, updated: Partial<InvoiceItemInput>) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updated };
      return copy;
    });
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { product: "honey", quantity: 1, unitPrice: PRICE_MAP["honey"] },
    ]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async () => {
    const values: InvoiceInput = {
      ...form.values,
      items,
      total: calculateTotal(),
    };

    setLoading(true);
    try {
      const res = await fetch("/api/finance/invoices", {
        method: "POST",
        body: JSON.stringify(values),
      });

      if (res.ok) {
        router.push("/finance/invoices");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create invoice");
      }
    } catch (err) {
      console.error("[INVOICE_NEW]", err);
      alert("Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card withBorder shadow="sm" radius="md" p="lg">
      <Title order={3} mb="lg">
        New Invoice
      </Title>
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="sm">
          <TextInput
            label="Customer Name"
            placeholder="e.g. John Appleseed"
            {...form.getInputProps("customerName")}
          />
          <TextInput
            label="Email"
            placeholder="e.g. john@example.com"
            {...form.getInputProps("email")}
          />
          <TextInput
            label="Phone"
            placeholder="e.g. 5551234567"
            {...form.getInputProps("phone")}
          />
          <DateInput
            label="Invoice Date"
            valueFormat="YYYY-MM-DD"
            {...form.getInputProps("date")}
          />

          <Textarea
            label="Notes"
            placeholder="Optional notes"
            autosize
            minRows={2}
            {...form.getInputProps("notes")}
          />

          <Divider label="Products" mt="sm" mb="xs" />

          {items.map((item, index) => (
            <Group key={index} grow align="end">
              <Select
                label="Product"
                data={PRODUCT_TYPES}
                value={item.product}
                onChange={(value) => {
                  const price =
                    PRICE_MAP[value as InvoiceItemInput["product"]] ?? 0;
                  updateItem(index, {
                    product: value as any,
                    unitPrice: price,
                  });
                }}
              />
              <NumberInput
                label="Qty"
                min={1}
                value={item.quantity}
                onChange={(val) =>
                  updateItem(index, {
                    quantity: typeof val === "number" ? val : 1,
                  })
                }
              />
              <NumberInput
                label="Unit Price"
                value={item.unitPrice}
                onChange={(val) =>
                  updateItem(index, {
                    unitPrice: typeof val === "number" ? val : 0,
                  })
                }
              />
              <Button color="red" onClick={() => removeItem(index)}>
                Remove
              </Button>
            </Group>
          ))}

          <Button variant="light" onClick={addItem}>
            + Add Item
          </Button>

          <Divider />

          <TextInput
            label="Total"
            value={`$${calculateTotal().toFixed(2)}`}
            readOnly
          />

          <Group justify="flex-end" mt="md">
            <Button type="submit" loading={loading}>
              Save Invoice
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
}
