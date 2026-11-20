import axios from './frontend/node_modules/axios/index.js';

const BASE_URL = 'http://localhost:8000/api';

async function runLiveSyncTests() {
  console.log('====================================================');
  console.log('✨ TASK 22: ADMIN PRODUCT UPLOAD → HOMEPAGE LIVE DISPLAY');
  console.log('Central Database Real-Time Synchronization Verification');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✕ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Admin Login
  console.log('STEP 1: Admin Authentication (aruvicollections.25@gmail.com)');
  const adminLogin = await axios.post(`${BASE_URL}/auth/login/`, {
    email: 'aruvicollections.25@gmail.com',
    password: 'admin123'
  });

  assert(adminLogin.status === 200, 'Admin login HTTP 200 OK');
  assert(adminLogin.data.is_admin === true, 'Admin status verified as true');
  const token = adminLogin.data.token;

  // 2. Admin uploads Product A
  console.log('\nSTEP 2: Admin Uploads Product A to Central Database');
  const uniqueSku = `TEST-SALWAR-${Date.now()}`;
  const prodAPayload = {
    title: 'Emerald Gold Handcrafted Anarkali Salwar',
    sku: uniqueSku,
    category: 'salwar',
    price: 6499.00,
    original_price: 8999.00,
    stock: 12,
    fabric: 'Pure Chanderi Silk',
    badge: 'EXCLUSIVE NEW',
    description: 'Magnificent bridal anarkali woven with rich zari embroidery and emerald lining.',
    status: 'active',
    is_featured: true,
    image: 'assets/images/anarkali_suit.jpg',
    images: [
      { image_url: 'assets/images/anarkali_suit.jpg', is_primary: true, display_order: 0 },
      { image_url: 'assets/images/kanjivaram_green.jpg', is_primary: false, display_order: 1 }
    ]
  };

  const uploadRes = await axios.post(`${BASE_URL}/products/`, prodAPayload, {
    headers: { Authorization: `Token ${token}` }
  });

  assert(uploadRes.status === 201, 'Product A created via Admin (HTTP 201 Created)');
  const prodAId = uploadRes.data.id;
  assert(Boolean(prodAId), `Product A saved permanently in Central DB with ID: ${prodAId}`);

  // 3. Public Homepage / Unauthenticated Customer fetches products
  console.log('\nSTEP 3: Public Website Displays Product A Without Login');
  const publicFetch1 = await axios.get(`${BASE_URL}/products/`);

  assert(publicFetch1.status === 200, 'Public products API HTTP 200 OK');
  const publicList = Array.isArray(publicFetch1.data) ? publicFetch1.data : (publicFetch1.data.results || []);
  const foundProdA = publicList.find(p => p.id === prodAId);
  assert(Boolean(foundProdA), 'Product A appears immediately on Public Website without login');
  assert(foundProdA?.title === prodAPayload.title, 'Product A title matches');
  assert(Number(foundProdA?.price) === 6499, 'Product A selling price is ₹6,499');
  assert(Number(foundProdA?.original_price) === 8999, 'Product A original MRP is ₹8,999');
  assert(foundProdA?.stock === 12, 'Product A stock availability is 12 units');

  // 4. Multi-device check (second independent visitor session)
  console.log('\nSTEP 4: Cross-Device Visitor / Mobile Session Verification');
  const visitor2Fetch = await axios.get(`${BASE_URL}/products/${prodAId}/`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)' }
  });
  assert(visitor2Fetch.status === 200, 'Mobile visitor accesses Product A Details directly (HTTP 200)');
  assert(visitor2Fetch.data.id === prodAId, 'Correct Product Details opened, no data crossover');
  assert(visitor2Fetch.data.images?.length === 2, 'Multiple images returned for multi-image gallery');

  // 5. Admin updates Product A Price
  console.log('\nSTEP 5: Admin Updates Product A Price');
  const updatePriceRes = await axios.patch(`${BASE_URL}/products/${prodAId}/`, {
    price: 5999.00,
    original_price: 8999.00
  }, {
    headers: { Authorization: `Token ${token}` }
  });

  assert(updatePriceRes.status === 200, 'Admin updated Product A price (HTTP 200)');
  assert(Number(updatePriceRes.data.price) === 5999, 'Updated price confirmed in database');

  // 6. Verify updated price on public website
  console.log('\nSTEP 6: Public Website Reflects Updated Price for All Visitors');
  const publicFetch2 = await axios.get(`${BASE_URL}/products/${prodAId}/`);
  assert(Number(publicFetch2.data.price) === 5999, 'Updated price (₹5,999) displays to all visitors');

  // 7. Admin updates Product A Image
  console.log('\nSTEP 7: Admin Updates Product A Image');
  const updateImageRes = await axios.patch(`${BASE_URL}/products/${prodAId}/`, {
    image: 'assets/images/bridal_sharara.jpg'
  }, {
    headers: { Authorization: `Token ${token}` }
  });

  assert(updateImageRes.status === 200, 'Admin updated Product A image (HTTP 200)');
  assert(updateImageRes.data.image === 'assets/images/bridal_sharara.jpg', 'Updated image path confirmed in database');

  // 8. Inactive status test: ensure inactive products do NOT show publicly
  console.log('\nSTEP 8: Inactive Product Status Filtering');
  await axios.patch(`${BASE_URL}/products/${prodAId}/`, {
    status: 'inactive'
  }, {
    headers: { Authorization: `Token ${token}` }
  });

  const publicFetchInactive = await axios.get(`${BASE_URL}/products/`);
  const publicListInactive = Array.isArray(publicFetchInactive.data) ? publicFetchInactive.data : (publicFetchInactive.data.results || []);
  const hiddenProd = publicListInactive.find(p => p.id === prodAId);
  assert(!hiddenProd, 'Inactive product is NOT returned on public website for customers');

  // Reactivate for delete test
  await axios.patch(`${BASE_URL}/products/${prodAId}/`, {
    status: 'active'
  }, {
    headers: { Authorization: `Token ${token}` }
  });

  // 9. Admin deletes Product A
  console.log('\nSTEP 9: Admin Deletes Product A');
  const deleteRes = await axios.delete(`${BASE_URL}/products/${prodAId}/`, {
    headers: { Authorization: `Token ${token}` }
  });
  assert(deleteRes.status === 204, 'Admin deleted Product A (HTTP 204 No Content)');

  // 10. Verify Product A disappeared from public website
  console.log('\nSTEP 10: Product A Disappears From Public Website');
  const publicFetch3 = await axios.get(`${BASE_URL}/products/`);
  const publicListAfterDelete = Array.isArray(publicFetch3.data) ? publicFetch3.data : (publicFetch3.data.results || []);
  const deletedProd = publicListAfterDelete.find(p => p.id === prodAId);
  assert(!deletedProd, 'Deleted product completely disappeared from public website for all visitors');

  console.log('\n====================================================');
  console.log(`TOTAL SCENARIO CHECKS: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log('====================================================');
  if (failed === 0) {
    console.log('🎉 100% OF ALL 10 FINAL VERIFICATION STEPS PASSED!');
  } else {
    process.exit(1);
  }
}

runLiveSyncTests().catch((err) => {
  console.error('Test error:', err.response?.data || err.message);
  process.exit(1);
});
