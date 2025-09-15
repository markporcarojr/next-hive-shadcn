// components/InvoicePDF.tsx
import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30 },
  heading: { fontSize: 18, marginBottom: 10 },
  section: { marginBottom: 10 },
  item: { fontSize: 12 },
});

export default function InvoicePDF({
  customerName,
  total,
  date,
  description,
  items,
}: {
  customerName: string;
  total: number;
  date: string;
  description?: string;
  items: string[];
}) {
  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.heading}>Invoice for {customerName}</Text>
          <Text>Total: ${total.toFixed(2)}</Text>
          <Text>Date: {date}</Text>
          {description && <Text>Notes: {description}</Text>}
        </View>
        <View style={styles.section}>
          <Text style={styles.heading}>Items:</Text>
          {items.map((item, index) => (
            <Text key={index} style={styles.item}>
              • {item}
            </Text>
          ))}
        </View>
        <View style={styles.section}>
          <Text>Thank you for your business! 🐝</Text>
          <Text>Visit us: apiary-tool.com</Text>
          <Text>Contact: billing@apiary-tool.com</Text>
        </View>
      </Page>
    </Document>
  );
}
