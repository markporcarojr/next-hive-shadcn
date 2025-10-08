import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import Image from "next/image";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
  },
  logo: {
    width: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    color: "#333",
  },
  section: {
    marginBottom: 15,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  text: {
    marginBottom: 5,
    color: "#555",
  },
  table: {
    marginTop: 10,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#333",
    paddingBottom: 5,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 8,
  },
  tableCol1: {
    width: "50%",
  },
  tableCol2: {
    width: "15%",
    textAlign: "center",
  },
  tableCol3: {
    width: "17.5%",
    textAlign: "right",
  },
  tableCol4: {
    width: "17.5%",
    textAlign: "right",
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 11,
  },
  total: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    color: "#333",
    textAlign: "right",
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    fontSize: 10,
    color: "#888",
  },
  invoiceNumber: {
    fontSize: 10,
    color: "#888",
    marginBottom: 5,
  },
  contactInfo: {
    fontSize: 10,
    color: "#666",
    marginTop: 5,
  },
});

interface InvoiceItemType {
  product: string;
  quantity: number;
  unitPrice: number;
}

interface InvoicePDFProps {
  invoiceNumber: number;
  customerName: string;
  total: number;
  date: string;
  email?: string;
  phone?: string;
  notes?: string;
  items: InvoiceItemType[];
}

export default function InvoicePDF({
  invoiceNumber,
  customerName,
  total,
  date,
  email,
  phone,
  notes,
  items,
}: InvoicePDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image
            src="https://www.apiary-tool.com/static/logo.webp"
            alt="Apiary Tool Logo"
            style={styles.logo}
          />
          <Text style={styles.title}>Invoice</Text>
          <Text style={styles.invoiceNumber}>Invoice #: {invoiceNumber}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Bill To:</Text>
          <Text style={styles.text}>{customerName}</Text>
          {email && <Text style={styles.contactInfo}>Email: {email}</Text>}
          {phone && <Text style={styles.contactInfo}>Phone: {phone}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.text}>{date}</Text>
        </View>

        {notes && (
          <View style={styles.section}>
            <Text style={styles.label}>Notes:</Text>
            <Text style={styles.text}>{notes}</Text>
          </View>
        )}

        <View style={styles.table}>
          <Text style={styles.label}>Items:</Text>

          <View style={styles.tableHeader}>
            <Text style={[styles.tableCol1, styles.headerText]}>Product</Text>
            <Text style={[styles.tableCol2, styles.headerText]}>Qty</Text>
            <Text style={[styles.tableCol3, styles.headerText]}>
              Unit Price
            </Text>
            <Text style={[styles.tableCol4, styles.headerText]}>Total</Text>
          </View>

          {items.map((item, index) => {
            const itemTotal = item.quantity * item.unitPrice;
            return (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCol1}>{item.product}</Text>
                <Text style={styles.tableCol2}>{item.quantity}</Text>
                <Text style={styles.tableCol3}>
                  ${item.unitPrice.toFixed(2)}
                </Text>
                <Text style={styles.tableCol4}>${itemTotal.toFixed(2)}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>
        </View>

        <View style={styles.footer}>
          <Text>Thank you for your business! 🐝</Text>
          <Text>www.apiary-tool.com</Text>
        </View>
      </Page>
    </Document>
  );
}
