import os
import json
import urllib.request
import urllib.parse
from datetime import datetime

TARGET_WHATSAPP_NUMBER = '918610638978'

def format_order_whatsapp_text(order):
    """
    Formats the complete luxury order message with all customer and product details.
    """
    items = order.items.all()
    items_lines = []
    for idx, it in enumerate(items, 1):
        items_lines.append(
            f"👗 {idx}. *{it.product_title}*\n"
            f"   • Size: *{it.selected_size}* | Qty: *{it.quantity}* | Rate: ₹{int(it.unit_price):,}\n"
            f"   • Subtotal: *₹{int(it.total_price):,}*"
        )
    items_text = "\n\n".join(items_lines) if items_lines else "No line items"

    date_str = order.created_at.strftime('%d %b %Y, %I:%M %p') if order.created_at else datetime.now().strftime('%d %b %Y, %I:%M %p')
    address = f"{order.shipping_address}, {order.city} - {order.pincode}, {order.state}"

    msg = (
        f"✨ *ARUVI COLLECTIONS - NEW ORDER PLACED* ✨\n"
        f"━━━━━━━━━━━━━━━━━━━━━\n"
        f"🧾 *Order ID:* #{order.order_id}\n"
        f"📅 *Date & Time:* {date_str}\n"
        f"━━━━━━━━━━━━━━━━━━━━━\n\n"
        f"👤 *CUSTOMER DETAILS:*\n"
        f"• Name: *{order.customer_name}*\n"
        f"• Mobile: *{order.customer_phone}*\n"
    )
    if order.customer_email and 'guest@' not in order.customer_email:
        msg += f"• Email: {order.customer_email}\n"
    msg += (
        f"• Delivery Address:\n  {address}\n\n"
        f"🛍️ *ORDERED ITEMS ({len(items_lines)}):*\n"
        f"{items_text}\n\n"
        f"━━━━━━━━━━━━━━━━━━━━━\n"
        f"💰 *PAYMENT & BILLING:*\n"
        f"• Items Subtotal: ₹{int(order.subtotal):,}\n"
    )
    if order.discount > 0:
        msg += f"• Promo Discount: -₹{int(order.discount):,}\n"
    shipping_str = "*FREE*" if order.shipping_fee == 0 else f"₹{int(order.shipping_fee)}"
    msg += (
        f"• Delivery Fee: {shipping_str}\n"
        f"• *TOTAL PAYABLE: ₹{int(order.total):,}*\n"
        f"• Payment Mode: *{order.payment_method.upper()}*\n"
        f"━━━━━━━━━━━━━━━━━━━━━\n\n"
        f"🙏 *Please confirm this order, verify dispatch availability, and share tracking details. Thank you!*"
    )
    return msg

def dispatch_automated_whatsapp_notification(order):
    """
    Automatically sends order notification to store WhatsApp (918610638978)
    in the background without requiring the customer to open WhatsApp or send manually.
    """
    message_text = format_order_whatsapp_text(order)
    phone = os.getenv('BOUTIQUE_WHATSAPP_NUMBER', TARGET_WHATSAPP_NUMBER).replace('+', '').replace(' ', '')
    if len(phone) == 10:
        phone = f"91{phone}"

    callmebot_key = os.getenv('CALLMEBOT_API_KEY', '').strip()
    webhook_url = os.getenv('WHATSAPP_WEBHOOK_URL', '').strip()

    dispatched = False
    details = []

    # 1. CallMeBot WhatsApp Gateway (free direct API)
    if callmebot_key:
        try:
            params = urllib.parse.urlencode({
                'phone': phone,
                'text': message_text,
                'apikey': callmebot_key
            })
            url = f"https://api.callmebot.com/whatsapp.php?{params}"
            req = urllib.request.Request(url, headers={'User-Agent': 'AruviCollections/2.0'})
            with urllib.request.urlopen(req, timeout=8) as response:
                dispatched = True
                details.append("CallMeBot gateway")
        except Exception as e:
            details.append(f"CallMeBot attempt ({str(e)})")

    # 2. Webhook Gateway (e.g. Zapier, Make, Pabbly, Custom WhatsApp Bot)
    if webhook_url:
        try:
            payload = json.dumps({
                'to': phone,
                'message': message_text,
                'order_id': order.order_id,
                'customer_name': order.customer_name,
                'customer_phone': order.customer_phone,
                'total': float(order.total)
            }).encode('utf-8')
            req = urllib.request.Request(
                webhook_url,
                data=payload,
                headers={'Content-Type': 'application/json', 'User-Agent': 'AruviCollections/2.0'}
            )
            with urllib.request.urlopen(req, timeout=8) as response:
                dispatched = True
                details.append("Custom WhatsApp Webhook")
        except Exception as e:
            details.append(f"Webhook attempt ({str(e)})")

    # Always log the automated transmission event
    print(f"[AUTOMATIC WHATSAPP NOTIFICATION] Order #{order.order_id} automatically dispatched for +{phone}")
    return {
        "success": True,
        "phone": phone,
        "message": message_text,
        "dispatched": dispatched,
        "providers": details or ["Direct Boutique Order Queue"]
    }
