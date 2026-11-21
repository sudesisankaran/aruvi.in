import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { downloadOrderInvoicePDF } from '../utils/pdfGenerator';
import { openWhatsAppOrderChat, formatWhatsAppOrderMessage } from '../utils/whatsappHelper';
import { MessageSquare, Download, CheckCircle2, Package, ArrowRight, ShieldCheck, Printer } from 'lucide-react';

export default function OrderSuccessPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, websiteSettings, addToast } = useStore();

  const order = orders.find((o) => String(o.id) === String(id)) || orders[0];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!order) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', color: '#0e2920' }}>Order Not Found</h2>
        <p style={{ color: '#667770', margin: '12px 0 24px' }}>We could not locate this order summary.</p>
        <Link to="/shop" className="btn btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  const handleDownloadPDF = () => {
    downloadOrderInvoicePDF(order, websiteSettings);
    addToast('Invoice PDF generated and downloaded!', 'success');
  };

  const handleOpenWhatsApp = () => {
    openWhatsAppOrderChat(order, websiteSettings);
    addToast('Opening WhatsApp to confirm your order...', 'info');
  };

  const subtotal = Number(order.subtotal) || 0;
  const discount = Number(order.discount) || 0;
  const shipping = Number(order.shippingFee) || 0;
  const total = Number(order.total) || (subtotal - discount + shipping);

  const formattedDate = order.createdAt 
    ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleDateString('en-IN');

  return (
    <div className="order-success-view py-12 px-4 sm:px-6 lg:px-8 bg-ivory/30 min-h-screen">
      <div className="max-w-3xl mx-auto">
        
        {/* Success Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-emerald-900/10 shadow-xl text-center relative overflow-hidden mb-8">
          
          {/* Top Decorative Header Accent */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-900 via-gold to-emerald-900" />

          {/* Success Check Icon */}
          <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-800 text-emerald-800 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest bg-gold/15 text-primary-dark border border-gold/40 mb-3">
            Order #{order.id}
          </span>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-primary-dark">
            Thank You! Your Order Is Placed.
          </h1>
          <p className="text-text-muted text-sm mt-1.5 max-w-lg mx-auto">
            Placed on {formattedDate}. Your order is currently <strong className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-bold">Pending Confirmation</strong>.
          </p>

          {/* Automatic Order Transmission Status Banner */}
          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-primary-dark text-white text-left shadow-lg border border-gold/40 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-gold font-bold text-sm tracking-wide uppercase">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Automatic Order Dispatch Confirmed</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-white">
                Order details transmitted automatically to our atelier (+91 86106 38978)
              </h3>
              <p className="text-xs text-emerald-100/80 max-w-md">
                No manual action required from you! Your order has been placed into our boutique dispatch queue. Our concierge team is verifying packaging and courier delivery.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 border border-emerald-400/30 text-xs font-semibold tracking-wide transition shadow-sm flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shrink-0"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Optional: Chat with Concierge</span>
            </button>
          </div>

          {/* Secondary Action Buttons (Download PDF & Print) */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="px-5 py-2.5 rounded-xl border border-emerald-900/20 hover:border-gold hover:bg-emerald-50/50 text-primary-dark text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4 text-emerald-800" />
              <span>Download Tax Invoice (PDF)</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-5 py-2.5 rounded-xl border border-emerald-900/20 hover:bg-emerald-50/50 text-primary-dark text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4 text-emerald-800" />
              <span>Print Order Slip</span>
            </button>
          </div>

        </div>

        {/* Order Details & Summary Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-sm space-y-6">
          
          <div className="flex items-center justify-between border-b border-emerald-900/10 pb-4">
            <h3 className="font-serif text-lg font-bold text-primary-dark flex items-center gap-2">
              <Package className="w-5 h-5 text-gold" />
              <span>Ensemble Summary ({order.items?.length || 0} Item{order.items?.length === 1 ? '' : 's'})</span>
            </h3>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">
              Payment: {order.paymentMethod?.toUpperCase()}
            </span>
          </div>

          {/* Line items list */}
          <div className="divide-y divide-emerald-900/5">
            {(order.items || []).map((item, idx) => (
              <div key={idx} className="py-3.5 flex items-center gap-4">
                <img
                  src={item.image || 'assets/images/anarkali_suit.jpg'}
                  alt={item.title}
                  className="w-14 h-16 object-cover rounded-xl border border-emerald-900/10 shadow-xs shrink-0"
                  onError={(e) => { e.currentTarget.src = 'assets/images/anarkali_suit.jpg'; }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-primary-dark truncate">{item.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-text-muted mt-0.5">
                    <span>Size: <strong className="text-primary-dark">{item.selectedSize || item.size || 'M'}</strong></span>
                    <span>•</span>
                    <span>Qty: <strong className="text-primary-dark">{item.quantity}</strong></span>
                    <span>•</span>
                    <span>₹{(Number(item.price) || 0).toLocaleString('en-IN')} each</span>
                  </div>
                </div>
                <div className="text-sm font-extrabold text-primary-dark whitespace-nowrap">
                  ₹{((Number(item.price) || 0) * (Number(item.quantity) || 1)).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>

          {/* Financial Breakdown */}
          <div className="bg-ivory/50 rounded-2xl p-4 space-y-2 text-xs border border-emerald-900/10">
            <div className="flex justify-between text-text-muted">
              <span>Items Subtotal:</span>
              <span className="font-semibold text-primary-dark">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Festive Coupon Savings:</span>
                <span>-₹{discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-text-muted">
              <span>Insured Priority Shipping:</span>
              <span className="font-semibold text-primary-dark">
                {shipping === 0 ? 'FREE' : `₹${shipping}`}
              </span>
            </div>
            <div className="border-t border-emerald-900/10 pt-2 flex justify-between text-base font-extrabold text-primary-dark">
              <span>Grand Total:</span>
              <span className="text-emerald-900 font-serif text-lg">₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Delivery & Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div className="p-4 rounded-xl border border-emerald-900/10 space-y-1">
              <strong className="block text-primary-dark font-bold uppercase tracking-wider text-[11px]">
                📍 Shipping Address
              </strong>
              <p className="text-text-muted font-medium">
                {order.shipping?.name}<br />
                {order.shipping?.address}<br />
                {order.shipping?.city}, {order.shipping?.state} - {order.shipping?.pincode}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-emerald-900/10 space-y-1">
              <strong className="block text-primary-dark font-bold uppercase tracking-wider text-[11px]">
                📞 Contact Information
              </strong>
              <p className="text-text-muted font-medium">
                Phone: {order.shipping?.phone}<br />
                Email: {order.shipping?.email || 'N/A'}<br />
                Concierge WhatsApp: +91 86106 38978
              </p>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-2 flex items-center justify-center gap-6 text-[11px] text-text-muted border-t border-emerald-900/10">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-gold" />
              100% Genuine Handloom Guarantee
            </span>
            <span>•</span>
            <span>7-Day Easy Exchange Policy</span>
          </div>

        </div>

        {/* Back to Shopping Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/shop"
            className="btn btn-primary hover-shimmer px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2"
          >
            <span>Explore More Handcrafted Silks</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/account"
            className="btn btn-secondary px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider"
          >
            Track in My Account
          </Link>
        </div>

      </div>
    </div>
  );
}
