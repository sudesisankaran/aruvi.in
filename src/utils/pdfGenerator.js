import { jsPDF } from 'jspdf';

/**
 * Professional Invoice & Order Summary PDF Generator for Aruvi Collections
 * Generates an A4 luxury branded PDF invoice matching the boutique identity
 */
export function generateOrderInvoicePDF(order, settings = {}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const businessName = settings.websiteName || 'Aruvi Collections';
  const businessAddress = settings.businessAddress || '104, Heritage Weavers Lane, T. Nagar, Chennai, Tamil Nadu - 600017';
  const businessPhone = settings.contactNumber || '+91 86106 38978';
  const businessWhatsApp = settings.whatsappNumber || '+91 86106 38978';
  const businessEmail = settings.emailAddress || 'aruvicollections.25@gmail.com';
  const currencySymbol = 'Rs.'; // jsPDF standard font safe character for INR

  // Colors
  const primaryColor = [14, 41, 32];   // #0e2920 Deep Emerald
  const goldColor = [200, 157, 56];     // #c89d38 Royal Gold
  const mutedColor = [102, 119, 112];  // #667770 Muted text
  const lightBg = [250, 248, 245];     // Warm ivory

  // Header Banner Background
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 36, 'F');

  // Gold accent line under header
  doc.setFillColor(...goldColor);
  doc.rect(0, 36, 210, 2, 'F');

  // Business Title in Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(200, 157, 56);
  doc.text(businessName.toUpperCase(), 14, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(240, 235, 225);
  doc.text('HANDCRAFTED LUXURY & BESPOKE COUTURE', 14, 25);
  doc.text(`Ph: ${businessPhone}  |  WhatsApp: ${businessWhatsApp}  |  ${businessEmail}`, 14, 30);

  // Right-aligned Invoice Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('ORDER SUMMARY / INVOICE', 196, 18, { align: 'right' });

  doc.setFontSize(9);
  doc.setTextColor(200, 157, 56);
  doc.text(`ID: #${order.id || 'ORD-2026-0001'}`, 196, 25, { align: 'right' });
  doc.setTextColor(240, 235, 225);
  const formattedDate = order.createdAt 
    ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN');
  doc.text(`Date: ${formattedDate}`, 196, 30, { align: 'right' });

  // ----------------------------------------------------
  // Customer & Shipping Box (2 Columns)
  // ----------------------------------------------------
  const boxTop = 44;
  doc.setFillColor(...lightBg);
  doc.roundedRect(14, boxTop, 182, 36, 3, 3, 'F');
  doc.setDrawColor(220, 210, 195);
  doc.roundedRect(14, boxTop, 182, 36, 3, 3, 'D');

  // Left: Bill To
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...primaryColor);
  doc.text('CUSTOMER / DELIVERY DETAILS:', 20, boxTop + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(50, 60, 55);

  const customerName = order.shipping?.name || order.customerName || 'Valued Patron';
  const customerPhone = order.shipping?.phone || order.customerPhone || 'N/A';
  const customerAddress = order.shipping?.address 
    ? `${order.shipping.address}, ${order.shipping.city || ''} - ${order.shipping.pincode || ''}, ${order.shipping.state || ''}`
    : 'Online Collection / WhatsApp Fulfillment';

  doc.text(`Name: ${customerName}`, 20, boxTop + 14);
  doc.text(`Mobile: ${customerPhone}`, 20, boxTop + 19);
  doc.text(`Address: ${customerAddress.substring(0, 55)}`, 20, boxTop + 24);
  if (customerAddress.length > 55) {
    doc.text(customerAddress.substring(55, 110), 20, boxTop + 29);
  }

  // Right: Order Status & Payment
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...primaryColor);
  doc.text('FULFILLMENT DETAILS:', 120, boxTop + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(50, 60, 55);
  doc.text(`Payment: ${(order.paymentMethod || 'UPI / WhatsApp Pay').toUpperCase()}`, 120, boxTop + 14);
  doc.text(`Status: ${(order.status || 'Pending Confirmation').toUpperCase()}`, 120, boxTop + 19);
  doc.text('Boutique Concierge: WhatsApp Active', 120, boxTop + 24);

  // ----------------------------------------------------
  // Items Table
  // ----------------------------------------------------
  const tableTop = 86;
  doc.setFillColor(...primaryColor);
  doc.rect(14, tableTop, 182, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(200, 157, 56);
  doc.text('#', 18, tableTop + 5.5);
  doc.text('ENSEMBLE / ITEM DESCRIPTION', 28, tableTop + 5.5);
  doc.text('SIZE', 115, tableTop + 5.5);
  doc.text('QTY', 135, tableTop + 5.5);
  doc.text('UNIT PRICE', 152, tableTop + 5.5);
  doc.text('AMOUNT', 190, tableTop + 5.5, { align: 'right' });

  // Rows
  let curY = tableTop + 8;
  const items = order.items && order.items.length > 0 ? order.items : [];

  items.forEach((item, index) => {
    const isEven = index % 2 === 0;
    doc.setFillColor(isEven ? 255 : 250, isEven ? 255 : 248, isEven ? 255 : 245);
    doc.rect(14, curY, 182, 8.5, 'F');
    doc.setDrawColor(235, 230, 222);
    doc.line(14, curY + 8.5, 196, curY + 8.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(40, 50, 45);

    doc.text(String(index + 1), 18, curY + 5.5);
    const titleText = (item.title || item.name || 'Handcrafted Boutique Garment').substring(0, 46);
    doc.text(titleText, 28, curY + 5.5);
    doc.text(item.selectedSize || item.size || 'M', 115, curY + 5.5);
    doc.text(String(item.quantity || 1), 135, curY + 5.5);
    doc.text(`${currencySymbol} ${(Number(item.price) || 0).toLocaleString('en-IN')}`, 152, curY + 5.5);
    
    const itemTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);
    doc.setFont('helvetica', 'bold');
    doc.text(`${currencySymbol} ${itemTotal.toLocaleString('en-IN')}`, 190, curY + 5.5, { align: 'right' });

    curY += 8.5;
  });

  if (items.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(...mutedColor);
    doc.text('No line items recorded.', 28, curY + 6);
    curY += 10;
  }

  // ----------------------------------------------------
  // Financial Summary
  // ----------------------------------------------------
  curY += 6;
  const summaryBoxLeft = 115;
  const summaryBoxWidth = 81;

  doc.setFillColor(...lightBg);
  doc.roundedRect(summaryBoxLeft, curY, summaryBoxWidth, 38, 2, 2, 'F');
  doc.setDrawColor(210, 195, 175);
  doc.roundedRect(summaryBoxLeft, curY, summaryBoxWidth, 38, 2, 2, 'D');

  const subtotal = Number(order.subtotal) || 0;
  const discount = Number(order.discount) || 0;
  const shipping = Number(order.shippingFee) || 0;
  const total = Number(order.total) || (subtotal - discount + shipping);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(70, 85, 78);

  doc.text('Subtotal:', summaryBoxLeft + 6, curY + 7);
  doc.text(`${currencySymbol} ${subtotal.toLocaleString('en-IN')}`, 190, curY + 7, { align: 'right' });

  if (discount > 0) {
    doc.setTextColor(180, 40, 40);
    doc.text('Coupon Discount:', summaryBoxLeft + 6, curY + 14);
    doc.text(`- ${currencySymbol} ${discount.toLocaleString('en-IN')}`, 190, curY + 14, { align: 'right' });
  } else {
    doc.text('Discount:', summaryBoxLeft + 6, curY + 14);
    doc.text(`${currencySymbol} 0`, 190, curY + 14, { align: 'right' });
  }

  doc.setTextColor(70, 85, 78);
  doc.text('Express Shipping:', summaryBoxLeft + 6, curY + 21);
  doc.text(shipping === 0 ? 'FREE' : `${currencySymbol} ${shipping}`, 190, curY + 21, { align: 'right' });

  // Grand Total Line
  doc.setFillColor(...primaryColor);
  doc.rect(summaryBoxLeft, curY + 26, summaryBoxWidth, 12, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(200, 157, 56);
  doc.text('FINAL TOTAL:', summaryBoxLeft + 6, curY + 34);
  doc.text(`${currencySymbol} ${total.toLocaleString('en-IN')}`, 190, curY + 34, { align: 'right' });

  // ----------------------------------------------------
  // Notes & WhatsApp Instructions Box (Left Column)
  // ----------------------------------------------------
  doc.setFillColor(245, 250, 247);
  doc.roundedRect(14, curY, 94, 38, 2, 2, 'F');
  doc.setDrawColor(180, 215, 195);
  doc.roundedRect(14, curY, 94, 38, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryColor);
  doc.text('WHATSAPP ORDER CONFIRMATION:', 20, curY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(60, 75, 70);
  doc.text('1. Your order is pending verification by our master stylists.', 20, curY + 13);
  doc.text('2. Please send this summary via WhatsApp to confirm sizes.', 20, curY + 18);
  doc.text(`3. Dedicated WhatsApp Line: ${businessWhatsApp}`, 20, curY + 23);
  doc.text('4. Insured priority dispatch within 24-48 hours of confirmation.', 20, curY + 28);
  doc.text('5. 7-Day easy exchange on unworn fabrics with tags.', 20, curY + 33);

  // ----------------------------------------------------
  // Footer Banner
  // ----------------------------------------------------
  const footerY = 278;
  doc.setDrawColor(...goldColor);
  doc.line(14, footerY, 196, footerY);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(...mutedColor);
  doc.text('Aruvi Collections — Handcrafted with pride by South Indian artisans. Tradition in every thread.', 105, footerY + 5, { align: 'center' });
  doc.text(`${businessAddress}  |  ${businessEmail}`, 105, footerY + 9, { align: 'center' });

  return doc;
}

/**
 * Direct file download trigger for customer browser
 */
export function downloadOrderInvoicePDF(order, settings = {}) {
  const doc = generateOrderInvoicePDF(order, settings);
  const fileName = `Aruvi_Invoice_${order.id || Date.now()}.pdf`;
  doc.save(fileName);
}
