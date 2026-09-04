from django.core.management.base import BaseCommand
from django.utils.text import slugify
from core.models import Category, Product


class Command(BaseCommand):
    help = "Seed the database with sample categories and products for demo purposes."

    def handle(self, *args, **options):
        categories = ['Electronics', 'Fashion', 'Home & Kitchen', 'Books']
        cat_objs = {}
        for name in categories:
            cat, _ = Category.objects.get_or_create(name=name, defaults={'slug': slugify(name)})
            cat_objs[name] = cat

        products = [
            ('Wireless Headphones', 'Electronics', 2499.00, 25, 'Over-ear wireless headphones with noise cancellation.'),
            ('Smart Watch', 'Electronics', 3999.00, 15, 'Fitness tracking smart watch with heart-rate monitor.'),
            ("Men's Cotton T-Shirt", 'Fashion', 499.00, 100, 'Comfortable everyday cotton t-shirt.'),
            ("Women's Denim Jacket", 'Fashion', 1899.00, 40, 'Classic fit denim jacket.'),
            ('Non-stick Frying Pan', 'Home & Kitchen', 899.00, 60, 'Durable non-stick frying pan, 26cm.'),
            ('Ceramic Coffee Mug Set', 'Home & Kitchen', 649.00, 80, 'Set of 4 ceramic coffee mugs.'),
            ('Clean Code', 'Books', 799.00, 30, 'A handbook of agile software craftsmanship.'),
            ('Atomic Habits', 'Books', 399.00, 50, 'An easy and proven way to build good habits.'),
        ]

        for name, cat_name, price, stock, desc in products:
            Product.objects.get_or_create(
                name=name,
                defaults={
                    'slug': slugify(name),
                    'category': cat_objs[cat_name],
                    'price': price,
                    'stock': stock,
                    'description': desc,
                },
            )

        self.stdout.write(self.style.SUCCESS(
            f"Seeded {len(categories)} categories and {len(products)} products."
        ))
