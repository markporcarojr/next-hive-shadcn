// Note: puppeteer removed due to build environment constraints
// import puppeteer from "puppeteer";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function generateInvoicePDF(_html: string): Promise<Buffer> {
  // TODO: Replace with alternative PDF generation solution
  // Currently returning placeholder buffer
  throw new Error("PDF generation temporarily disabled - puppeteer dependency issue");
  
  // Original puppeteer implementation:
  // const browser = await puppeteer.launch({
  //   headless: "new",
  //   args: ["--no-sandbox", "--disable-setuid-sandbox"],
  // });
  // const page = await browser.newPage();
  // await page.setContent(html, { waitUntil: "networkidle0" });
  // const pdf = await page.pdf({
  //   format: "A4",
  //   printBackground: true,
  //   margin: { top: "40px", bottom: "40px", left: "30px", right: "30px" },
  // });
  // await browser.close();
  // return pdf;
}