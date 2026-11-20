import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { MessageSquare, Phone, Mail, MapPin, Clock, Send, CheckCircle2, Sparkles } from 'lucide-react';

export default function ContactPage() {
  const { websiteSettings, addToast } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'Bridal & Bespoke Curation',
    message: ''
  });
  const [isSent, setIsSent] = useState(false);

  const whatsappNum = websiteSettings?.whatsappNumber || '918610638978';
  const cleanNumber = whatsappNum.replace(/[^0-9]/g, '');

  const handleWhatsAppDirect = () => {
    const text = encodeURIComponent(
      `Hello Aruvi Collections,\nI would like to inquire about bespoke tailoring, bridal collections, or an existing order.`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) {
      addToast('Please fill in your name, phone, and message.', 'error');
      return;
    }
    setIsSent(true);
    addToast('Thank you! Your concierge inquiry has been received.', 'success');
  };

  return (
    <div className="contact-page-view py-12 px-4 sm:px-6 lg:px-8 bg-ivory/20 min-h-screen">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-gold/15 text-primary-dark border border-gold/40 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-gold-dark" />
            <span>Dedicated Boutique Concierge</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-dark">
            We Are Here to Assist You
          </h1>
          <p className="text-text-muted text-sm sm:text-base mt-3">
            Have questions about custom sizing, bridal orders, fabric care, or order dispatches? Reach out via WhatsApp or submit a message below.
          </p>
        </div>

        {/* WhatsApp Highlight Hero Banner */}
        <div className="mb-12 p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-primary-dark text-white shadow-xl border border-gold/40 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold bg-gold/15 px-3 py-1 rounded-full border border-gold/30">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Priority Customer Support</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold">
              Instant WhatsApp Concierge
            </h2>
            <p className="text-sm text-emerald-100/80 max-w-lg">
              Get rapid answers on sizing, real video previews of fabrics, and instant order confirmations directly on WhatsApp.
            </p>
          </div>

          <button
            type="button"
            onClick={handleWhatsAppDirect}
            className="w-full md:w-auto px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-primary-dark font-extrabold text-sm tracking-wide uppercase transition shadow-lg flex items-center justify-center gap-3 cursor-pointer shrink-0"
          >
            <MessageSquare className="w-5 h-5 text-primary-dark" />
            <span>Chat on WhatsApp (+{cleanNumber})</span>
          </button>
        </div>

        {/* 2-Column Grid: Contact Information & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
          
          {/* Info Column (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-sm space-y-6">
              <h3 className="font-serif text-xl font-bold text-primary-dark border-b border-emerald-900/10 pb-3">
                Boutique Headquarters
              </h3>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-900/10 text-primary-dark flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-emerald-900" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Atelier Location</h4>
                  <p className="text-sm text-primary-dark font-medium mt-0.5">
                    {websiteSettings?.address || 'Aruvi Heritage Square, Cathedral Road, Chennai, Tamil Nadu 600086, India'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-900/10 text-primary-dark flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-emerald-900" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Direct Phone / Helpline</h4>
                  <p className="text-sm text-primary-dark font-medium mt-0.5">
                    {websiteSettings?.phone || '+91 86106 38978'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-900/10 text-primary-dark flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-emerald-900" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Concierge Email</h4>
                  <p className="text-sm text-primary-dark font-medium mt-0.5">
                    {websiteSettings?.email || 'concierge@aruvicollections.com'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-900/10 text-primary-dark flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-emerald-900" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Boutique Hours</h4>
                  <p className="text-sm text-primary-dark font-medium mt-0.5">
                    Monday – Saturday: 10:00 AM – 8:00 PM IST<br />
                    Sunday: 11:00 AM – 6:00 PM IST
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Column (3 cols) */}
          <div className="lg:col-span-3 bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-sm">
            {isSent ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto border-2 border-emerald-700">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-primary-dark">Inquiry Sent Successfully!</h3>
                <p className="text-text-muted text-sm max-w-md mx-auto">
                  Thank you for contacting Aruvi Collections. Our boutique stylist will get in touch with you within 2 business hours.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSent(false)}
                  className="px-6 py-2.5 rounded-xl bg-primary-dark text-white font-bold text-xs uppercase tracking-wider"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="font-serif text-xl font-bold text-primary-dark border-b border-emerald-900/10 pb-3">
                  Send A Message
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-primary-dark mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Radhika Sundaram"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-emerald-900/20 text-sm focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-primary-dark mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-emerald-900/20 text-sm focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-primary-dark mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. radhika@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-emerald-900/20 text-sm focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-primary-dark mb-1.5">
                      Subject
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-emerald-900/20 text-sm focus:outline-none focus:border-gold bg-white"
                    >
                      <option value="Bridal & Bespoke Curation">Bridal & Bespoke Curation</option>
                      <option value="Custom Size Alterations">Custom Size Alterations</option>
                      <option value="Order Status & Tracking">Order Status & Tracking</option>
                      <option value="Wholesale & Bulk Orders">Wholesale & Bulk Orders</option>
                      <option value="General Feedback">General Feedback</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-primary-dark mb-1.5">
                    Your Message / Requirements *
                  </label>
                  <textarea
                    required
                    rows="4"
                    placeholder="Tell us about the outfit, measurements, wedding date, or question..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-emerald-900/20 text-sm focus:outline-none focus:border-gold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-primary-dark hover:bg-emerald-950 text-gold font-bold text-sm uppercase tracking-wider transition shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message to Concierge</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
