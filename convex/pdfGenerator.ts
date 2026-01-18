import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Simple PDF generation for DocuSign
// This creates a basic PDF-like document structure that DocuSign can render
// For production, consider using a proper PDF library like pdfkit

export const generateDocumentPdf = action({
    args: {
        documentId: v.id("documents"),
    },
    handler: async (ctx, { documentId }): Promise<string> => {
        // Get document data from Convex
        const document = await ctx.runQuery(api.documents.getDocumentById, { documentId });

        if (!document) {
            throw new Error("Document not found");
        }

        // Generate a simple HTML -> PDF like content
        // In production, use pdfkit or similar to generate actual PDF
        const htmlContent = generateDocumentHtml(document);

        // Convert HTML to base64 (DocuSign can accept HTML for rendering)
        // For actual PDF, you'd need a PDF generation library
        const base64Content = Buffer.from(htmlContent).toString("base64");

        return base64Content;
    },
});

// Helper function to generate HTML content for a document
function generateDocumentHtml(document: any): string {
    const { type, documentData } = document;

    switch (type) {
        case "bill_of_lading":
            return generateBillOfLadingHtml(documentData);
        case "commercial_invoice":
            return generateInvoiceHtml(documentData);
        case "air_waybill":
            return generateAirWaybillHtml(documentData);
        default:
            return generateGenericDocumentHtml(documentData);
    }
}

