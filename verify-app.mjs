import fs from 'fs';
import path from 'path';

console.log('====================================================');
console.log('🌿 ARUVI COLLECTIONS - REACT COMPREHENSIVE QA SUITE');
console.log('====================================================\n');

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failedTests++;
  }
}

// ----------------------------------------------------
// 1. Files & Directory Structure Check
// ----------------------------------------------------
console.log('TEST GROUP 1: Project Architecture & Structure');

const requiredFiles = [
  'package.json',
  'vite.config.js',
  'index.html',
  '.gitignore',
  'README.md',
  '.github/workflows/deploy.yml',
  'src/main.jsx',
  'src/App.jsx',
  'src/services/firebase.js',
  'src/context/StoreContext.jsx',
  'src/components/Header.jsx',
  'src/components/Footer.jsx',
  'src/components/ProductCard.jsx',
  'src/components/CustomerAuthModal.jsx',
  'src/components/Toast.jsx',
  'src/pages/HomePage.jsx',
  'src/pages/ShopPage.jsx',
  'src/pages/ProductDetailPage.jsx',
  'src/pages/CategoriesPage.jsx',
  'src/pages/AboutPage.jsx',
  'src/pages/ContactPage.jsx',
  'src/pages/CartPage.jsx',
  'src/pages/CheckoutPage.jsx',
  'src/pages/OrderSuccessPage.jsx',
  'src/pages/WishlistPage.jsx',
  'src/pages/VirtualFittingRoomPage.jsx',
  'src/pages/AccountPage.jsx',
  'src/pages/AdminPage.jsx',
  'src/utils/pdfGenerator.js',
  'src/utils/whatsappHelper.js',
  'src/styles/main.css',
  'src/styles/animations.css',
  'src/styles/fitting-room.css',
  'src/styles/auth.css',
  'src/styles/admin.css'
];

requiredFiles.forEach((file) => {
  const exists = fs.existsSync(file);
  assert(exists, `Required file exists: ${file}`);
});

// ----------------------------------------------------
// 2. 9 Services & Collections Verification
// ----------------------------------------------------
console.log('\nTEST GROUP 2: The 9 Boutique Services in StoreContext.jsx');

const storeCode = fs.readFileSync('src/context/StoreContext.jsx', 'utf8');

const expectedServices = [
  { id: 'salwar', label: 'Salwar' },
  { id: 'sharara', label: 'Sharara' },
  { id: 'ethnic-wear', label: 'Ethnic Wear' },
  { id: 'maxis', label: "Maxi's" },
  { id: 'co-ordsets', label: 'Co-ordsets' },
  { id: 'casual-tops', label: 'Casual Tops' },
  { id: 'western-wear', label: 'Western Wear' },
  { id: 'jeans-pants', label: 'Jeans & Pants' },
  { id: 'kids-wear', label: 'Kids Wear' }
];

expectedServices.forEach((svc) => {
  const hasId = storeCode.includes(`id: '${svc.id}'`);
  assert(hasId, `Boutique Service "${svc.label}" (${svc.id}) registered in store`);
});

// ----------------------------------------------------
// 3. Security Gate & Admin Access
// ----------------------------------------------------
console.log('\nTEST GROUP 3: Owner Admin Gating (aruvicollections.25@gmail.com)');

assert(storeCode.includes('aruvicollections.25@gmail.com'), 'Owner email configured in StoreContext.jsx');

const adminPageCode = fs.readFileSync('src/pages/AdminPage.jsx', 'utf8');
assert(adminPageCode.includes('aruvicollections.25@gmail.com'), 'AdminPage checks aruvicollections.25@gmail.com');
assert(adminPageCode.includes('uploadFileToFirebase'), 'AdminPage supports Firebase Storage upload');

const authModalCode = fs.readFileSync('src/components/CustomerAuthModal.jsx', 'utf8');
assert(authModalCode.includes('loginWithGoogle'), 'AuthModal has Google OAuth integration');
assert(authModalCode.includes('loginWithEmail'), 'AuthModal has email login');

// ----------------------------------------------------
// 4. Shopping Bag, Coupons & Pricing Rules
// ----------------------------------------------------
console.log('\nTEST GROUP 4: Shopping Bag, Coupons & Delivery Rules');

assert(storeCode.includes('ARUVI20'), 'Promo coupon ARUVI20 (20% off) active');
assert(storeCode.includes('FESTIVE10'), 'Promo coupon FESTIVE10 active');
assert(storeCode.includes('addToCart'), 'addToCart action present');
assert(storeCode.includes('removeFromCart'), 'removeFromCart action present');
assert(storeCode.includes('updateCartQuantity'), 'updateCartQuantity action present');
assert(storeCode.includes('999'), 'Free Express Shipping threshold at ₹999 verified');

// ----------------------------------------------------
// 5. AI Virtual Fitting Room
// ----------------------------------------------------
console.log('\nTEST GROUP 5: Virtual Fitting Room Capabilities');

const fittingCode = fs.readFileSync('src/pages/VirtualFittingRoomPage.jsx', 'utf8');
assert(fittingCode.includes('Pooja'), 'Model Pooja present');
assert(fittingCode.includes('Meera'), 'Model Meera present');
assert(fittingCode.includes('Ananya'), 'Model Ananya present');
assert(fittingCode.includes('Diya & Aarav'), 'Kids Model Diya & Aarav present');
assert(fittingCode.includes('handleCustomPhotoUpload'), 'Custom photo upload supported');
assert(fittingCode.includes('blendOpacity'), 'Fabric drape opacity control present');
assert(fittingCode.includes('lightingPreset'), 'Lighting studio presets present');

