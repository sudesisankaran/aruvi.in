import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ArrowRight, Sparkles, Layers } from 'lucide-react';
import { handleImageError } from '../utils/imageUtils';

export default function CategoriesPage() {
  const { categories, products } = useStore();

  return (
    <div className="categories-page-view py-12 px-4 sm:px-6 lg:px-8 bg-ivory/30 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-gold/15 text-primary-dark border border-gold/40 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-gold-dark" />
            <span>Boutique Collections & Services</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-dark">
            Explore Handcrafted Categories
          </h1>
          <p className="text-text-muted text-sm sm:text-base mt-3">
            From imperial Kanjivaram silks and royal shararas to contemporary chic co-ords and party maxis, discover master craftsmanship tailored for your special celebrations.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat) => {
            const count = products.filter(
              (p) => (p.category || '').toLowerCase() === cat.id.toLowerCase()
            ).length;

            return (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.id}`}
                className="group relative bg-white rounded-3xl overflow-hidden border border-emerald-900/10 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1"
              >
                {/* Image Frame */}
                <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-emerald-950">
                  <img
                    src={cat.image || 'assets/images/category_salwar.jpg'}
                    alt={cat.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      if (!e.currentTarget.dataset.fallbackApplied) {
                        e.currentTarget.dataset.fallbackApplied = 'true';
                        e.currentTarget.src = 'assets/images/category_salwar.jpg';
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-emerald-950/20 to-transparent" />
                  
                  {/* Badge & Count */}
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur text-primary-dark shadow">
                      {count} {count === 1 ? 'Design' : 'Designs'}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 z-10 text-white">
                    <span className="text-xs font-bold tracking-widest text-gold uppercase block mb-1">
                      Aruvi Heritage
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-white group-hover:text-gold transition-colors">
                      {cat.name}
                    </h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between bg-white">
                  <p className="text-text-muted text-sm line-clamp-2 mb-4 leading-relaxed">
                    {cat.description || `Discover curated ${cat.name.toLowerCase()} handcrafted with timeless drapes and artisanal embroidery.`}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-emerald-900/10 text-primary-dark font-bold text-sm group-hover:text-gold-dark transition-colors">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-gold-dark" />
                      Browse Collection
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-16 rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-primary-dark p-8 sm:p-12 text-white text-center shadow-xl border border-gold/30">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-3">
            Looking for Custom Curation or Bespoke Bridal Sizing?
          </h2>
          <p className="text-sm sm:text-base text-emerald-100/80 max-w-2xl mx-auto mb-6">
            Our atelier artisans handcraft custom measurements and special color drapes. Connect with our concierge team directly on WhatsApp for personal assistance.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/contact"
              className="px-6 py-3 rounded-xl bg-gold hover:bg-gold-light text-primary-dark font-bold text-sm tracking-wide uppercase transition shadow"
            >
              Contact Concierge
            </Link>
            <Link
              to="/shop"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm tracking-wide uppercase transition"
            >
              View All Products
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
