import { jsPDF } from "jspdf";
import "jspdf-autotable";

/**
 * Generates a premium PDF Invoice/Receipt for Hotel Janro Stays, Events, or Orders.
 * 
 * @param {Object} invoiceData - The invoice details (id, customerName, customerEmail, items, checkIn/eventDate, etc.)
 * @param {Object} settings - The dynamic hotel settings (hotelName, address, currency, website, etc.)
 */
export const generateInvoicePDF = (invoiceData, settings = {}) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const hotelName = settings.hotelName || "Hotel Janro";
  const hotelAddress = settings.address || "123 Luxury Avenue, Paradise City";
  const hotelPhone = settings.phone || "+94 11 234 5678";
  const hotelEmail = settings.email || "info@hoteljanro.com";
  const hotelWebsite = settings.website || "www.hoteljanro.com";
  const currencySymbol = settings.currency?.symbol || "Rs.";

  // Styles & Colors (Slate Navy and Gold Palette)
  const colors = {
    primary: [15, 23, 42],    // #0F172A
    accent: [212, 175, 55],    // #D4AF37
    slate: [71, 85, 105],     // #475569
    lightSlate: [248, 250, 252], // #F8FAFC
    border: [226, 232, 240]   // #E2E8F0
  };

  // Header - Decorative Navy Block
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, 210, 42, "F");

  // Logo / Title
  doc.setTextColor(...colors.accent);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(hotelName.toUpperCase(), 15, 22);

  // Logo Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("EXCELLENCE IN HOSPITALITY", 15, 28);

  // Hotel Contact Info (Header Right)
  doc.setTextColor(241, 245, 249);
  doc.setFontSize(8);
  doc.text(hotelAddress, 195, 16, { align: "right" });
  doc.text(`Phone: ${hotelPhone} | Email: ${hotelEmail}`, 195, 22, { align: "right" });
  doc.text(hotelWebsite, 195, 28, { align: "right" });

  // Gold accent line under header
  doc.setFillColor(...colors.accent);
  doc.rect(0, 42, 210, 2, "F");

  // Title "INVOICE / RECEIPT"
  doc.setTextColor(...colors.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("DIGITAL RECEIPT", 15, 60);

  // Metadata Columns (Invoice #, Date, Status, Billed To)
  const referenceId = invoiceData.id?.length === 24 
    ? invoiceData.id.slice(-8).toUpperCase() 
    : invoiceData.id || "N/A";

  const dateValue = invoiceData.createdAt || invoiceData.checkInDate || invoiceData.eventDate || new Date();
  const formattedDate = new Date(dateValue).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  // Left Column - Invoice Details
  doc.setTextColor(...colors.slate);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("INVOICE DETAILS", 15, 72);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.primary);
  doc.text(`Receipt Reference: #${referenceId}`, 15, 78);
  doc.text(`Issued Date: ${formattedDate}`, 15, 84);
  
  const paymentStatus = (invoiceData.paymentStatus || invoiceData.status || "Paid").toUpperCase();
  doc.text(`Payment Status: `, 15, 90);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(paymentStatus === "PAID" || paymentStatus === "CONFIRMED" || paymentStatus === "FULLY PAID" ? [16, 185, 129] : [245, 158, 11]);
  doc.text(paymentStatus, 42, 90);

  // Right Column - Billed To
  doc.setTextColor(...colors.slate);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("BILLED TO", 120, 72);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.primary);
  doc.text(invoiceData.fullName || invoiceData.customerName || "Valued Guest", 120, 78);
  doc.text(`Email: ${invoiceData.email || invoiceData.customerEmail || "N/A"}`, 120, 84);
  doc.text(`Phone: ${invoiceData.phone || invoiceData.customerPhone || "N/A"}`, 120, 90);

  // Horizontal divider
  doc.setDrawColor(...colors.border);
  doc.line(15, 98, 195, 98);

  // Table Data Preparation
  const tableHeaders = [["Item Description", "Qty", "Unit Price", "Total Amount"]];
  
  const itemsArray = invoiceData.items || invoiceData.orderItems || [];
  
  const tableRows = itemsArray.length > 0 ? itemsArray.map(item => [
    item.name || item.roomName || item.hallName || "Service / Booking",
    item.quantity || item.qty || 1,
    `${currencySymbol} ${(item.price || item.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    `${currencySymbol} ${((item.price || item.amount || 0) * (item.quantity || item.qty || 1)).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
  ]) : [
    [
      invoiceData.roomName || invoiceData.hallName || "Accommodation Service",
      1,
      `${currencySymbol} ${(invoiceData.amount || invoiceData.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      `${currencySymbol} ${(invoiceData.amount || invoiceData.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    ]
  ];

  // Render Items Table
  doc.autoTable({
    startY: 104,
    head: tableHeaders,
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: colors.primary,
      textColor: colors.accent,
      fontSize: 9,
      fontStyle: "bold",
      halign: "left"
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [15, 23, 42]
    },
    columnStyles: {
      0: { cellWidth: 95 },
      1: { cellWidth: 20, halign: "center" },
      2: { cellWidth: 32, halign: "right" },
      3: { cellWidth: 33, halign: "right" }
    },
    margin: { left: 15, right: 15 }
  });

  // Calculate Totals Positioning
  const finalY = doc.lastAutoTable.finalY + 10;

  // Subtotal & Final Amount Calculation
  const subtotal = invoiceData.subtotal || itemsArray.reduce((sum, item) => sum + (item.price || item.amount || 0) * (item.quantity || item.qty || 1), 0) || invoiceData.amount || invoiceData.totalAmount || 0;
  
  const vatAmount = invoiceData.vat || invoiceData.tax || 0;
  const serviceCharge = invoiceData.serviceCharge || 0;
  const deliveryFee = invoiceData.deliveryFee || 0;
  const discount = invoiceData.discount || 0;
  
  // Always trust backend totalAmount if provided
  const grandTotal = invoiceData.totalAmount || invoiceData.amount || invoiceData.totalPrice || (subtotal + vatAmount + serviceCharge + deliveryFee - discount);

  // Render totals section
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...colors.slate);

  let currentY = finalY;

  doc.text("Subtotal:", 140, currentY);
  doc.text(`${currencySymbol} ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 195, currentY, { align: "right" });
  currentY += 6;

  if (serviceCharge > 0) {
    doc.text("Service Charge:", 140, currentY);
    doc.text(`${currencySymbol} ${serviceCharge.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 195, currentY, { align: "right" });
    currentY += 6;
  }

  if (vatAmount > 0) {
    doc.text("VAT / Tax:", 140, currentY);
    doc.text(`${currencySymbol} ${vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 195, currentY, { align: "right" });
    currentY += 6;
  }
  
  if (deliveryFee > 0) {
    doc.text("Delivery Fee:", 140, currentY);
    doc.text(`${currencySymbol} ${deliveryFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 195, currentY, { align: "right" });
    currentY += 6;
  }
  
  if (discount > 0) {
    doc.text("Discount:", 140, currentY);
    doc.text(`- ${currencySymbol} ${discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 195, currentY, { align: "right" });
    currentY += 6;
  }

  const grandTotalY = currentY + 2;

  // Grand Total Highlight Box
  doc.setFillColor(...colors.lightSlate);
  doc.rect(130, grandTotalY - 5, 70, 10, "F");
  
  doc.setTextColor(...colors.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Total Amount:", 135, grandTotalY + 1);
  doc.setTextColor(...colors.accent);
  doc.text(`${currencySymbol} ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 195, grandTotalY + 1, { align: "right" });

  // Guarantee / Terms Notice
  doc.setTextColor(...colors.slate);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("TERMS & CONDITIONS", 15, grandTotalY + 25);
  doc.text("1. All payments are non-refundable unless specified otherwise in booking policies.", 15, grandTotalY + 30);
  doc.text("2. Please present this invoice receipt at the reception desk during check-in/event setup.", 15, grandTotalY + 34);

  // Footer Branding Centered
  const pageHeight = doc.internal.pageSize.height;
  doc.setDrawColor(...colors.border);
  doc.line(15, pageHeight - 20, 195, pageHeight - 20);

  doc.setTextColor(...colors.slate);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Thank you for choosing ${hotelName}. We look forward to welcoming you again!`, 105, pageHeight - 14, { align: "center" });
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.text("This is an officially verified computer-generated digital receipt. No signature is required.", 105, pageHeight - 10, { align: "center" });

  // Save PDF Document
  doc.save(`Invoice_REF-${referenceId}.pdf`);
};
