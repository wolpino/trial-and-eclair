#!/bin/sh
set -eu
python manage.py migrate --noinput
# Starter cards come from seed/data/starter_recipes.json; safe on public URLs.
python manage.py load_starter_recipes
python manage.py load_sample_kitchen
python manage.py load_default_references
python manage.py load_demo_data || echo "load_demo_data failed; starting without demo data"
exec gunicorn config.wsgi:application \
  --bind "0.0.0.0:${PORT:-8000}" \
  --workers "${WEB_CONCURRENCY:-2}" \
  --timeout 30
