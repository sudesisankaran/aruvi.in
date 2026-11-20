from django.core.management.base import BaseCommand
from products.models import Product, ProductImage
from banners.models import PromotionalBanner

INITIAL_PRODUCTS = [
    {
        'name': 'Royal Emerald Kanjivaram Bridal Silk',
        'category': 'ethnic-wear',
        'price': 14999.00,
        'original_price': 18500.00,
        'fabric': 'Pure Kanchipuram Mulberry Silk',
        'occasion': 'Bridal & Grand Reception',
        'badge': 'BESTSELLER',
        'is_featured': True,
        'rating': 4.9,
        'review_count': 32,
        'description': 'Handcrafted pure Kanchipuram silk saree woven with real gold zari motifs. Features a majestic pallu and hand-embroidered contrast blouse.',
        'image': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1080&q=80',
    },
    {
        'name': 'Noor Crimson Embroidered Anarkali Salwar',
        'category': 'salwar',
        'price': 6499.00,
        'original_price': 8999.00,
        'fabric': 'Chanderi Silk with Organza Dupatta',
        'occasion': 'Festive & Sangeet',
        'badge': 'NEW DROP',
        'is_featured': True,
        'rating': 4.8,
        'review_count': 19,
        'description': 'Floor-sweeping Crimson Anarkali suit with hand-done gota patti and zardozi embroidery along the neckline and hem.',
        'image': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1080&q=80',
    },
    {
        'name': 'Gulabi Zari Peplum Sharara Ensemble',
        'category': 'sharara',
        'price': 8299.00,
        'original_price': 10500.00,
        'fabric': 'Georgette with Mukaish Work',
        'occasion': 'Mehendi & Festive Soirée',
        'badge': 'TRENDING',
        'is_featured': True,
        'rating': 4.9,
        'review_count': 27,
        'description': 'A vibrant rose-tinted peplum kurti paired with voluminous tiered flared sharara pants and scallop bordered dupatta.',
        'image': 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1080&q=80',
    },
    {
        'name': 'Vintage Garden Floral Tiered Maxi Dress',
        'category': 'maxis',
        'price': 4199.00,
        'original_price': 5499.00,
        'fabric': 'Pure Breathable Rayon Slub',
        'occasion': 'Resort Wear & Casual Brunches',
        'badge': 'ORGANIC',
        'is_featured': True,
        'rating': 4.7,
        'review_count': 14,
        'description': 'Flowing tiered silhouette with balloon sleeves, ruffled sweetheart collar, and botanical block prints.',
        'image': 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1080&q=80',
    },
    {
        'name': 'Azure Linen Tailored Co-ord Set',
        'category': 'co-ordsets',
        'price': 3899.00,
        'original_price': 4999.00,
        'fabric': '100% French Flax Linen',
        'occasion': 'Power Dressing & Smart Casuals',
        'badge': 'PREMIUM',
        'is_featured': True,
        'rating': 4.8,
        'review_count': 22,
        'description': 'Contemporary notch lapel cropped blazer paired with high-waisted wide-leg trousers in serene oceanic sky blue.',
        'image': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1080&q=80',
    },
    {
        'name': 'Schiffli Lace Embroidered Peplum Top',
        'category': 'casual-tops',
        'price': 2199.00,
        'original_price': 2999.00,
        'fabric': 'Pure Cotton Eyelet Schiffli',
        'occasion': 'Daily Chic & Day Outing',
        'badge': 'HOT',
        'is_featured': False,
        'rating': 4.6,
        'review_count': 11,
        'description': 'Delicate ivory eyelet embroidery featuring subtle flutter sleeves and mother-of-pearl buttons.',
        'image': 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&w=1080&q=80',
    },
    {
        'name': 'Champagne Satin Wrap Evening Gown',
        'category': 'western-wear',
        'price': 5999.00,
        'original_price': 7999.00,
        'fabric': 'Heavy Duchess Satin',
        'occasion': 'Cocktail & Black Tie Gala',
        'badge': 'COUTURE',
        'is_featured': True,
        'rating': 4.9,
        'review_count': 35,
        'description': 'Sleek side-slit wrap silhouette with draped cowl neck and luminous silk satin finish that catches every spotlight.',
        'image': 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1080&q=80',
    },
    {
        'name': 'Heritage Raw Indigo Wide Leg Pants',
        'category': 'jeans-pants',
        'price': 2799.00,
        'original_price': 3599.00,
        'fabric': '12oz Selvedge Organic Cotton Denim',
        'occasion': 'Streetwear & Everyday Comfort',
        'badge': 'ECO-DENIM',
        'is_featured': False,
        'rating': 4.7,
        'review_count': 16,
        'description': 'High-rise structured wide trousers tailored with deep pockets, contrast marigold topstitching, and antique brass rivets.',
        'image': 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1080&q=80',
    },
    {
        'name': 'Pattu Pavadai Festive Kids Ensemble',
        'category': 'kids-wear',
        'price': 3499.00,
        'original_price': 4499.00,
        'fabric': 'Soft Handloom Art Silk with Cotton Lining',
        'occasion': 'Festive & Family Celebrations',
        'badge': 'LITTLE ROYALTY',
        'is_featured': True,
        'rating': 4.9,
        'review_count': 28,
        'description': 'Traditional South Indian pleated lehenga skirt and matching contrast brocade blouse designed with child-safe soft cotton inner lining.',
        'image': 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=1080&q=80',
    },
]

INITIAL_BANNERS = [
    {
        'title': 'Festive Royal Heritage Drop',
        'subtitle': 'Handloom Kanchipurams & Chanderi Silks Crafted For Generations',
        'tag': 'FESTIVE SALE',
        'image_url': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=85',
        'link_url': '/shop',
        'button_text': 'Explore All Collections',
    },
    {
        'title': 'Next-Gen AI Virtual Fitting Room',
        'subtitle': 'Try On Any Boutique Ensemble Realtime On Your Own Photograph',
        'tag': 'AI POWERED',
        'image_url': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1600&q=85',
        'link_url': '/fitting-room',
        'button_text': 'Launch Virtual Try-On',
    }
]

class Command(BaseCommand):
    help = 'Seeds initial boutique products and promotional banners into the database'

    def handle(self, *args, **options):
        self.stdout.write("Seeding Aruvi Collections boutique catalogue...")
        
        prod_count = 0
        for item in INITIAL_PRODUCTS:
            img_url = item.pop('image')
            product, created = Product.objects.get_or_create(
                name=item['name'],
                defaults=item
            )
            if created or not product.images.exists():
                ProductImage.objects.get_or_create(
                    product=product,
                    image_url=img_url,
                    defaults={
                        'storage_path': f"products/{product.id}/cover.webp",
                        'alt_text': product.name,
                        'is_primary': True,
                        'display_order': 0
                    }
                )
                prod_count += 1

        banner_count = 0
        for b_data in INITIAL_BANNERS:
            banner, created = PromotionalBanner.objects.get_or_create(
                title=b_data['title'],
                defaults=b_data
            )
            if created:
                banner_count += 1

        self.stdout.write(self.style.SUCCESS(f"Seeded {prod_count} products and {banner_count} banners successfully."))
