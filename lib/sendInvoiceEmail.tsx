import { Resend } from "resend";
// import { renderToBuffer } from "@react-pdf/renderer";
// import InvoicePDF from "@/components/InvoicePDF"; // TODO: Create this component
import { formatDateMMDDYYYY } from "./formatDate";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvoiceEmail({
  to,
  customerName,
  total,
  date,
  description,
  items,
}: {
  to: string;
  customerName: string;
  total: number;
  date: string;
  description?: string;
  items: string[];
}) {
  // TODO: Generate PDF when InvoicePDF component is created
  // const pdfBuffer = await renderToBuffer(
  //   <InvoicePDF
  //     customerName={customerName}
  //     total={total}
  //     date={date}
  //     description={description}
  //     items={items}
  //   />
  // );

  const goodDate = formatDateMMDDYYYY(date);
  // const base64PDF = pdfBuffer.toString("base64");

  // Styled email HTML
  const itemList = items.map((item) => `<li>${item}</li>`).join("");

  const emailHTML = `
    <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px;">
      <img src="https://www.apiary-tool.com/static/logo.webp" alt="Hive Tool Logo" style="max-width: 150px; margin-bottom: 20px;" />

      <h2 style="color: #333;">Hi ${customerName},</h2>

      <p>Here is a copy of your invoice. A downloadable PDF is also attached.</p>

      <p><strong>Total:</strong> $${total.toFixed(2)}<br/>
      <strong>Date:</strong>${goodDate}</p>

      ${description ? `<p><strong>Notes:</strong> ${description}</p>` : ""}

      <h3>Items:</h3>
      <ul>
        ${itemList}
      </ul>

      <p style="margin-top: 30px;">Thanks for your business! 🐝<br/>
      <a href="https://www.apiary-tool.com" target="_blank">www.apiary-tool.com</a></p>
    </div>
  `;

  return await resend.emails.send({
    from: "Hive Tool <billing@apiary-tool.com>",
    to,
    subject: `Invoice: ${description || "Order from Hive Tool"}`,
    html: emailHTML,
    // TODO: Re-enable PDF attachment when component is available
    // attachments: [
    //   {
    //     filename: "invoice.pdf",
    //     content: base64PDF,
    //   },
    // ],
  });
}