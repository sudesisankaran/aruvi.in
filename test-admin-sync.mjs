import axios from './frontend/node_modules/axios/index.js';

const BASE_URL = 'http://localhost:8000/api';

console.log('====================================================');
console.log('🛡️ ARUVI COLLECTIONS - MASTER ACCEPTANCE TEST SUITE');
console.log('Admin Restriction & Global Product Synchronization');
console.log('====================================================\n');

let passedCount = 0;
let failedCount = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failedCount++;
  }
}

async function runAcceptanceTests() {
  try {
    // -----------------------------------------------------------------
    // TEST 1: Login: aruvicollections.25@gmail.com -> Admin Dashboard
    // -----------------------------------------------------------------
    console.log('TEST 1: Admin Login (aruvicollections.25@gmail.com)');
    const adminRes = await axios.post(`${BASE_URL}/auth/login/`, {
      email: 'aruvicollections.25@gmail.com',
      password: 'admin123'
    });
    assert(adminRes.status === 200, 'Admin login HTTP 200 OK');
    assert(adminRes.data.is_admin === true, 'Admin status is TRUE');
    assert(adminRes.data.redirect_to === '/admin/dashboard', 'Redirects directly to /admin/dashboard');
    assert(Boolean(adminRes.data.token), 'Admin authentication token issued');
    const adminToken = adminRes.data.token;

    // Verify admin token with verify-admin endpoint
    const verifyRes = await axios.get(`${BASE_URL}/auth/verify-admin/`, {
      headers: { Authorization: `Token ${adminToken}` }
    });
    assert(verifyRes.data.is_authorized === true, 'Backend verifies admin authorization for aruvicollections.25@gmail.com');

    // -----------------------------------------------------------------
    // TEST 2: Login: customer@gmail.com -> Customer Home Page
    // -----------------------------------------------------------------
    console.log('\nTEST 2: Customer Login (customer@gmail.com)');
    const customer1Res = await axios.post(`${BASE_URL}/auth/login/`, {
      email: 'customer@gmail.com',
      password: 'customerPassword123'
    });
    assert(customer1Res.status === 200, 'Customer 1 login HTTP 200 OK');
    assert(customer1Res.data.is_admin === false, 'Customer 1 admin status is strictly FALSE');
    assert(customer1Res.data.redirect_to === '/', 'Customer 1 redirects to Customer Home page (/)');
    const customer1Token = customer1Res.data.token;

    // -----------------------------------------------------------------
    // TEST 3: Login: another@gmail.com -> Customer Home Page
    // -----------------------------------------------------------------
    console.log('\nTEST 3: Customer Login (another@gmail.com)');
    const customer2Res = await axios.post(`${BASE_URL}/auth/login/`, {
      email: 'another@gmail.com',
      password: 'anotherPassword123'
    });
    assert(customer2Res.status === 200, 'Customer 2 login HTTP 200 OK');
    assert(customer2Res.data.is_admin === false, 'Customer 2 admin status is strictly FALSE');
    assert(customer2Res.data.redirect_to === '/', 'Customer 2 redirects to Customer Home page (/)');
    const customer2Token = customer2Res.data.token;

    // -----------------------------------------------------------------
    // TEST 4: Admin uploads a new product -> Appears on public website
    // -----------------------------------------------------------------
    console.log('\nTEST 4: Admin uploads a new product');
    const newProductPayload = {
      title: 'Royal Kanjivaram Pure Zari Drape',
      sku: 'ARUVI-KAN-909',
      category: 'salwar',
      price: 12999,
      original_price: 15999,
      stock: 12,
      fabric: 'Pure Mulberry Silk',
      badge: 'Royal Heirloom',
      description: 'Handcrafted master weave with gold bullion zari border.',
      status: 'active',
      is_featured: true,
      image: 'assets/images/kanjivaram_green.jpg'
    };

    const createRes = await axios.post(`${BASE_URL}/products/`, newProductPayload, {
      headers: { Authorization: `Token ${adminToken}` }
    });
    assert(createRes.status === 201, 'Product created by admin (HTTP 201 Created)');
    const createdProductId = createRes.data.id;
    assert(Boolean(createdProductId), `Product saved with Central Database ID: ${createdProductId}`);

    // Public visitor (no auth header) checks products
    const publicVisitorRes = await axios.get(`${BASE_URL}/products/`);
    const publicProducts = publicVisitorRes.data.results || publicVisitorRes.data;
    const foundInPublic = publicProducts.some(p => p.id === createdProductId || p.sku === 'ARUVI-KAN-909');
    assert(foundInPublic, 'Product appears immediately on public website without login');

    // -----------------------------------------------------------------
    // TEST 5: Open website on another browser / device (Customer A & B check)
    // -----------------------------------------------------------------
    console.log('\nTEST 5: Cross-device / multi-user global synchronization');
    // Customer 1 fetches catalog
    const cust1Catalog = await axios.get(`${BASE_URL}/products/`, {
      headers: { Authorization: `Token ${customer1Token}` }
    });
    const cust1Prods = cust1Catalog.data.results || cust1Catalog.data;
    assert(cust1Prods.some(p => p.id === createdProductId), 'Customer 1 (customer@gmail.com) sees the exact same uploaded product');

    // Customer 2 fetches catalog
    const cust2Catalog = await axios.get(`${BASE_URL}/products/`, {
      headers: { Authorization: `Token ${customer2Token}` }
    });
    const cust2Prods = cust2Catalog.data.results || cust2Catalog.data;
    assert(cust2Prods.some(p => p.id === createdProductId), 'Customer 2 (another@gmail.com) sees the exact same uploaded product');

    // Guest visitor fetches catalog
    const guestCatalog = await axios.get(`${BASE_URL}/products/`);
    const guestProds = guestCatalog.data.results || guestCatalog.data;
    assert(guestProds.some(p => p.id === createdProductId), 'Guest visitor (not logged in) sees the exact same uploaded product');

    // -----------------------------------------------------------------
    // TEST 6: Admin edits a product -> Updated product appears for every visitor
    // -----------------------------------------------------------------
    console.log('\nTEST 6: Admin edits product');
    const updateRes = await axios.patch(`${BASE_URL}/products/${createdProductId}/`, {
      price: 14999,
      badge: '👑 Limited Royal Edition'
    }, {
      headers: { Authorization: `Token ${adminToken}` }
    });
    assert(updateRes.status === 200, 'Product updated by admin (HTTP 200 OK)');
    assert(Number(updateRes.data.price) === 14999, 'Updated price is ₹14,999');

    // Verify update reflects for public visitor
    const publicAfterUpdate = await axios.get(`${BASE_URL}/products/`);
    const publicUpdatedProds = publicAfterUpdate.data.results || publicAfterUpdate.data;
    const updatedProd = publicUpdatedProds.find(p => p.id === createdProductId);
    assert(updatedProd && Number(updatedProd.price) === 14999, 'Updated price reflects for every public visitor');
    assert(updatedProd && updatedProd.badge === '👑 Limited Royal Edition', 'Updated badge reflects for every visitor');

    // -----------------------------------------------------------------
    // TEST 7: Admin deletes a product -> Deleted product disappears for every visitor
    // -----------------------------------------------------------------
    console.log('\nTEST 7: Admin deletes product');
    const deleteRes = await axios.delete(`${BASE_URL}/products/${createdProductId}/`, {
      headers: { Authorization: `Token ${adminToken}` }
    });
    assert(deleteRes.status === 204, 'Product deleted by admin (HTTP 204 No Content)');

    // Verify deleted product is gone for all visitors
    const publicAfterDelete = await axios.get(`${BASE_URL}/products/`);
    const prodsAfterDelete = publicAfterDelete.data.results || publicAfterDelete.data;
    const stillPresent = prodsAfterDelete.some(p => p.id === createdProductId);
    assert(!stillPresent, 'Deleted product disappears immediately for every visitor');

    // -----------------------------------------------------------------
    // TEST 8: Unauthorized customer attempts admin access
    // -----------------------------------------------------------------
    console.log('\nTEST 8: Unauthorized customer attempts admin access');
    // Try to access verify-admin with customer token
    let customerVerifyBlocked = false;
    try {
      await axios.get(`${BASE_URL}/auth/verify-admin/`, {
        headers: { Authorization: `Token ${customer1Token}` }
      });
    } catch (err) {
      if (err.response?.status === 403) {
        customerVerifyBlocked = true;
      }
    }
    assert(customerVerifyBlocked, 'Customer 1 blocked from /api/auth/verify-admin/ (HTTP 403 Forbidden)');

    // Try to create product with customer token
    let customerCreateBlocked = false;
    try {
      await axios.post(`${BASE_URL}/products/`, {
        title: 'Hacked Product',
        sku: 'HACK-001',
        price: 100
      }, {
        headers: { Authorization: `Token ${customer1Token}` }
      });
    } catch (err) {
      if (err.response?.status === 403) {
        customerCreateBlocked = true;
      }
    }
    assert(customerCreateBlocked, 'Customer 1 blocked from creating products (HTTP 403 Forbidden)');

    // -----------------------------------------------------------------
    // TEST 9: Admin logs out -> Admin dashboard access revoked
    // -----------------------------------------------------------------
    console.log('\nTEST 9: Admin logout');
    const logoutRes = await axios.post(`${BASE_URL}/auth/logout/`, {}, {
      headers: { Authorization: `Token ${adminToken}` }
    });
    assert(logoutRes.status === 200, 'Admin logged out (HTTP 200 OK)');

    // Verify old admin token is no longer authorized
    let oldTokenRevoked = false;
    try {
      await axios.get(`${BASE_URL}/auth/verify-admin/`, {
        headers: { Authorization: `Token ${adminToken}` }
      });
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        oldTokenRevoked = true;
      }
    }
    assert(oldTokenRevoked, 'Admin token revoked: subsequent admin API calls rejected');

    // -----------------------------------------------------------------
    // SUMMARY
    // -----------------------------------------------------------------
    console.log('\n====================================================');
    console.log(`TOTAL SCENARIO CHECKS: ${passedCount + failedCount}`);
    console.log(`PASSED: ${passedCount}`);
    console.log(`FAILED: ${failedCount}`);
    console.log('====================================================');

    if (failedCount > 0) {
      process.exit(1);
    } else {
      console.log('🎉 100% OF ALL 9 ACCEPTANCE CRITERIA SCENARIOS PASSED!\n');
    }
  } catch (err) {
    console.error('Fatal test error:', err.response?.data || err.message);
    process.exit(1);
  }
}

runAcceptanceTests();
