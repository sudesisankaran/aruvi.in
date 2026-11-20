/**
 * Formats and generates the official WhatsApp Click-to-Chat message for Aruvi Collections orders
 */
export function formatWhatsAppOrderMessage(order, settings = {}) {
  const businessNumber = (settings.whatsappNumber || '918610638978').replace(/[^0-9]/g, '');
  const formattedDate = order.createdAt 
    ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN');

  const customerName = order.shipping?.name || order.customerName || 'Valued Patron';
  const customerMobile = order.shipping?.phone || order.customerPhone || 'N/A';
  const customerAddress = order.shipping?.address 
    ? `${order.shipping.address}, ${order.shipping.city || ''} - ${order.shipping.pincode || ''}, ${order.shipping.state || ''}`
    : 'Online Collection / WhatsApp Delivery';

  const itemsList = (order.items || []).map((item, idx) => {
    const title = item.title || item.name || 'Handcrafted Ensemble';
    const size = item.selectedSize || item.size || 'M';
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 1;
    const itemSub = price * qty;
    return `• ${idx + 1}. *${title}* (${size})\n  Qty: ${qty} × ₹${price.toLocaleString('en-IN')} = ₹${itemSub.toLocaleString('en-IN')}`;
  }).join('\n');

  const subtotal = Number(order.subtotal) || 0;
  const discount = Number(order.discount) || 0;
  const shipping = Number(order.shippingFee) || 0;
  const grandTotal = Number(order.total) || (subtotal - discount + shipping);

  let message = `*NEW CUSTOMER ORDER*\n\n`;
  message += `*Order ID:* #${order.id}\n`;
  message += `*Date:* ${formattedDate}\n\n`;
  message += `*CUSTOMER DETAILS:*\n`;
  message += `Name: ${customerName}\n`;
  message += `Mobile: ${customerMobile}\n`;
  message += `Delivery Address: ${customerAddress}\n\n`;
  message += `*PRODUCT DETAILS:*\n`;
  message += `${itemsList || 'No line items'}\n\n`;
  
  if (discount > 0) {
    message += `Subtotal: ₹${subtotal.toLocaleString('en-IN')}\n`;
    message += `Discount: -₹${discount.toLocaleString('en-IN')}\n`;
    message += `Shipping: ${shipping === 0 ? 'FREE' : `₹${shipping}`}\n`;
  }
  
  message += `*TOTAL AMOUNT:* ₹${grandTotal.toLocaleString('en-IN')}\n`;
  message += `Payment Method: ${(order.paymentMethod || 'UPI / Cash on Delivery').toUpperCase()}\n\n`;
  message += `Please confirm this order and advise on estimated dispatch time. Thank you! 🙏✨`;

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
  const { whatsappUrl } = formatWhatsAppOrderMessage(order, settings);
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
}