function generateBillOfLadingHtml(data: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { color: #003366; border-bottom: 2px solid #003366; padding-bottom: 10px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .section { margin-bottom: 20px; }
    .section-title { font-weight: bold; color: #666; margin-bottom: 5px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .field { margin-bottom: 10px; }
    .field-label { font-size: 12px; color: #666; }
    .field-value { font-size: 14px; font-weight: 500; }
    .parties { background: #f5f5f5; padding: 15px; border-radius: 5px; }
    .signature-area { margin-top: 50px; border-top: 1px solid #ccc; padding-top: 20px; }
    .signature-line { border-bottom: 1px solid #000; width: 250px; margin-top: 50px; }
  </style>
</head>
<body>
  <h1>BILL OF LADING</h1>
  
  <div class="header">
    <div>
      <strong>Document Number:</strong> ${data.documentNumber || "N/A"}<br>
      <strong>Issue Date:</strong> ${data.issueDate || new Date().toISOString().split("T")[0]}
    </div>
    <div>
      <strong>MarketLive Logistics</strong><br>
      Global Freight Solutions
    </div>
  </div>

  <div class="grid">
    <div class="parties">
      <div class="section-title">SHIPPER</div>
      <div class="field-value">${data.parties?.shipper?.name || "N/A"}</div>
      <div class="field-label">${data.parties?.shipper?.address || ""}</div>
    </div>
    <div class="parties">
      <div class="section-title">CONSIGNEE</div>
      <div class="field-value">${data.parties?.consignee?.name || "N/A"}</div>
      <div class="field-label">${data.parties?.consignee?.address || ""}</div>
    </div>
  </div>

  <div class="section" style="margin-top: 20px;">
    <div class="section-title">CARGO DETAILS</div>
    <div class="grid">
      <div class="field">
        <div class="field-label">Description</div>
        <div class="field-value">${data.goodsDescription || "General Cargo"}</div>
      </div>
      <div class="field">
        <div class="field-label">Weight</div>
        <div class="field-value">${data.cargo?.weight || "N/A"} ${data.cargo?.weightUnit || "kg"}</div>
      </div>
      <div class="field">
        <div class="field-label">Quantity</div>
        <div class="field-value">${data.cargo?.packages || "N/A"} packages</div>
      </div>
      <div class="field">
        <div class="field-label">Volume</div>
        <div class="field-value">${data.cargo?.volume || "N/A"} cbm</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">VOYAGE DETAILS</div>
    <div class="grid">
      <div class="field">
        <div class="field-label">Port of Loading</div>
        <div class="field-value">${data.voyage?.portOfLoading || "N/A"}</div>
      </div>
      <div class="field">
        <div class="field-label">Port of Discharge</div>
        <div class="field-value">${data.voyage?.portOfDischarge || "N/A"}</div>
      </div>
      <div class="field">
        <div class="field-label">Vessel</div>
        <div class="field-value">${data.voyage?.vessel || "N/A"}</div>
      </div>
      <div class="field">
        <div class="field-label">Voyage Number</div>
        <div class="field-value">${data.voyage?.voyageNumber || "N/A"}</div>
      </div>
    </div>
  </div>

  <div class="signature-area">
    <p><strong>Signature Required:</strong></p>
    <p>By signing below, you acknowledge receipt of the goods in apparent good order and condition.</p>
    <div class="signature-line"></div>
    <p style="font-size: 12px; color: #666;">Authorized Signature / Date</p>
  </div>
</body>
</html>`;
}

function generateInvoiceHtml(data: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { color: #003366; }
    .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
    th { background: #f5f5f5; }
    .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
    .signature-area { margin-top: 50px; border-top: 1px solid #ccc; padding-top: 20px; }
  </style>
</head>
<body>
  <h1>COMMERCIAL INVOICE</h1>
  
  <div class="header">
    <div>
      <strong>Invoice Number:</strong> ${data.documentNumber || "N/A"}<br>
      <strong>Date:</strong> ${data.issueDate || new Date().toISOString().split("T")[0]}
    </div>
    <div>
      <strong>MarketLive Logistics</strong><br>
      Global Freight Solutions
    </div>
  </div>

  <div style="display: flex; gap: 40px; margin-bottom: 30px;">
    <div>
      <strong>From:</strong><br>
      ${data.parties?.shipper?.name || "N/A"}<br>
      ${data.parties?.shipper?.address || ""}
    </div>
    <div>
      <strong>To:</strong><br>
      ${data.parties?.consignee?.name || "N/A"}<br>
      ${data.parties?.consignee?.address || ""}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Quantity</th>
        <th>Unit Price</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${data.goodsDescription || "Freight Services"}</td>
        <td>1</td>
        <td>${data.financials?.currency || "USD"} ${data.financials?.declaredValue || "0.00"}</td>
        <td>${data.financials?.currency || "USD"} ${data.financials?.declaredValue || "0.00"}</td>
      </tr>
    </tbody>
  </table>

  <div class="total">
    Total: ${data.financials?.currency || "USD"} ${data.financials?.declaredValue || "0.00"}
  </div>

  <div class="signature-area">
    <p><strong>Authorized Signature:</strong></p>
    <div style="border-bottom: 1px solid #000; width: 250px; margin-top: 50px;"></div>
  </div>
</body>
</html>`;
}

function generateAirWaybillHtml(data: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { color: #003366; border-bottom: 2px solid #003366; padding-bottom: 10px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .section { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    .section-title { font-weight: bold; margin-bottom: 10px; }
  </style>
</head>
<body>
  <h1>AIR WAYBILL</h1>
  
  <div style="margin-bottom: 20px;">
    <strong>AWB Number:</strong> ${data.documentNumber || "N/A"}<br>
    <strong>Date:</strong> ${data.issueDate || new Date().toISOString().split("T")[0]}
  </div>

  <div class="grid">
    <div class="section">
      <div class="section-title">SHIPPER</div>
      ${data.parties?.shipper?.name || "N/A"}<br>
      ${data.parties?.shipper?.address || ""}
    </div>
    <div class="section">
      <div class="section-title">CONSIGNEE</div>
      ${data.parties?.consignee?.name || "N/A"}<br>
      ${data.parties?.consignee?.address || ""}
    </div>
  </div>

  <div class="section">
    <div class="section-title">FLIGHT DETAILS</div>
    <div class="grid">
      <div><strong>Origin:</strong> ${data.voyage?.portOfLoading || "N/A"}</div>
      <div><strong>Destination:</strong> ${data.voyage?.portOfDischarge || "N/A"}</div>
      <div><strong>Flight:</strong> ${data.voyage?.vessel || "N/A"}</div>
      <div><strong>Date:</strong> ${data.voyage?.departureDate || "N/A"}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">CARGO</div>
    <strong>Description:</strong> ${data.goodsDescription || "N/A"}<br>
    <strong>Weight:</strong> ${data.cargo?.weight || "N/A"} kg<br>
    <strong>Pieces:</strong> ${data.cargo?.packages || "N/A"}
  </div>
</body>
</html>`;
}

function generateGenericDocumentHtml(data: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; }
    h1 { color: #003366; }
    pre { background: #f5f5f5; padding: 20px; overflow: auto; }
  </style>
</head>
<body>
  <h1>Document ${data.documentNumber || ""}</h1>
  <p><strong>Date:</strong> ${data.issueDate || new Date().toISOString().split("T")[0]}</p>
  <pre>${JSON.stringify(data, null, 2)}</pre>
</body>
</html>`;
}
