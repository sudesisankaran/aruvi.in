import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api';

console.log('====================================================');
console.log('🛡️ CRITICAL BUG FIX - 8 MANDATORY TEST SUITE');
console.log('Aruvi Collections - Product Upload & Cross-Account Sync');
console.log('====================================================\n');

let passedCount = 0;
let failedCount = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ✕ FAIL: ${testName}`);
    failedCount++;
  }
}

async function runTests() {
  try {
    // -------------------------------------------------------------
    // TEST A: Admin logs in and uploads Product A
    // -------------------------------------------------------------
    console.log('TEST A: Admin Login & Product A Upload');
    const adminLoginRes = await axios.post(`${BASE_URL}/auth/login/`, {
      email: 'aruvicollections.25@gmail.com',
      password: 'admin123'
    });
    assert(adminLoginRes.status === 200, 'Admin authenticated (HTTP 200 OK)');
    assert(adminLoginRes.data.is_admin === true, 'Admin status verified');
    const adminToken = adminLoginRes.data.token;
    assert(Boolean(adminToken), 'Admin token issued');

    // Upload Product A to /api/admin/products/
    const uniqueSku = `ARUVI-SAL-${Date.now()}`;
    const productAPayload = {
      title: 'Royal Ruby Zari Embroidered Sharara',
      sku: uniqueSku,
      category: 'sharara',
      price: 8499.00,
      original_price: 10999.00,
      stock: 14,
      fabric: 'Pure Mulberry Silk',
      badge: 'FESTIVE EDIT',
      description: 'Heirloom ruby red sharara with gold thread hand embroidery and soft crepe inner lining.',
      status: 'active',
      is_featured: true,
      image: 'assets/images/bridal_sharara.jpg',
      images: [
        { image_url: 'assets/images/bridal_sharara.jpg', is_primary: true, display_order: 0 },
        { image_url: 'assets/images/kanjivaram_green.jpg', is_primary: false, display_order: 1 }
      ]
    };

    const uploadRes = await axios.post(`${BASE_URL}/admin/products/`, productAPayload, {
      headers: { Authorization: `Token ${adminToken}` }
    });

    assert(uploadRes.status === 201, 'Product A saved in database (HTTP 201 Created)');
    const prodAId = uploadRes.data.id;
    assert(Boolean(prodAId && typeof prodAId === 'number'), `Real central database ID assigned: #${prodAId}`);
    assert(uploadRes.data.title === productAPayload.title, 'Database product title matches exactly');
    assert(Number(uploadRes.data.price) === 8499, 'Database price matches ₹8,499');

    // -------------------------------------------------------------
    // TEST B: Admin refreshes the page
    // -------------------------------------------------------------
    console.log('\nTEST B: Admin Refreshes Page (Database Persistence)');
    const adminRefreshRes = await axios.get(`${BASE_URL}/admin/products/${prodAId}/`, {
      headers: { Authorization: `Token ${adminToken}` }
    });
    assert(adminRefreshRes.status === 200, 'Admin retrieves Product A from central database (HTTP 200 OK)');
    assert(adminRefreshRes.data.id === prodAId, 'Product A remains permanently visible in database');
    assert(adminRefreshRes.data.sku === uniqueSku, 'Product SKU persists accurately');

    // -------------------------------------------------------------
    // TEST C: Customer logs in using another email
    // -------------------------------------------------------------
    console.log('\nTEST C: Customer Logs in with Another Email (customer@gmail.com)');
    const customerLoginRes = await axios.post(`${BASE_URL}/auth/login/`, {
      email: 'customer@gmail.com',
      password: 'customerPassword123'
    });
    assert(customerLoginRes.status === 200, 'Customer authenticated (HTTP 200 OK)');
    assert(customerLoginRes.data.is_admin === false, 'Customer is strictly non-admin');
    const customerToken = customerLoginRes.data.token;

    // Customer fetches active products
    const customerProductsRes = await axios.get(`${BASE_URL}/products/`, {
      headers: { Authorization: `Token ${customerToken}` }
    });
    assert(customerProductsRes.status === 200, 'Customer fetches products API (HTTP 200 OK)');
    const customerList = Array.isArray(customerProductsRes.data) 
      ? customerProductsRes.data 
      : (customerProductsRes.data.results || []);
    const customerFound = customerList.find(p => p.id === prodAId);
    assert(Boolean(customerFound), 'Product A is visible to customer@gmail.com on Home Page');
    assert(Number(customerFound?.price) === 8499, 'Customer sees correct selling price (₹8,499)');

    // -------------------------------------------------------------
    // TEST D: Open website in Incognito mode (unauthenticated guest)
    // -------------------------------------------------------------
    console.log('\nTEST D: Open Website in Incognito Mode (No Login)');
    const incognitoRes = await axios.get(`${BASE_URL}/products/`);
    assert(incognitoRes.status === 200, 'Incognito guest fetches public products (HTTP 200 OK)');
    const incognitoList = Array.isArray(incognitoRes.data) 
      ? incognitoRes.data 
      : (incognitoRes.data.results || []);
    const incognitoFound = incognitoList.find(p => p.id === prodAId);
    assert(Boolean(incognitoFound), 'Product A is visible without admin login in Incognito mode');

    // -------------------------------------------------------------
    // TEST E: Open website on another device (Mobile browser session)
    // -------------------------------------------------------------
    console.log('\nTEST E: Open Website on Another Device (Mobile Device Session)');
    const mobileDeviceRes = await axios.get(`${BASE_URL}/products/${prodAId}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1'
      }
    });
    assert(mobileDeviceRes.status === 200, 'Mobile device accesses Product Details (HTTP 200 OK)');
    assert(mobileDeviceRes.data.id === prodAId, 'Product A is visible on mobile device');
    assert(mobileDeviceRes.data.images?.length === 2, 'Multiple image gallery accessible to other devices');

    // -------------------------------------------------------------
    // TEST F: Admin changes product price
    // -------------------------------------------------------------
    console.log('\nTEST F: Admin Changes Product Price');
    const updatedPrice = 7499.00;
    const priceChangeRes = await axios.patch(`${BASE_URL}/admin/products/${prodAId}/`, {
      price: updatedPrice,
      original_price: 10999.00
    }, {
      headers: { Authorization: `Token ${adminToken}` }
    });
    assert(priceChangeRes.status === 200, 'Admin price change accepted by database (HTTP 200 OK)');
    assert(Number(priceChangeRes.data.price) === updatedPrice, `Price updated to ₹${updatedPrice}`);

    // Verify for public customer
    const publicPriceCheck = await axios.get(`${BASE_URL}/products/${prodAId}/`);
    assert(Number(publicPriceCheck.data.price) === updatedPrice, 'Updated price (₹7,499) appears for all customers');

    // -------------------------------------------------------------
    // TEST G: Admin deletes product
    // -------------------------------------------------------------
    console.log('\nTEST G: Admin Deletes Product');
    const deleteRes = await axios.delete(`${BASE_URL}/admin/products/${prodAId}/`, {
      headers: { Authorization: `Token ${adminToken}` }
    });
    assert(deleteRes.status === 204, 'Admin deleted Product A (HTTP 204 No Content)');

    // Verify disappearance from public website
    const postDeletePublicRes = await axios.get(`${BASE_URL}/products/`);
    const postDeleteList = Array.isArray(postDeletePublicRes.data)
      ? postDeletePublicRes.data
      : (postDeletePublicRes.data.results || []);
    const postDeleteFound = postDeleteList.find(p => p.id === prodAId);
    assert(!postDeleteFound, 'Product disappears for all customers from public website');

    // -------------------------------------------------------------
    // TEST H: Simulate database failure / rejection (No false success)
    // -------------------------------------------------------------
    console.log('\nTEST H: Simulate Database Failure (No False Success Notification)');
    
    // Case 1: Unauthorized customer tries to upload a product
    let customerBlocked = false;
    try {
      await axios.post(`${BASE_URL}/admin/products/`, {
        title: 'Unauthorized Fake Product',
        price: 999
      }, {
        headers: { Authorization: `Token ${customerToken}` }
      });
    } catch (err) {
      if (err.response?.status === 403) {
        customerBlocked = true;
      }
    }
    assert(customerBlocked, 'Unauthorized user is strictly blocked by backend (HTTP 403 Forbidden)');

    // Case 2: Admin submits invalid product (missing required price and title)
    let invalidPayloadRejected = false;
    let actualErrorMessage = '';
    try {
      await axios.post(`${BASE_URL}/admin/products/`, {
        title: '',
        price: -500
      }, {
        headers: { Authorization: `Token ${adminToken}` }
      });
    } catch (err) {
      if (err.response?.status === 400) {
        invalidPayloadRejected = true;
        actualErrorMessage = JSON.stringify(err.response.data);
      }
    }
    assert(invalidPayloadRejected, 'Invalid product is rejected by database with HTTP 400 (not false success)');
    assert(Boolean(actualErrorMessage), `Actual database error returned: ${actualErrorMessage}`);

    console.log('\n====================================================');
    console.log(`TOTAL AUDIT CHECKS: ${passedCount + failedCount}`);
    console.log(`PASSED: ${passedCount}`);
    console.log(`FAILED: ${failedCount}`);
    console.log('====================================================');

    if (failedCount === 0) {
      console.log('🎉 100% OF ALL 8 MANDATORY TESTS PASSED SUCCESSFULLY!');
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal test error:', error.response?.data || error.message);
    process.exit(1);
  }
}

runTests();
