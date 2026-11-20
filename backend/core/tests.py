import io
from PIL import Image
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from products.models import Product, ProductImage
from tryon.models import TryOnSession
from tryon.tasks import process_virtual_tryon, purge_expired_tryon_photos
from customers.models import CustomerProfile
from banners.models import PromotionalBanner

def create_test_image(color=(200, 157, 56), size=(200, 200)):
    file = io.BytesIO()
    img = Image.new('RGB', size, color)
    img.save(file, 'JPEG')
    file.name = 'test_sample.jpg'
    file.seek(0)
    return file

class AruviFullStackTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.product = Product.objects.create(
            name="Test Kanchipuram Saree",
            category="ethnic-wear",
            price=12999.00,
            fabric="Pure Mulberry Silk",
            occasion="Bridal",
        )
        self.product_image = ProductImage.objects.create(
            product=self.product,
            image_url="https://firebasestorage.googleapis.com/v0/b/test/o/img.webp",
            storage_path="products/1/img.webp",
            is_primary=True,
            display_order=0
        )

    def test_api_root(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['brand'], 'Aruvi Collections')
        self.assertIn('firebase_storage', data)

    def test_products_list(self):
        response = self.client.get('/api/products/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.json().get('results', response.json())
        self.assertGreaterEqual(len(results), 1)

    def test_product_detail_and_gallery(self):
        response = self.client.get(f'/api/products/{self.product.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['name'], 'Test Kanchipuram Saree')
        self.assertEqual(len(data['images']), 1)
        self.assertEqual(data['primary_image_url'], self.product_image.image_url)

    def test_customer_tryon_flow(self):
        test_img = create_test_image()
        response = self.client.post('/api/tryon/sessions/', {
            'user_id': 'test_patron_uid_123',
            'product_id': self.product.id,
            'garment_title': self.product.name,
            'photo': test_img
        }, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        session_data = response.json()
        self.assertIn('id', session_data)
        session_id = session_data['id']

        # Verify session can be queried
        status_resp = self.client.get(f'/api/tryon/sessions/{session_id}/status/')
        self.assertEqual(status_resp.status_code, status.HTTP_200_OK)
        status_data = status_resp.json()
        self.assertIn('status', status_data)

    def test_customer_profile_and_avatar(self):
        response = self.client.post('/api/customers/profiles/me/', {
            'user_id': 'test_patron_uid_123',
            'full_name': 'Priyamvada Sundaram',
            'email': 'priya@example.com',
            'preferred_fit': 'Bridal Tailored'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['full_name'], 'Priyamvada Sundaram')
        self.assertEqual(data['preferred_fit'], 'Bridal Tailored')

    def test_catvton_endpoints(self):
        import time
        test_img = create_test_image()
        response = self.client.post('/api/tryon/generate/', {
            'product_id': self.product.id,
            'category': 'overall',
            'photo': test_img
        }, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        job_data = response.json()
        self.assertIn('job_id', job_data)
        self.assertEqual(job_data['status'], 'queued')
        job_id = job_data['job_id']

        # Query status
        status_resp = self.client.get(f'/api/tryon/status/{job_id}/')
        self.assertEqual(status_resp.status_code, status.HTTP_200_OK)

        # Allow worker thread to finish processing
        for _ in range(25):
            st = self.client.get(f'/api/tryon/status/{job_id}/').json().get('status')
            if st in ('completed', 'failed'):
                break
            time.sleep(0.2)

        # Check result endpoint
        result_resp = self.client.get(f'/api/tryon/result/{job_id}/')
        self.assertIn(result_resp.status_code, [status.HTTP_200_OK, status.HTTP_202_ACCEPTED])
        if result_resp.status_code == status.HTTP_200_OK:
            self.assertEqual(result_resp['Content-Type'], 'image/webp')

    def test_retention_purge_task(self):
        res = purge_expired_tryon_photos()
        self.assertIn('purged_count', res)
