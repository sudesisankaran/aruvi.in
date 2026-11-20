import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export default function ProductCard({ product }) {
  const { wishlist, toggleWishlist, addToCart, isAdmin } = useStore();
  const navigate = useNavigate();

  if (!product) return null;

  const isWishlisted = wishlist.includes(product.id);
  const currPrice = Number(product.price) || 0;
  const origPrice = Number(product.originalPrice) || currPrice;
  const discountPercent = origPrice > currPrice 
    ? Math.round(((origPrice - currPrice) / origPrice) * 100) 
    : 0;

  return (
    <article className="product-card card-3d hover-gold-glow" data-id={product.id}>
      <div className="product-media-wrap">
        {product.badge && (
          <span className={`product-badge-tag ${product.badgeType || 'tag-gold'}`}>
            {product.badge}
          </span>
        )}
        {discountPercent > 0 && (
          <span className="product-badge-tag tag-discount" style={{ left: 'auto', right: '60px' }}>
            {discountPercent}% OFF
          </span>
        )}

        {/* Wishlist Button */}
        <button 
          className={`btn-wishlist ${isWishlisted ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          aria-label="Add to Wishlist"
          title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>

        {/* Product Image Link */}
        <Link to={`/product/${product.id}`} className="product-img-link" style={{ display: 'block', width: '100%', height: '100%' }}>
          <img 
            src={product.image || 'assets/images/kanjivaram_green.jpg'} 
            alt={product.title} 
            loading="lazy" 
            onError={(e) => {
              e.currentTarget.src = 'assets/images/kanjivaram_green.jpg';
            }}
          />
        </Link>

        {/* Hover Quick Actions */}
        <div className="product-hover-actions">
          <Link to={`/product/${product.id}`} className="btn-quick-view" title="Quick View">
            View
          </Link>
          <button 
            type="button"
            className="btn-card-tryon btn-ai-tryon" 
            title="AI Virtual Try-On"
            onClick={() => navigate(`/fitting-room?productId=${product.id}`)}
          >
            🪞 Try-On
          </button>
          <button 
            type="button"
            className="btn-card-cart" 
            title="Add to Bag"
            onClick={() => addToCart(product, 1, product.sizes?.[0] || 'M')}
          >
            Add
          </button>
        </div>
      </div>

      <div className="product-content">
        <span className="product-category-text">
          {(product.category || '').toUpperCase()} • {product.fabric || 'Designer Handloom'}
        </span>
        <h3 className="product-title">
          <Link to={`/product/${product.id}`}>{product.title}</Link>
        </h3>

        <div className="product-rating-row">
          <span className="star-icons">★★★★★</span>
          <span className="rating-count">{product.rating || '4.9'} ({product.reviews || '24'})</span>
        </div>

        <div className="product-price-row">
          <span className="price-current">₹{currPrice.toLocaleString('en-IN')}</span>
          {origPrice > currPrice && (
            <span className="price-original">₹{origPrice.toLocaleString('en-IN')}</span>
          )}
        </div>

        {isAdmin && (
          <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed rgba(200,157,56,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: '#c89d38', fontWeight: 'bold' }}>👑 Admin Managed</span>
            <Link to={`/admin`} style={{ fontSize: '0.72rem', color: '#0e2920', textDecoration: 'underline' }}>Edit in Admin</Link>
          </div>
        )}
      </div>
    </article>
  );
}
