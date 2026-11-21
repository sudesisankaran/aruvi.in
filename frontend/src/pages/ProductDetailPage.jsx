import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import { getProductImageUrl, handleImageError, NEUTRAL_PRODUCT_FALLBACK } from '../utils/imageUtils';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, toggleWishlist, wishlist, websiteSettings } = useStore();

  const product = products.find(p => String(p.id) === String(id));
  
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);

  if (!product) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', color: '#0e2920' }}>Garment Not Found</h2>
        <p style={{ color: '#667770', margin: '12px 0 24px' }}>The handcrafted drape you are looking for is currently unavailable or has been archived.</p>
        <Link to="/shop" className="btn btn-primary">Return to Collections</Link>
      </div>
    );
  }

  const isWishlisted = wishlist.includes(product.id);
  const currPrice = Number(product.price) || 0;
  const origPrice = Number(product.originalPrice) || currPrice;
  const discountPercent = origPrice > currPrice 
    ? Math.round(((origPrice - currPrice) / origPrice) * 100) 
    : 0;

  const stockVal = product.stock !== undefined ? Number(product.stock) : 15;
  const isOutOfStock = stockVal <= 0 || product.status === 'out_of_stock';

  const sizes = product.sizes || ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const allImages = useMemo(() => {
    const list = [];
    if (product.image && !product.image.includes('kanjivaram_green.jpg')) {
      list.push(product.image);
    }
    if (Array.isArray(product.images)) {
      product.images.forEach(img => {
        const url = typeof img === 'string' ? img : (img.image_url || img.url);
        if (url && !list.includes(url) && !url.includes('kanjivaram_green.jpg')) {
          list.push(url);
        }
      });
    }
    if (list.length === 0 && product.image) {
      list.push(product.image);
    }
    return list.length > 0 ? list : [NEUTRAL_PRODUCT_FALLBACK];
  }, [product]);

  const activeImage = selectedImage || allImages[0];

  // Related products from same category
  const relatedProducts = products
    .filter(p => p.category === product.category && String(p.id) !== String(product.id) && (p.status || 'active') === 'active')
    .slice(0, 4);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedSize);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedSize);
    navigate('/checkout');
  };

  const handleWhatsAppOrder = () => {
    const rawNumber = websiteSettings?.whatsappNumber || '918610638978';
    const cleanNumber = rawNumber.replace(/[^0-9]/g, '');
    const lineTotal = currPrice * quantity;
    const msg = 
`*NEW CUSTOMER ORDER INQUIRY*

*Product:* ${product.title}
*SKU:* ${product.sku || 'N/A'}
*Price:* ₹${currPrice.toLocaleString('en-IN')}
*Size:* ${selectedSize}
*Quantity:* ${quantity}
*Total Amount:* ₹${lineTotal.toLocaleString('en-IN')}

Please confirm availability and dispatch timeline.`;
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="product-detail-view" style={{ padding: '40px 0 80px' }}>
      <div className="container">
        
        {/* Breadcrumb */}
        <nav style={{ fontSize: '0.85rem', color: '#667770', marginBottom: '28px' }}>
          <Link to="/" style={{ color: '#0e2920' }}>Home</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <Link to={`/shop?category=${product.category}`} style={{ color: '#0e2920', textTransform: 'capitalize' }}>
            {product.category?.replace('-', ' ')}
          </Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: 'var(--color-gold)' }}>{product.title}</span>
        </nav>

        {/* Product Details 2-Column Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '50px', alignItems: 'start' }}>
          
          {/* Gallery Media Column */}
          <div className="detail-media-col" style={{ position: 'sticky', top: '90px' }}>
            <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 16px 36px rgba(0,0,0,0.1)', border: '1px solid rgba(200,157,56,0.3)', background: '#fff' }}>
              <img 
                src={activeImage} 
                alt={product.title}
                style={{ width: '100%', maxHeight: '580px', objectFit: 'cover' }}
                onError={(e) => handleImageError(e)}
              />
              {product.badge && (
                <span className="product-badge-tag tag-gold" style={{ position: 'absolute', top: '16px', left: '16px' }}>
                  {product.badge}
                </span>
              )}
              {isOutOfStock && (
                <span style={{ position: 'absolute', top: '16px', right: '16px', background: '#dc2626', color: '#fff', fontSize: '0.78rem', fontWeight: 700, padding: '4px 10px', borderRadius: '99px' }}>
                  Out of Stock
                </span>
              )}
            </div>

            {/* Thumbnail Gallery (when multiple images present) */}
            {allImages.length > 1 && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '14px', overflowX: 'auto', paddingBottom: '6px' }}>
                {allImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(imgUrl)}
                    style={{
                      width: '68px',
                      height: '78px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: activeImage === imgUrl ? '2.5px solid var(--color-gold)' : '1px solid #d4c8b8',
                      padding: 0,
                      background: '#fff',
                      cursor: 'pointer',
                      flexShrink: 0,
                      boxShadow: activeImage === imgUrl ? '0 4px 12px rgba(200,157,56,0.3)' : 'none'
                    }}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Column */}
          <div className="detail-info-col">
            <span style={{ display: 'inline-block', color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '1.5px', fontSize: '0.82rem', fontWeight: 700, marginBottom: '8px' }}>
              {product.category?.replace('-', ' ').toUpperCase()} • {product.fabric || 'HANDLOOM SILK'}
            </span>

            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: '#0e2920', lineHeight: 1.25, marginBottom: '10px' }}>
              {product.title}
            </h1>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ color: '#c89d38', letterSpacing: '2px' }}>★★★★★</span>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0e2920' }}>{product.rating || '4.9'}</span>
              <span style={{ fontSize: '0.82rem', color: '#667770' }}>({product.reviews || '38'} verified reviews)</span>
            </div>

            {/* Price Row */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', marginBottom: '16px' }}>
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0e2920' }}>
                ₹{currPrice.toLocaleString('en-IN')}
              </span>
              {origPrice > currPrice && (
                <span style={{ fontSize: '1.2rem', textDecoration: 'line-through', color: '#889990' }}>
                  ₹{origPrice.toLocaleString('en-IN')}
                </span>
              )}
              {discountPercent > 0 && (
                <span style={{ background: 'rgba(201, 59, 59, 0.1)', color: '#c93b3b', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Stock Availability Indicator */}
            <div style={{ marginBottom: '20px' }}>
              {isOutOfStock ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', background: 'rgba(220, 38, 38, 0.1)', color: '#dc2626', fontSize: '0.84rem', fontWeight: 700 }}>
                  ✕ Out of Stock (Currently Unavailable)
                </span>
              ) : stockVal < 5 ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', background: 'rgba(217, 119, 6, 0.1)', color: '#d97706', fontSize: '0.84rem', fontWeight: 700 }}>
                  ⚠ Limited Stock: Only {stockVal} left!
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', background: 'rgba(4, 120, 87, 0.1)', color: '#047857', fontSize: '0.84rem', fontWeight: 700 }}>
                  ● In Stock ({stockVal} available)
                </span>
              )}
            </div>

            <p style={{ color: '#4a5d55', lineHeight: 1.6, fontSize: '0.96rem', marginBottom: '24px' }}>
              {product.description || 'Artisanal masterpiece woven with intricate attention to detail, fine zari accents, and supreme comfort. Perfect for festive celebrations, weddings, and distinguished gatherings.'}
            </p>

            {/* Size Selector */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0e2920' }}>Select Size:</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--color-primary)', textDecoration: 'underline', cursor: 'pointer' }}>Size Guide</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    style={{
                      width: '46px',
                      height: '42px',
                      borderRadius: '8px',
                      border: selectedSize === s ? '2px solid var(--color-primary)' : '1px solid #d4c8b8',
                      background: selectedSize === s ? '#0e2920' : '#fff',
                      color: selectedSize === s ? '#fff' : '#0e2920',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0e2920' }}>Quantity:</span>
              <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #d4c8b8', borderRadius: '6px', background: '#fff' }}>
                <button 
                  type="button" 
                  disabled={isOutOfStock}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ width: '36px', height: '36px', border: 'none', background: 'none', cursor: isOutOfStock ? 'not-allowed' : 'pointer', fontSize: '1.1rem' }}
                >
                  -
                </button>
                <span style={{ width: '36px', textAlign: 'center', fontWeight: 600 }}>{isOutOfStock ? 0 : quantity}</span>
                <button 
                  type="button" 
                  disabled={isOutOfStock || quantity >= stockVal}
                  onClick={() => setQuantity(Math.min(stockVal, quantity + 1))}
                  style={{ width: '36px', height: '36px', border: 'none', background: 'none', cursor: isOutOfStock || quantity >= stockVal ? 'not-allowed' : 'pointer', fontSize: '1.1rem' }}
                >
                  +
                </button>
              </div>
              {quantity >= stockVal && !isOutOfStock && (
                <span style={{ fontSize: '0.78rem', color: '#d97706' }}>Max available quantity</span>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
              <button 
                type="button" 
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="btn btn-primary hover-shimmer"
                style={{
                  flex: 1,
                  minWidth: '160px',
                  padding: '14px 20px',
                  fontWeight: 600,
                  opacity: isOutOfStock ? 0.6 : 1,
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                }}
              >
                {isOutOfStock ? 'Out of Stock' : '👜 Add to Bag'}
              </button>

              <button 
                type="button" 
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="btn btn-secondary"
                style={{
                  flex: 1,
                  minWidth: '160px',
                  padding: '14px 20px',
                  fontWeight: 600,
                  background: isOutOfStock ? '#ccc' : 'var(--color-gold)',
                  color: '#0e2920',
                  border: 'none',
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                }}
              >
                {isOutOfStock ? 'Sold Out' : '⚡ Buy Now'}
              </button>

              <button 
                type="button"
                onClick={() => toggleWishlist(product.id)}
                style={{
                  width: '50px',
                  borderRadius: '8px',
                  border: '1px solid #d4c8b8',
                  background: isWishlisted ? 'rgba(201,59,59,0.1)' : '#fff',
                  color: isWishlisted ? '#c93b3b' : '#0e2920',
                  fontSize: '1.3rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
              >
                {isWishlisted ? '❤️' : '🤍'}
              </button>
            </div>

            {/* Direct WhatsApp Order Button */}
            <button
              type="button"
              onClick={handleWhatsAppOrder}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm tracking-wide uppercase transition shadow flex items-center justify-center gap-2 mb-6 cursor-pointer"
            >
              <span className="text-lg">💬</span>
              <span>Order via WhatsApp Direct</span>
            </button>

            {/* AI Try-on Box */}
            <div style={{ background: 'linear-gradient(135deg, rgba(200,157,56,0.14) 0%, rgba(14,41,32,0.06) 100%)', border: '1.5px solid rgba(200,157,56,0.45)', borderRadius: '14px', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', marginBottom: '28px', boxShadow: '0 4px 16px rgba(200,157,56,0.1)' }}>
              <div>
                <strong style={{ color: '#0e2920', fontSize: '0.95rem', display: 'block' }}>✨ AI Virtual Fitting Room</strong>
                <span style={{ fontSize: '0.82rem', color: '#55665f', display: 'block', marginTop: '2px' }}>
                  Visualize this handcrafted ensemble on our diverse boutique models or with your photo!
                </span>
              </div>
              <button 
                type="button"
                className="btn btn-sm btn-primary hover-shimmer"
                onClick={() => navigate(`/fitting-room?productId=${product.id}`)}
                style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', fontWeight: 700 }}
              >
                <span>🪞 Try-On Now</span>
              </button>
            </div>

            {/* Delivery & Guarantees */}
            <div style={{ borderTop: '1px solid #e2dad0', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: '#4a5d55' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>✨</span>
                <span>100% Genuine Handcrafted Fabric with Boutique Guarantee</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🚚</span>
                <span>Free Insured Express Delivery across India (3 - 5 business days)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🔄</span>
                <span>7-Day Easy Returns & Exchange Policy</span>
              </div>
            </div>

          </div>

        </div>

        {/* Related Outfits */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: '70px', borderTop: '1px solid rgba(200,157,56,0.2)', paddingTop: '40px' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: '#0e2920', marginBottom: '24px' }}>
              Complete The Look: More In {product.category?.replace('-', ' ').toUpperCase()}
            </h3>
            <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '28px' }}>
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
