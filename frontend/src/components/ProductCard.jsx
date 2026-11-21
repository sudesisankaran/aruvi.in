import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { getProductImageUrl, handleImageError } from '../utils/imageUtils';

export default function ProductCard({ product }) {
  const { wishlist, toggleWishlist, addToCart, user, isAdmin } = useStore();
  const navigate = useNavigate();

  const isStrictAdmin = Boolean(isAdmin) && (user?.email || '').trim().toLowerCase() === 'aruvicollections.25@gmail.com';

  if (!product) return null;

  const isWishlisted = wishlist.includes(product.id);
  const currPrice = Number(product.price) || 0;
  const origPrice = Number(product.originalPrice) || currPrice;
  const discountPercent = origPrice > currPrice 
    ? Math.round(((origPrice - currPrice) / origPrice) * 100) 
    : 0;

  const stockVal = product.stock !== undefined ? Number(product.stock) : 15;
  const isOutOfStock = stockVal <= 0 || product.status === 'out_of_stock';

  const handleOrderNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1, product.sizes?.[0] || 'M');
    navigate('/checkout');
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1, product.sizes?.[0] || 'M');
  };

  const displayImage = getProductImageUrl(product);

  return (
    <article className="product-card card-3d hover-gold-glow" data-id={product.id}>
      <div className="product-media-wrap">
        
        {/* Badges */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', flexDirection: 'column', gap: '6px', zIndex: 4 }}>
          {product.badge && (
            <span className={`product-badge-tag ${product.badgeType || 'tag-gold'}`}>
              {product.badge}
            </span>
          )}
          {discountPercent > 0 && (
            <span className="product-badge-tag tag-discount" style={{ background: '#c93b3b', color: '#fff' }}>
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Stock Badge Overlay */}
        <div style={{ position: 'absolute', bottom: '12px', left: '12px', zIndex: 4 }}>
          {isOutOfStock ? (
            <span style={{ fontSize: '0.72rem', color: '#fff', fontWeight: 700, background: 'rgba(220,38,38,0.92)', padding: '3px 9px', borderRadius: '6px', backdropFilter: 'blur(4px)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              ✕ Out of Stock
            </span>
          ) : stockVal < 5 ? (
            <span style={{ fontSize: '0.72rem', color: '#fff', fontWeight: 700, background: 'rgba(217,119,6,0.92)', padding: '3px 9px', borderRadius: '6px', backdropFilter: 'blur(4px)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              ⚠ Low Stock: {stockVal} left
            </span>
          ) : (
            <span style={{ fontSize: '0.72rem', color: '#fff', fontWeight: 700, background: 'rgba(4,120,87,0.92)', padding: '3px 9px', borderRadius: '6px', backdropFilter: 'blur(4px)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              ● In Stock
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button 
          type="button"
          className={`btn-wishlist ${isWishlisted ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label="Add to Wishlist"
          title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
          style={{ zIndex: 6 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>

        {/* Product Image Link */}
        <Link to={`/product/${product.id}`} className="product-img-link" style={{ display: 'block', width: '100%', height: '100%' }}>
          <img 
            src={displayImage} 
            alt={product.title} 
            loading="lazy" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => handleImageError(e)}
          />
        </Link>

        {/* Hover Quick Actions */}
        <div className="product-hover-actions">
          <Link to={`/product/${product.id}`} className="btn-quick-view" title="View Full Details">
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
          {!isOutOfStock && (
            <button 
              type="button"
              className="btn-card-cart" 
              title="Add to Shopping Bag"
              onClick={handleAddToCart}
            >
              + Bag
            </button>
          )}
        </div>
      </div>

      <div className="product-content">
        <span className="product-category-text">
          {(product.category || '').toUpperCase().replace('-', ' ')} • {product.fabric || 'Pure Handloom'}
        </span>
        
        <h3 className="product-title">
          <Link to={`/product/${product.id}`}>{product.title}</Link>
        </h3>

        {/* Rating Row & Stock Availability */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '4px 0 6px' }}>
          <div className="product-rating-row" style={{ margin: 0 }}>
            <span className="star-icons">★★★★★</span>
            <span className="rating-count">{product.rating || '4.9'} ({product.reviews || '18'})</span>
          </div>
          <span style={{ fontSize: '0.73rem', fontWeight: 600, color: isOutOfStock ? '#dc2626' : '#047857' }}>
            {isOutOfStock ? 'Unavailable' : `${stockVal} in stock`}
          </span>
        </div>

        {/* Price Row */}
        <div className="product-price-row" style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
          <span className="price-current">₹{currPrice.toLocaleString('en-IN')}</span>
          {origPrice > currPrice && (
            <span className="price-original">₹{origPrice.toLocaleString('en-IN')}</span>
          )}
          {discountPercent > 0 && (
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c93b3b' }}>
              ({discountPercent}% OFF)
            </span>
          )}
        </div>

        {/* View Details & Order Now Action Buttons */}
        <div className="product-card-cta-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: '8px', marginTop: '10px' }}>
          <Link 
            to={`/product/${product.id}`} 
            className="btn btn-sm btn-secondary"
            style={{
              padding: '8px 10px',
              fontSize: '0.8rem',
              fontWeight: 700,
              textAlign: 'center',
              borderRadius: '9px',
              border: '1.5px solid rgba(200,157,56,0.4)',
              background: '#fcfaf6',
              color: '#0e2920',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            View Details
          </Link>
          <button 
            type="button"
            onClick={handleOrderNow}
            disabled={isOutOfStock}
            className="btn btn-sm btn-primary hover-shimmer"
            style={{
              padding: '8px 10px',
              fontSize: '0.8rem',
              fontWeight: 700,
              textAlign: 'center',
              borderRadius: '9px',
              background: isOutOfStock ? '#9ca3af' : 'var(--color-primary)',
              color: '#ffffff',
              border: 'none',
              cursor: isOutOfStock ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              boxShadow: isOutOfStock ? 'none' : '0 3px 10px rgba(14,41,32,0.18)'
            }}
          >
            {isOutOfStock ? 'Sold Out' : '⚡ Order Now'}
          </button>
        </div>

        {isStrictAdmin && (
          <div style={{ marginTop: '10px', paddingTop: '6px', borderTop: '1px dashed rgba(200,157,56,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: '#c89d38', fontWeight: 'bold' }}>👑 Admin Managed (ID: #{product.id})</span>
            <Link to={`/admin/products`} style={{ fontSize: '0.72rem', color: '#0e2920', textDecoration: 'underline' }}>Edit in Dashboard</Link>
          </div>
        )}
      </div>
    </article>
  );
}
