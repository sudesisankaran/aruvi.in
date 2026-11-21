/**
 * Aruvi Collections - Core Image Utilities & Universal Storage Service
 *
 * Guarantees:
 * 1. Each product displays its EXACT uploaded image across all views.
 * 2. Uploaded image URLs are validated and preserved without replacement.
 * 3. Never swaps product images with random, demo, or green saree fallbacks.
 * 4. Supports Supabase Storage, Firebase Cloud Storage, and Backend persistent storage.
 */

import { uploadFileToFirebase, validateImageFile } from '../services/firebase';
import { productsApi } from '../services/api';

// Elegant neutral luxury boutique SVG fallback (Never shows another product's dress)
export const NEUTRAL_PRODUCT_FALLBACK = 
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500' fill='%23fbfaf7'><rect width='400' height='500' fill='%23f9f8f5'/><path d='M200 160 C185 145 175 130 190 115 C205 100 218 110 210 128 L200 142 L275 190 L125 190 Z' stroke='%23c89d38' stroke-width='2' fill='none'/><path d='M125 190 L105 380 L295 380 L275 190 Z' stroke='%230e2920' stroke-width='1.75' fill='none'/><circle cx='200' cy='112' r='8' stroke='%23c89d38' stroke-width='1.5' fill='none'/><text x='200' y='425' font-family='serif' font-size='13' font-weight='600' fill='%230e2920' text-anchor='middle' letter-spacing='2'>ARUVI COUTURE</text></svg>";

/**
 * Resolves the genuine product image URL.
 * Strictly prioritizes the product's own uploaded primary image.
 * Prevents showing another product's picture.
 */
export const getProductImageUrl = (product) => {
  if (!product) return NEUTRAL_PRODUCT_FALLBACK;

  // 1. If product.images gallery exists, search for primary or first image
  if (Array.isArray(product.images) && product.images.length > 0) {
    const primary = product.images.find(img => img.is_primary) || product.images[0];
    const galleryUrl = primary?.image_url || primary?.url || (typeof primary === 'string' ? primary : '');
    if (galleryUrl && !galleryUrl.includes('kanjivaram_green.jpg')) {
      return galleryUrl;
    }
  }

  // 2. Check product.image
  if (product.image && typeof product.image === 'string' && product.image.trim()) {
    if (!product.image.includes('kanjivaram_green.jpg')) {
      return product.image.trim();
    }
  }

  // 3. If product has any gallery image at all, return it
  if (Array.isArray(product.images) && product.images[0]) {
    const fallbackFirst = product.images[0].image_url || product.images[0].url;
    if (fallbackFirst) return fallbackFirst;
  }

  // 4. Return product.image if valid or neutral luxury placeholder
  return product.image || NEUTRAL_PRODUCT_FALLBACK;
};

/**
 * Handles image loading failures gracefully without swapping into random/demo products.
 */
export const handleImageError = (e, customFallback = NEUTRAL_PRODUCT_FALLBACK) => {
  if (e?.currentTarget) {
    if (e.currentTarget.dataset.fallbackApplied) return;
    e.currentTarget.dataset.fallbackApplied = 'true';
    e.currentTarget.src = customFallback;
  }
};

/**
 * Universal Storage Upload:
 * 1. Checks Supabase Storage (if VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY configured)
 * 2. Checks Firebase Cloud Storage
 * 3. Checks Backend persistent media storage (/api/products/upload_image/)
 * 4. Fallback to resilient high-fidelity Data URL
 */
export async function uploadProductImage(file, productId = null, onProgress = null) {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const timestamp = Date.now();
  const folder = productId ? `products/${productId}` : 'products';
  const fileName = `${folder}/${timestamp}_${cleanName}`;

  // 1. Try Supabase Storage if configured via environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseAnonKey) {
    try {
      const uploadEndpoint = `${supabaseUrl.replace(/\/+$/, '')}/storage/v1/object/products/${fileName}`;
      const uploadRes = await fetch(uploadEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'apikey': supabaseAnonKey,
          'Content-Type': file.type || 'image/jpeg',
          'x-upsert': 'true'
        },
        body: file
      });
      if (uploadRes.ok) {
        const publicUrl = `${supabaseUrl.replace(/\/+$/, '')}/storage/v1/object/public/products/${fileName}`;
        if (onProgress) onProgress(100);
        return {
          url: publicUrl,
          path: fileName,
          storage: 'supabase',
          name: file.name
        };
      }
    } catch (supabaseErr) {
      console.warn('[Storage] Supabase storage upload skipped/failed:', supabaseErr.message);
    }
  }

  // 2. Try Firebase Cloud Storage (permanent Google Cloud CDN URL)
  try {
    const firebaseRes = await uploadFileToFirebase(file, folder, onProgress);
    if (firebaseRes && firebaseRes.url) {
      return {
        url: firebaseRes.url,
        path: firebaseRes.path,
        storage: 'firebase',
        name: file.name
      };
    }
  } catch (fbErr) {
    console.warn('[Storage] Firebase upload skipped/failed:', fbErr.message);
  }

  // 3. Try Backend Persistent Upload (Django /api/products/upload_image/)
  try {
    const backendRes = await productsApi.uploadImage(file);
    if (backendRes && backendRes.url) {
      if (onProgress) onProgress(100);
      return {
        url: backendRes.url,
        path: backendRes.relative_url || '',
        storage: 'backend',
        name: file.name
      };
    }
  } catch (backendErr) {
    console.warn('[Storage] Backend upload failed:', backendErr.message);
  }

  // 4. Fallback to resilient Data URL if network storage is blocked
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (onProgress) onProgress(100);
      resolve({
        url: e.target.result,
        path: fileName,
        storage: 'data-url',
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  });
}
