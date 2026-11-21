#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "📦 Installing backend dependencies..."
pip install -r requirements.txt

echo "🎨 Collecting static files for WhiteNoise..."
python manage.py collectstatic --no-input

echo "🗄️ Applying database migrations..."
python manage.py migrate

echo "📥 Loading initial seed data (admin, categories, settings, products)..."
python manage.py loaddata apps/initial_data.json || true

echo "✅ Backend build completed successfully!"
