import io
from PIL import Image
from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status


def make_test_image(size=(300, 400), color=(180, 100, 100)):
    buf = io.BytesIO()
    img = Image.new('RGB', size, color=color)
    img.save(buf, format='JPEG')
    return SimpleUploadedFile('test_photo.jpg', buf.getvalue(), content_type='image/jpeg')


class VirtualTryOnTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_missing_person_image(self):
        resp = self.client.post('/api/try-on/', {
            'garment_image_url': 'assets/images/kanjivaram_green.jpg'
        }, format='multipart')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(resp.json().get('success'))

    def test_oversized_image(self):
        # 5MB + 1 byte
        huge_bytes = b'0' * (5 * 1024 * 1024 + 10)
        oversized_file = SimpleUploadedFile('huge.jpg', huge_bytes, content_type='image/jpeg')
        resp = self.client.post('/api/try-on/', {
            'person_image': oversized_file,
            'garment_image_url': 'assets/images/kanjivaram_green.jpg'
        }, format='multipart')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(resp.json().get('success'))
        self.assertIn('5MB', resp.json().get('error', ''))

    def test_successful_tryon(self):
        person_file = make_test_image()
        resp = self.client.post('/api/try-on/', {
            'person_image': person_file,
            'garment_image_url': 'assets/images/kanjivaram_green.jpg',
            'category': 'dresses'
        }, format='multipart')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        data = resp.json()
        self.assertTrue(data.get('success'))
        self.assertTrue(data.get('result_image', '').startswith('data:image/'))
