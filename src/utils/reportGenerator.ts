import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CustomerInquiry } from '../types';
import { SiteSettings } from '../server/db';

/**
 * RevEg Brand Palette for PDF Documents
 */
const BRAND = {
  primary: [13, 91, 41] as [number, number, number], // Deep Emerald Green (#0D5B29)
  secondary: [232, 89, 12] as [number, number, number], // Warm Orange (#E8590C)
  gold: [245, 168, 0] as [number, number, number], // Festive Gold (#F5A800)
  textDark: [17, 49, 29] as [number, number, number], // Dark Text (#11311D)
  textMuted: [85, 112, 96] as [number, number, number],
  bgLight: [250, 248, 242] as [number, number, number],
};

/**
 * Format Status Label
 */
export const formatStatusLabel = (status: string): string => {
  switch (status) {
    case 'new':
      return 'NEW INQUIRY';
    case 'contacted':
      return 'CONTACTED';
    case 'pending':
      return 'PENDING';
    case 'completed':
      return 'COMPLETED';
    case 'cancelled':
      return 'CANCELLED';
    default:
      return (status || 'UNKNOWN').toUpperCase();
  }
};

/**
 * Export Customer Inquiries to CSV File
 */
export const exportInquiriesToCsv = (inquiries: CustomerInquiry[], filename?: string) => {
  const headers = [
    'Inquiry ID',
    'Date & Time',
    'Customer Name',
    'Mobile Number',
    'Email Address',
    'Product / Item',
    'Quantity / Pack Size',
    'Customer Message',
    'Inquiry Source',
    'Status',
    'Last Updated',
  ];

  const rows = inquiries.map((inq) => [
    `"${(inq.inquiryId || inq.id).replace(/"/g, '""')}"`,
    `"${new Date(inq.createdAt).toLocaleString('en-IN').replace(/"/g, '""')}"`,
    `"${(inq.customerName || '').replace(/"/g, '""')}"`,
    `"${(inq.phone || '').replace(/"/g, '""')}"`,
    `"${(inq.email || '').replace(/"/g, '""')}"`,
    `"${(inq.product || '').replace(/"/g, '""')}"`,
    `"${(inq.quantity || '').replace(/"/g, '""')}"`,
    `"${(inq.message || '').replace(/"/g, '""')}"`,
    `"${(inq.source || '').replace(/"/g, '""')}"`,
    `"${formatStatusLabel(inq.status)}"`,
    `"${new Date(inq.updatedAt || inq.createdAt).toLocaleString('en-IN').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', filename || `reveg-inquiries-${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generate Downloadable PDF for a Single Customer Inquiry Slip
 */
export const generateInquirySlipPdf = (inquiry: CustomerInquiry, settings?: SiteSettings) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const businessName = settings?.siteName || 'RevEg Fresh Foods';
  const whatsappDisplay = settings?.whatsappDisplay || '+91 94033 58033';
  const emailDisplay = settings?.email || 'revegfreshfoods@gmail.com';
  const address = settings?.address || 'Maharashtra, India';

  // 1. Top Header Banner
  doc.setFillColor(...BRAND.primary);
  doc.rect(0, 0, 210, 32, 'F');

  doc.setFillColor(...BRAND.gold);
  doc.rect(0, 32, 210, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(businessName.toUpperCase(), 14, 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Authentic Home-Style Sweets & Savory Festive Faral', 14, 23);
  doc.text(`Direct Contact: ${whatsappDisplay} | ${emailDisplay}`, 14, 28);

  // 2. Slip Title & Inquiry ID Badge
  doc.setTextColor(...BRAND.textDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('CUSTOMER INQUIRY SLIP', 14, 46);

  // Status Badge on the right
  const statusLabel = formatStatusLabel(inquiry.status);
  doc.setFillColor(240, 247, 242);
  doc.roundedRect(140, 38, 56, 12, 2, 2, 'F');
  doc.setDrawColor(...BRAND.primary);
  doc.setLineWidth(0.5);
  doc.roundedRect(140, 38, 56, 12, 2, 2, 'D');

  doc.setFontSize(10);
  doc.setTextColor(...BRAND.primary);
  doc.setFont('helvetica', 'bold');
  doc.text(`STATUS: ${statusLabel}`, 145, 45.5);

  // Divider
  doc.setDrawColor(213, 232, 218);
  doc.setLineWidth(0.5);
  doc.line(14, 52, 196, 52);

  // 3. Inquiry Metadata Grid
  autoTable(doc, {
    startY: 56,
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 3,
      textColor: [17, 49, 29],
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [85, 112, 96], cellWidth: 45 },
      1: { cellWidth: 55 },
      2: { fontStyle: 'bold', textColor: [85, 112, 96], cellWidth: 45 },
      3: { cellWidth: 51 },
    },
    body: [
      ['Inquiry Reference ID:', inquiry.inquiryId, 'Date Received:', new Date(inquiry.createdAt).toLocaleString('en-IN')],
      ['Customer Name:', inquiry.customerName, 'Inquiry Source:', inquiry.source || 'Website Contact Form'],
      ['Mobile Number:', inquiry.phone, 'Last Updated:', new Date(inquiry.updatedAt || inquiry.createdAt).toLocaleString('en-IN')],
      ['Email Address:', inquiry.email || 'Not Provided', 'Kitchen Location:', address],
    ],
  });

  const nextY = (doc as any).lastAutoTable.finalY + 6;

  // 4. Order & Product Requirement Table
  autoTable(doc, {
    startY: nextY,
    head: [['Food Item / Inquiry Purpose', 'Quantity / Pack Weight', 'Status']],
    headStyles: {
      fillColor: BRAND.primary,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    body: [
      [inquiry.product || 'Festive Faral & Sweets Order', inquiry.quantity || '1 kg', statusLabel],
    ],
  });

  const afterTableY = (doc as any).lastAutoTable.finalY + 8;

  // 5. Customer Detailed Message Box
  doc.setFillColor(...BRAND.bgLight);
  doc.roundedRect(14, afterTableY, 182, 38, 3, 3, 'F');
  doc.setDrawColor(213, 232, 218);
  doc.roundedRect(14, afterTableY, 182, 38, 3, 3, 'D');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND.primary);
  doc.text('Customer Requirements / Specific Instructions:', 19, afterTableY + 8);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BRAND.textDark);
  const splitMsg = doc.splitTextToSize(inquiry.message || 'No additional message entered.', 172);
  doc.text(splitMsg, 19, afterTableY + 16);

  // 6. Action & Processing Log Area
  const notesY = afterTableY + 46;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(213, 232, 218);
  doc.roundedRect(14, notesY, 182, 42, 3, 3, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...BRAND.secondary);
  doc.text('Dispatch Desk & Order Fulfillment Notes:', 19, notesY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...BRAND.textMuted);
  doc.text('[ ] Batch Scheduled    [ ] WhatsApp Quote Sent    [ ] Advance Payment Received    [ ] Dispatched', 19, notesY + 15);
  doc.text('Admin Staff Signature: _______________________      Date: _______________', 19, notesY + 32);

  // 7. Footer
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.textMuted);
  doc.text(
    `Generated by RevEg CRM System on ${new Date().toLocaleString('en-IN')} | Reference: ${inquiry.inquiryId}`,
    14,
    285
  );

  doc.save(`inquiry-slip-${inquiry.inquiryId}.pdf`);
};

/**
 * Generate Comprehensive Inquiries Report PDF
 */
export const generateInquiriesReportPdf = (
  inquiries: CustomerInquiry[],
  filterTitle: string = 'All Inquiries',
  settings?: SiteSettings
) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const businessName = settings?.siteName || 'RevEg Fresh Foods';
  const whatsappDisplay = settings?.whatsappDisplay || '+91 94033 58033';

  // Header Banner
  doc.setFillColor(...BRAND.primary);
  doc.rect(0, 0, 297, 24, 'F');
  doc.setFillColor(...BRAND.gold);
  doc.rect(0, 24, 297, 1.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`${businessName.toUpperCase()} — CUSTOMER INQUIRIES REPORT`, 14, 13);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Scope: ${filterTitle} | Total Records: ${inquiries.length} | Generated: ${new Date().toLocaleString('en-IN')}`, 14, 19);

  // Summary Metrics Bar
  const newCount = inquiries.filter((i) => i.status === 'new').length;
  const contactedCount = inquiries.filter((i) => i.status === 'contacted').length;
  const pendingCount = inquiries.filter((i) => i.status === 'pending').length;
  const completedCount = inquiries.filter((i) => i.status === 'completed').length;
  const cancelledCount = inquiries.filter((i) => i.status === 'cancelled').length;

  doc.setFillColor(...BRAND.bgLight);
  doc.rect(14, 30, 269, 12, 'F');
  doc.setDrawColor(213, 232, 218);
  doc.rect(14, 30, 269, 12, 'D');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND.textDark);
  doc.text(
    `Summary Breakdown:   Total: ${inquiries.length}   |   New: ${newCount}   |   Contacted: ${contactedCount}   |   Pending: ${pendingCount}   |   Completed: ${completedCount}   |   Cancelled: ${cancelledCount}`,
    18,
    37.5
  );

  // Inquiries Table
  const tableData = inquiries.map((inq, idx) => [
    (idx + 1).toString(),
    inq.inquiryId,
    new Date(inq.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    inq.customerName,
    inq.phone,
    inq.product || '-',
    inq.quantity || '-',
    inq.message ? (inq.message.length > 40 ? inq.message.substring(0, 40) + '...' : inq.message) : '-',
    formatStatusLabel(inq.status),
  ]);

  autoTable(doc, {
    startY: 46,
    head: [['#', 'Inquiry ID', 'Date', 'Customer Name', 'Mobile', 'Product / Item', 'Quantity', 'Requirements', 'Status']],
    headStyles: {
      fillColor: BRAND.primary,
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      cellPadding: 3,
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [17, 49, 29],
    },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { fontStyle: 'bold', cellWidth: 28 },
      2: { cellWidth: 22 },
      3: { fontStyle: 'bold', cellWidth: 35 },
      4: { cellWidth: 26 },
      5: { cellWidth: 38 },
      6: { cellWidth: 22 },
      7: { cellWidth: 62 },
      8: { fontStyle: 'bold', cellWidth: 26 },
    },
    body: tableData,
    alternateRowStyles: {
      fillColor: [250, 252, 250],
    },
  });

  // Footer on each page
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.textMuted);
    doc.text(
      `RevEg Fresh Foods CRM Report | Confidential | Page ${i} of ${pageCount}`,
      14,
      202
    );
  }

  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`reveg-inquiries-report-${dateStr}.pdf`);
};

/**
 * Print Single Inquiry Slip Directly via Browser Print
 */
export const printSingleInquirySlip = (inquiry: CustomerInquiry, settings?: SiteSettings) => {
  const businessName = settings?.siteName || 'RevEg Fresh Foods';
  const whatsappDisplay = settings?.whatsappDisplay || '+91 94033 58033';
  const emailDisplay = settings?.email || 'revegfreshfoods@gmail.com';
  const address = settings?.address || 'Maharashtra, India';

  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Inquiry Slip - ${inquiry.inquiryId}</title>
        <style>
          @page { size: A4; margin: 20mm; }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #11311D;
            line-height: 1.5;
            background: #fff;
            margin: 0;
            padding: 20px;
          }
          .header {
            background: #0D5B29;
            color: white;
            padding: 24px;
            border-radius: 12px;
            border-bottom: 4px solid #F5A800;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px; }
          .header p { margin: 4px 0 0 0; font-size: 12px; opacity: 0.9; }
          .badge {
            background: #E8590C;
            color: white;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .card {
            border: 1px solid #D5E8DA;
            border-radius: 12px;
            padding: 20px;
            margin-top: 20px;
            background: #FAF8F2;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-top: 10px;
          }
          .field { font-size: 13px; }
          .label { color: #557060; font-size: 11px; text-transform: uppercase; font-weight: bold; margin-bottom: 2px; }
          .val { font-weight: 700; color: #11311D; font-size: 14px; }
          .val-id { font-family: monospace; color: #0D5B29; font-size: 16px; font-weight: 800; }
          .message-box {
            background: white;
            border: 1px solid #D5E8DA;
            border-radius: 8px;
            padding: 14px;
            margin-top: 20px;
          }
          .notes-area {
            border: 2px dashed #BCE5C8;
            border-radius: 8px;
            padding: 16px;
            margin-top: 24px;
            font-size: 12px;
            color: #4A6354;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 11px;
            color: #779282;
            border-top: 1px solid #E8F2EA;
            padding-top: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>${businessName}</h1>
            <p>Authentic Festive Faral & Traditional Sweets Dispatch</p>
            <p>Helpline: ${whatsappDisplay} | Email: ${emailDisplay}</p>
          </div>
          <div>
            <span class="badge">${formatStatusLabel(inquiry.status)}</span>
          </div>
        </div>

        <div class="card">
          <div class="grid">
            <div class="field">
              <div class="label">Inquiry Reference ID</div>
              <div class="val val-id">${inquiry.inquiryId}</div>
            </div>
            <div class="field">
              <div class="label">Received Date & Time</div>
              <div class="val">${new Date(inquiry.createdAt).toLocaleString('en-IN')}</div>
            </div>
            <div class="field">
              <div class="label">Customer Name</div>
              <div class="val">${inquiry.customerName}</div>
            </div>
            <div class="field">
              <div class="label">Contact Mobile</div>
              <div class="val">${inquiry.phone}</div>
            </div>
            <div class="field">
              <div class="label">Email Address</div>
              <div class="val">${inquiry.email || 'Not provided'}</div>
            </div>
            <div class="field">
              <div class="label">Inquiry Channel / Source</div>
              <div class="val">${inquiry.source || 'Website'}</div>
            </div>
            <div class="field">
              <div class="label">Product / Food Item</div>
              <div class="val">${inquiry.product || 'Festive Faral'}</div>
            </div>
            <div class="field">
              <div class="label">Pack Size / Quantity</div>
              <div class="val">${inquiry.quantity || '1 kg'}</div>
            </div>
          </div>

          <div class="message-box">
            <div class="label">Customer Requirements / Message:</div>
            <p style="margin: 6px 0 0 0; font-size: 13px; font-style: italic;">
              "${inquiry.message || 'No additional note provided.'}"
            </p>
          </div>

          <div class="notes-area">
            <strong>Dispatch & Kitchen Checklist:</strong><br/>
            [ ] Batch Scheduling & Availability Checked &nbsp;&nbsp;&nbsp;&nbsp;
            [ ] Rate Quoted on WhatsApp &nbsp;&nbsp;&nbsp;&nbsp;
            [ ] Advance Order Confirmed &nbsp;&nbsp;&nbsp;&nbsp;
            [ ] Packed & Handed to Courier<br/><br/>
            Staff Signature: ____________________________ &nbsp;&nbsp;&nbsp;&nbsp; Date: _________________
          </div>
        </div>

        <div class="footer">
          Generated automatically by RevEg Fresh Foods CRM &bull; Document ID: ${inquiry.inquiryId} &bull; Kitchen: ${address}
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
