import { Resend } from "resend";
import { renderToBuffer } from "@react-pdf/renderer";
import InvoicePDF from "../components/invoice-PDF";
import { formatDate } from "./formatDate";

const resend = new Resend(process.env.RESEND_API_KEY);

interface InvoiceItem {
  product: string;
  quantity: number;
  unitPrice: number;
}

export async function sendInvoiceEmail({
  to,
  invoiceNumber,
  customerName,
  total,
  date,
  email,
  phone,
  notes,
  items,
}: {
  to: string;
  invoiceNumber: number;
  customerName: string;
  total: number;
  date: string;
  email?: string;
  phone?: string;
  notes?: string;
  items: InvoiceItem[];
}) {
  const goodDate = formatDate(date);

  // Generate PDF
  const pdfBuffer = await renderToBuffer(
    <InvoicePDF
      invoiceNumber={invoiceNumber}
      customerName={customerName}
      total={total}
      date={goodDate}
      email={email}
      phone={phone}
      notes={notes}
      items={items}
    />
  );

  const base64PDF = pdfBuffer.toString("base64");

  // Build items table HTML
  const itemsTableRows = items
    .map((item) => {
      const itemTotal = item.quantity * item.unitPrice;
      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.product}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.unitPrice.toFixed(2)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${itemTotal.toFixed(2)}</td>
        </tr>
      `;
    })
    .join("");

  // Styled email HTML
  const emailHTML = `
    <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px;">
      <img src="https://www.apiary-tool.com/static/logo.webp" alt="Hive Tool Logo" style="max-width: 150px; margin-bottom: 20px;" />

      <h2 style="color: #333;">Hi ${customerName},</h2>

      <p>Here is a copy of your invoice. A downloadable PDF is also attached.</p>

      <p style="font-size: 12px; color: #888;">Invoice #: ${invoiceNumber}</p>

      <p><strong>Date:</strong> ${goodDate}</p>

      ${email ? `<p><strong>Email:</strong> ${email}</p>` : ""}
      ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
      ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ""}

      <h3>Items:</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="border-bottom: 2px solid #333;">
            <th style="padding: 8px; text-align: left;">Product</th>
            <th style="padding: 8px; text-align: center;">Qty</th>
            <th style="padding: 8px; text-align: right;">Unit Price</th>
            <th style="padding: 8px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsTableRows}
        </tbody>
      </table>

      <p style="font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px;">
        Total: $${total.toFixed(2)}
      </p>

      <p style="margin-top: 30px;">Thanks for your business! 🐝<br/>
      <a href="https://www.apiary-tool.com" target="_blank">www.apiary-tool.com</a></p>
    </div>
  `;

  return await resend.emails.send({
    from: "Hive Tool <billing@apiary-tool.com>",
    to,
    subject: `Invoice #${invoiceNumber} - ${customerName}`,
    html: emailHTML,
    attachments: [
      {
        filename: `invoice-${invoiceNumber}.pdf`,
        content: base64PDF,
      },
    ],
  });
}

// Generate a standalone PDF (if needed elsewhere in your app)
export async function generateInvoicePDF({
  invoiceNumber,
  customerName,
  total,
  date,
  email,
  phone,
  notes,
  items,
}: {
  invoiceNumber: number;
  customerName: string;
  total: number;
  date: string;
  email?: string;
  phone?: string;
  notes?: string;
  items: InvoiceItem[];
}): Promise<Buffer> {
  const goodDate = formatDate(date);

  return await renderToBuffer(
    <InvoicePDF
      invoiceNumber={invoiceNumber}
      customerName={customerName}
      total={total}
      date={goodDate}
      email={email}
      phone={phone}
      notes={notes}
      items={items}
    />
  );
}
