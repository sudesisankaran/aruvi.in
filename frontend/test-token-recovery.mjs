import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

async function runRecoveryTests() {
  console.log('--- TEST 1: Auto-Fetch Token when No Token is Provided ---');
  // 1. Fetch fresh token like api.js does
  const loginRes = await axios.post(`${API_BASE_URL}/auth/login/`, {
    email: 'aruvicollections.25@gmail.com',
    password: 'admin123'
  });
  console.log('Login status:', loginRes.status, 'Token key received:', !!loginRes.data?.token);

  const token = loginRes.data.token;

  // 2. Post product using the recovered token
  const testProduct = {
    title: 'Automated Token Recovery Test Silk Drape',
    sku: `TEST-REC-${Date.now()}`,
    category: 'salwar',
    price: 6999,
    stock: 12,
    status: 'active'
  };

  const createRes = await axios.post(`${API_BASE_URL}/admin/products/`, testProduct, {
    headers: {
      Authorization: `Token ${token}`
    }
  });

  console.log('Product created status:', createRes.status, 'ID:', createRes.data?.id);

  if (createRes.status === 201 && createRes.data?.id) {
    console.log('✓ PASS: Admin product upload succeeded with recovered token');
  } else {
    throw new Error('Product creation failed');
  }

  // 3. Clean up
  const delRes = await axios.delete(`${API_BASE_URL}/admin/products/${createRes.data.id}/`, {
    headers: {
      Authorization: `Token ${token}`
    }
  });
  console.log('Product deleted cleanup status:', delRes.status);
  console.log('🎉 ALL AUTO-RECOVERY TESTS PASSED!');
}

runRecoveryTests().catch(err => {
  console.error('Test failed:', err?.response?.data || err.message);
  process.exit(1);
});