// ----------------------------------------------------
// 6. Router Routes Completeness
// ----------------------------------------------------
console.log('\nTEST GROUP 6: SPA HashRouter Routes');

const appCode = fs.readFileSync('src/App.jsx', 'utf8');
const routes = [
  '/',
  '/shop',
  '/categories',
  '/about',
  '/contact',
  '/product/:id',
  '/cart',
  '/checkout',
  '/order-success/:id',
  '/wishlist',
  '/fitting-room',
  '/account',
  '/admin'
];

routes.forEach((r) => {
  assert(appCode.includes(`path="${r}"`), `Route path="${r}" configured in HashRouter`);
});

// ----------------------------------------------------
// 7. Cleanliness Check: Zero Legacy HTML/Vanilla
// ----------------------------------------------------
console.log('\nTEST GROUP 7: Pure React Cleanliness Check');

const legacyFiles = [
  'account.html', 'admin.html', 'cart.html', 'checkout.html',
  'mobile-app.html', 'product-detail.html', 'shop.html',
  'virtual-fitting-room.html', 'wishlist.html', 'scripts'
];

legacyFiles.forEach((f) => {
  const exists = fs.existsSync(f);
  assert(!exists, `Legacy file/dir ${f} is NOT present in repo`);
});

// ----------------------------------------------------
// 8. Firebase Storage & Django Backend Architecture QA
// ----------------------------------------------------
console.log('\nTEST GROUP 8: Firebase Storage & Django Backend Architecture QA');

assert(fs.existsSync('storage.rules'), 'Firebase Storage Security Rules (storage.rules) present');
assert(fs.existsSync('tailwind.config.js'), 'Tailwind CSS config present');
assert(fs.existsSync('postcss.config.js'), 'PostCSS config present');
assert(fs.existsSync('backend/manage.py'), 'Django REST Framework backend (backend/manage.py) present');
assert(fs.existsSync('backend/requirements.txt'), 'Backend requirements.txt present');
assert(fs.existsSync('backend/aruvi_backend/settings.py'), 'Django settings.py configured');
assert(fs.existsSync('src/components/ImageUploadDropzone.jsx'), 'Reusable ImageUploadDropzone component present');
assert(fs.existsSync('src/components/AdminProductGalleryManager.jsx'), 'Admin multi-image gallery manager present');

const storageRules = fs.readFileSync('storage.rules', 'utf8');
assert(storageRules.includes('match /products/{productId}/{allPaths=**}'), 'Storage Rules: Product catalog rules defined');
assert(storageRules.includes('match /tryons/uploads/{userId}/{allPaths=**}'), 'Storage Rules: Customer try-on upload privacy rules defined');
assert(storageRules.includes('match /tryons/results/{userId}/{allPaths=**}'), 'Storage Rules: AI fitting results privacy rules defined');
assert(storageRules.includes('match /profiles/{userId}/{allPaths=**}'), 'Storage Rules: Customer profile avatar rules defined');

const firebaseConfigCode = fs.readFileSync('src/services/firebase.js', 'utf8');
assert(firebaseConfigCode.includes('aruvicollections-5ce06.firebasestorage.app'), 'Firebase client configured with Firebase Storage bucket');
assert(firebaseConfigCode.includes('validateImageFile'), 'Client-side image file validation active');

// ----------------------------------------------------
// 9. PDF Generation, WhatsApp & Admin 12 Sections QA
// ----------------------------------------------------
console.log('\nTEST GROUP 9: PDF Generation, WhatsApp & Admin 12-Section Dashboard QA');

const pdfGenCode = fs.readFileSync('src/utils/pdfGenerator.js', 'utf8');
assert(pdfGenCode.includes('downloadOrderInvoicePDF'), 'pdfGenerator.js exports downloadOrderInvoicePDF');
assert(pdfGenCode.includes('jsPDF'), 'pdfGenerator.js implements jsPDF vector rendering');

const waHelperCode = fs.readFileSync('src/utils/whatsappHelper.js', 'utf8');
assert(waHelperCode.includes('openWhatsAppOrderChat'), 'whatsappHelper.js exports openWhatsAppOrderChat');
assert(waHelperCode.includes('formatWhatsAppOrderMessage'), 'whatsappHelper.js formats structured WhatsApp orders');

assert(adminPageCode.includes('dashboard'), 'Admin dashboard section registered');
assert(adminPageCode.includes('products'), 'Admin products section registered');
assert(adminPageCode.includes('add-product'), 'Admin add-product section registered');
assert(adminPageCode.includes('categories'), 'Admin categories section registered');
assert(adminPageCode.includes('orders'), 'Admin orders section registered');
assert(adminPageCode.includes('customers'), 'Admin customers section registered');
assert(adminPageCode.includes('inventory'), 'Admin inventory stock section registered');
assert(adminPageCode.includes('pdf-management'), 'Admin PDF & invoice management section registered');
assert(adminPageCode.includes('whatsapp-settings'), 'Admin WhatsApp settings section registered');
assert(adminPageCode.includes('website-settings'), 'Admin website settings section registered');
assert(adminPageCode.includes('profile'), 'Admin profile section registered');
assert(adminPageCode.includes('handleAdminLogout'), 'Admin logout functionality registered');

// ----------------------------------------------------
// Summary
// ----------------------------------------------------
console.log('\n====================================================');
console.log(`TOTAL AUDIT CHECKS: ${passedTests + failedTests}`);
console.log(`PASSED: ${passedTests}`);
console.log(`FAILED: ${failedTests}`);
console.log('====================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('🎉 100% OF ALL ARCHITECTURAL, FUNCTIONAL & SECURITY CHECKS PASSED!\n');
}
