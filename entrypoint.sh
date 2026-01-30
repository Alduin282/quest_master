#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting deployment script..."

# 1. Apply Database Migrations
echo "Applying database migrations..."
python manage.py migrate --noinput

# 2. Collect Static Files (from frontend build + django admin)
echo "Collecting static files..."
python manage.py collectstatic --noinput

# 3. Start Background Scheduler (Non-blocking)
echo "Starting background scheduler..."
python run_scheduler.py &
SCHEDULER_PID=$!

# 4. Start Gunicorn (Blocking)
echo "Starting Gunicorn on 0.0.0.0:8000..."
exec gunicorn quest_service.wsgi:application --bind 0.0.0.0:8000
