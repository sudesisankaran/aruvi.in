import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';

export default function WishlistPage() {
  const { wishlist, products, addToCart, toggleWishlist, addToast } = useStore();

  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  const handleMoveAllToBag = () => {
    if (wishlistedProducts.length === 0) return;
    wishlistedProducts.forEach(p => {
      addToCart(p, 1, p.sizes?.[0] || 'M');
    });
    addToast(`Moved ${wishlistedProducts.length} items to shopping bag!`, 'success');
  };

  if (wishlistedProducts.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🤍</div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#0e2920', marginBottom: '12px' }}>
          Your Saved Wishlist Is Empty
        </h2>
        <p style={{ color: '#667770', maxWidth: '440px', margin: '0 auto 28px', fontSize: '0.95rem' }}>
          Tap the heart icon on any outfit while browsing our collections to save your favorite drapes for later.
        </p>
        <Link to="/shop" className="btn btn-primary hover-shimmer" style={{ padding: '12px 32px' }}>
          Explore Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="wishlist-page-view" style={{ padding: '40px 0 80px' }}>
      <div className="container">

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: '#0e2920', margin: 0 }}>
              My Wishlist ({wishlistedProducts.length})
            </h1>
            <p style={{ color: '#667770', fontSize: '0.92rem', marginTop: '4px' }}>
              Your curated shortlist of handcrafted sarees, salwars, and ethnic sets.
            </p>
          </div>

          <button 
            type="button" 
            onClick={handleMoveAllToBag}
            className="btn btn-primary hover-shimmer"
            style={{ padding: '12px 24px' }}
          >
            Move All to Shopping Bag 🛍️
          </button>
        </div>

        <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '28px' }}>
          {wishlistedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </div>
    </div>
  );
}
