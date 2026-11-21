import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';

export default function ShopPage() {
  const { products, categories, searchQuery, websiteSettings } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const waNumber = (websiteSettings?.whatsappNumber || '918610638978').replace(/[^0-9]/g, '');

  // Active category and search from URL query param
  const activeCategory = searchParams.get('category') || 'all';
  const urlSearch = searchParams.get('search') || '';
  const effectiveSearch = (urlSearch || searchQuery || '').trim().toLowerCase();

  // Filters & Sorting state
  const [selectedSort, setSelectedSort] = useState('featured');
  const [maxPrice, setMaxPrice] = useState(25000);
  const [selectedFabric, setSelectedFabric] = useState('all');

  // Handle Category Pill Click
  const handleCategoryChange = (catId) => {
    const nextParams = new URLSearchParams(searchParams);
    if (catId === 'all') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', catId);
    }
    setSearchParams(nextParams);
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      if (activeCategory !== 'all' && (product.category || '').toLowerCase() !== activeCategory.toLowerCase()) {
        return false;
      }

      // Search Query filter (from global search in header or query string)
      if (effectiveSearch) {
        const matchTitle = (product.title || '').toLowerCase().includes(effectiveSearch);
        const matchCat = (product.category || '').toLowerCase().includes(effectiveSearch);
        const matchFabric = (product.fabric || '').toLowerCase().includes(effectiveSearch);
        if (!matchTitle && !matchCat && !matchFabric) {
          return false;
        }
      }

      // Price filter
      const price = Number(product.price) || 0;
      if (price > maxPrice) {
        return false;
      }

      // Fabric filter
      if (selectedFabric !== 'all' && product.fabric !== selectedFabric) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = Number(a.price) || 0;
      const priceB = Number(b.price) || 0;
      if (selectedSort === 'price-low') return priceA - priceB;
      if (selectedSort === 'price-high') return priceB - priceA;
      if (selectedSort === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0; // featured / default
    });
  }, [products, activeCategory, searchQuery, maxPrice, selectedFabric, selectedSort]);

  // Unique fabrics in catalog
  const uniqueFabrics = useMemo(() => {
    const set = new Set();
    products.forEach(p => {
      if (p.fabric) set.add(p.fabric);
    });
    return Array.from(set);
  }, [products]);

  // Current category name for title
  const currentCategoryObj = categories.find(c => c.id === activeCategory);
  const displayTitle = currentCategoryObj ? currentCategoryObj.name : 'All Boutique Collections';

  return (
    <div className="shop-page-view" style={{ padding: '30px 0 80px' }}>
      <div className="container">

        {/* Page Header */}
        <div className="shop-header-banner" style={{ textAlign: 'center', marginBottom: '28px' }}>
          <span style={{ color: 'var(--color-gold)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}>
            Curated Wardrobe
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: '#0e2920', marginTop: '6px' }}>
            {displayTitle}
          </h1>
          <p style={{ color: '#667770', fontSize: '0.95rem', maxWidth: '600px', margin: '8px auto 0' }}>
            Showing {filteredProducts.length} handcrafted piece{filteredProducts.length === 1 ? '' : 's'} tailored for celebrations, everyday chic, and festive grace.
          </p>
        </div>

        {/* 9 Category Pills Horizontal Scroller */}
        <div className="category-pills-bar" style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '32px', scrollbarWidth: 'thin' }}>
          <button 
            type="button"
            className={`category-pill ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('all')}
            style={{
              padding: '8px 18px',
              borderRadius: '99px',
              border: activeCategory === 'all' ? '2px solid var(--color-primary)' : '1px solid #d4c8b8',
              background: activeCategory === 'all' ? 'var(--color-primary)' : '#fff',
              color: activeCategory === 'all' ? '#fff' : '#0e2920',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
          >
            ✨ All Items
          </button>

          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button 
                key={cat.id}
                type="button"
                className={`category-pill ${isActive ? 'active' : ''}`}
                onClick={() => handleCategoryChange(cat.id)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '99px',
                  border: isActive ? '2px solid var(--color-primary)' : '1px solid #d4c8b8',
                  background: isActive ? 'var(--color-primary)' : '#fff',
                  color: isActive ? '#fff' : '#0e2920',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                }}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Filters and Sorting Control Bar */}
        <div className="shop-controls-bar" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', padding: '16px 20px', background: '#fbf9f6', borderRadius: '12px', border: '1px solid rgba(200,157,56,0.2)', marginBottom: '32px' }}>
          
          {/* Price Range */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '220px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0e2920' }}>Max Price: ₹{maxPrice.toLocaleString('en-IN')}</span>
            <input 
              type="range" 
              min="500" 
              max="25000" 
              step="500"
              value={maxPrice} 
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              style={{ accentColor: 'var(--color-primary)', cursor: 'pointer' }}
            />
          </div>

          {/* Fabric Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label htmlFor="shop-fabric" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0e2920' }}>Fabric:</label>
            <select 
              id="shop-fabric"
              value={selectedFabric} 
              onChange={(e) => setSelectedFabric(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.85rem', background: '#fff' }}
            >
              <option value="all">All Fabrics</option>
              {uniqueFabrics.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label htmlFor="shop-sort" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0e2920' }}>Sort By:</label>
            <select 
              id="shop-sort"
              value={selectedSort} 
              onChange={(e) => setSelectedSort(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.85rem', background: '#fff' }}
            >
              <option value="featured">Featured / Curated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>

        </div>

        {/* Product Grid or Empty State */}
        {filteredProducts.length > 0 ? (
          <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '28px' }}>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="empty-shop-state" style={{ textAlign: 'center', padding: '70px 20px', background: '#fff', borderRadius: '20px', border: '1.5px dashed rgba(200,157,56,0.3)', boxShadow: '0 6px 20px rgba(14,41,32,0.03)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>👗</div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#0e2920' }}>New Collections Arriving Soon</h3>
            <p style={{ color: '#667770', fontSize: '0.95rem', margin: '8px auto 24px', maxWidth: '460px', lineHeight: 1.6 }}>
              Our boutique collections are currently being curated with fresh handcrafted designs. Feel free to browse categories or connect with us directly on WhatsApp for custom orders.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/categories" className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '0.88rem' }}>
                ✨ Explore Categories
              </Link>
              <a 
                href={`https://wa.me/${waNumber}?text=Hi%20Aruvi%20Collections,%20I%20would%20like%20to%20inquire%20about%20your%20boutique%20collections.`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary" 
                style={{ padding: '10px 24px', fontSize: '0.88rem' }}
              >
                💬 WhatsApp Concierge
              </a>
            </div>
          </div>
        ) : (
          <div className="empty-shop-state" style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px', border: '1px dashed #d4c8b8' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>👗</div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#0e2920' }}>No garments match your filters</h3>
            <p style={{ color: '#667770', fontSize: '0.92rem', margin: '8px auto 20px', maxWidth: '400px' }}>
              Try adjusting your price slider, clearing search keywords, or selecting another category.
            </p>
            <button 
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setMaxPrice(25000);
                setSelectedFabric('all');
                handleCategoryChange('all');
              }}
            >
              Reset All Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
