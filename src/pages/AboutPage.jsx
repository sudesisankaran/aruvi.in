import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Award, ShieldCheck, HeartHandshake, Scissors, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="about-page-view py-12 px-4 sm:px-6 lg:px-8 bg-ivory/20 min-h-screen">
      <div className="max-w-6xl mx-auto">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-gold/15 text-primary-dark border border-gold/40 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-gold-dark" />
            <span>Our Heritage & Craftsmanship</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-primary-dark leading-tight">
            Tradition In Every Thread, <br />
            <span className="italic text-gold-dark">Elegance In Every Drape.</span>
          </h1>
          <p className="text-text-muted text-base sm:text-lg mt-4 leading-relaxed">
            Aruvi Collections is rooted in a profound reverence for Indian artisanal craftsmanship, weaving timeless South Indian handloom legacy with modern silhouettes for discerning women worldwide.
          </p>
        </div>

        {/* Story Section Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-gold/40">
            <img 
              src="assets/images/kanjivaram_green.jpg" 
              alt="Artisanal Handloom Craft" 
              className="w-full h-full object-cover max-h-[500px]"
              onError={(e) => { e.currentTarget.src = 'assets/images/kanjivaram_green.jpg'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent flex items-end p-8 text-white">
              <div>
                <span className="text-xs uppercase tracking-widest text-gold font-bold">Legacy Loom Craft</span>
                <p className="font-serif text-xl sm:text-2xl font-bold mt-1">Preserving Handloom Artistry for Generations</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-emerald-900/10 text-emerald-900 border border-emerald-900/20">
              The Aruvi Story
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary-dark">
              Where Ancient Weaving Meets Modern Sophistication
            </h2>
            <p className="text-text-muted leading-relaxed">
              Founded with the vision to celebrate genuine hand-woven textiles, Aruvi Collections partners directly with multigenerational master weavers and embroidery artisans across Tamil Nadu, Andhra Pradesh, and Rajasthan.
            </p>
            <p className="text-text-muted leading-relaxed">
              Each garment in our boutique undergoes weeks of meticulous attention — from yarn spinning and eco-conscious vegetable dyeing to intricate zari bordering and precision tailoring.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-emerald-900/10">
              <div className="p-4 rounded-2xl bg-white border border-emerald-900/10 shadow-sm">
                <strong className="block font-serif text-2xl text-primary-dark font-bold">100%</strong>
                <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Certified Weaves</span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-emerald-900/10 shadow-sm">
                <strong className="block font-serif text-2xl text-gold-dark font-bold">50+</strong>
                <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Artisan Families</span>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Values */}
        <div className="mb-20">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-primary-dark">The Pillars of Our Atelier</h3>
            <p className="text-text-muted text-sm mt-2">What sets every Aruvi creation apart</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white border border-emerald-900/10 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-900/10 text-primary-dark flex items-center justify-center mb-6">
                <Award className="w-6 h-6 text-emerald-900" />
              </div>
              <h4 className="font-serif text-xl font-bold text-primary-dark mb-2">Authentic Purity</h4>
              <p className="text-text-muted text-sm leading-relaxed">
                We use certified mulberry silks, organic linens, and natural modal fabrics with verifiable zari purity and featherlight feel.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-emerald-900/10 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-gold/20 text-gold-dark flex items-center justify-center mb-6">
                <Scissors className="w-6 h-6 text-gold-dark" />
              </div>
              <h4 className="font-serif text-xl font-bold text-primary-dark mb-2">Custom Couture Fit</h4>
              <p className="text-text-muted text-sm leading-relaxed">
                From precision necklines to bespoke bridal alterations, our in-house master tailors craft every drape to your exact proportions.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-emerald-900/10 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center mb-6">
                <HeartHandshake className="w-6 h-6 text-amber-700" />
              </div>
              <h4 className="font-serif text-xl font-bold text-primary-dark mb-2">Fair Trade & Dignity</h4>
              <p className="text-text-muted text-sm leading-relaxed">
                Direct artisan compensation guarantees sustainable livelihoods for weaving communities without exploitative intermediaries.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-primary-dark p-8 sm:p-12 text-white text-center shadow-xl border border-gold/40">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-3">
            Experience the Timeless Splendor of Aruvi
          </h2>
          <p className="text-emerald-100/80 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Explore our curated boutique collections or try our AI Virtual Fitting Room to preview outfits before you purchase.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/shop"
              className="px-7 py-3.5 rounded-xl bg-gold hover:bg-gold-light text-primary-dark font-extrabold text-sm tracking-wide uppercase transition shadow-md flex items-center gap-2"
            >
              <span>Explore Boutique</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/fitting-room"
              className="px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm tracking-wide uppercase transition"
            >
              ✨ Virtual Fitting Room
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
