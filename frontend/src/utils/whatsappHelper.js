/**
 * Formats and generates the official WhatsApp Click-to-Chat message for Aruvi Collections orders.
 * Always routes directly to concierge WhatsApp: +91 86106 38978 (8610638978).
 */
export const OFFICIAL_BOUTIQUE_WHATSAPP = '918610638978';

export function formatWhatsAppOrderMessage(order, settings = {}) {
  let businessNumber = (settings?.whatsappNumber || OFFICIAL_BOUTIQUE_WHATSAPP).replace(/[^0-9]/g, '');
  if (!businessNumber || businessNumber.length === 10) {
    businessNumber = `91${businessNumber || '8610638978'}`;
  }
  if (!businessNumber.startsWith('91') && businessNumber.endsWith('8610638978')) {
    businessNumber = '918610638978';
  }

  const formattedDate = order.createdAt 
    ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleDateString('en-IN');

  const customerName = order.shipping?.name || order.customerName || 'Valued Patron';
  const customerMobile = order.shipping?.phone || order.customerPhone || 'N/A';
  const customerEmail = order.shipping?.email || order.customerEmail || '';
  const customerAddress = order.shipping?.address 
    ? `${order.shipping.address}, ${order.shipping.city || ''} - ${order.shipping.pincode || ''}, ${order.shipping.state || ''}`
    : 'Online Collection / WhatsApp Delivery';

  const itemsList = (order.items || []).map((item, idx) => {
    const title = item.title || item.name || 'Handcrafted Ensemble';
    const size = item.selectedSize || item.size || 'M';
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 1;
    const itemSub = price * qty;
    return `👗 ${idx + 1}. *${title}*\n   • Size: *${size}* | Qty: *${qty}* | Rate: ₹${price.toLocaleString('en-IN')}\n   • Subtotal: *₹${itemSub.toLocaleString('en-IN')}*`;
  }).join('\n\n');

  const subtotal = Number(order.subtotal) || 0;
  const discount = Number(order.discount) || 0;
  const shipping = Number(order.shippingFee) || 0;
  const grandTotal = Number(order.total) || (subtotal - discount + shipping);

  let message = `✨ *ARUVI COLLECTIONS - NEW ORDER PLACED* ✨\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `🧾 *Order ID:* #${order.id}\n`;
  message += `📅 *Date & Time:* ${formattedDate}\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  message += `👤 *CUSTOMER DETAILS:*\n`;
  message += `• Name: *${customerName}*\n`;
  message += `• Mobile: *${customerMobile}*\n`;
  if (customerEmail && !customerEmail.includes('guest@')) {
    message += `• Email: ${customerEmail}\n`;
  }
  message += `• Delivery Address:\n  ${customerAddress}\n\n`;

  message += `🛍️ *ORDERED ITEMS (${order.items?.length || 1}):*\n`;
  message += `${itemsList || 'No line items'}\n\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;

  message += `💰 *PAYMENT & BILLING:*\n`;
  message += `• Items Subtotal: ₹${subtotal.toLocaleString('en-IN')}\n`;
  if (discount > 0) {
    message += `• Promo Discount: -₹${discount.toLocaleString('en-IN')}\n`;
  }
  message += `• Delivery Fee: ${shipping === 0 ? '*FREE*' : `₹${shipping}`}\n`;
  message += `• *TOTAL PAYABLE: ₹${grandTotal.toLocaleString('en-IN')}*\n`;
  message += `• Payment Mode: *${(order.paymentMethod || 'UPI / Online').toUpperCase()}*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  message += `🙏 *Please confirm this order, verify dispatch availability, and share tracking details. Thank you!*`;

  const encodedUrl = `https://wa.me/${businessNumber}?text=${encodeURIComponent(message)}`;
  return {
    rawMessage: message,
    whatsappUrl: encodedUrl,
    businessNumber
  };
}

/**
 * Triggers opening WhatsApp in a new browser tab or WhatsApp app
 */
export function openWhatsAppOrderChat(order, settings = {}) {
  if (!order) return;
  const { whatsappUrl } = formatWhatsAppOrderMessage(order, settings);
  if (typeof window !== 'undefined') {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }
}
