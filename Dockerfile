# Build Stage for Frontend
FROM node:18-alpine as frontend_build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Production Stage
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy Backend Code
COPY . .

# Copy Built Frontend from Build Stage
# We copy it to a folder OUTSIDE /app so the volume mount doesn't hide it
COPY --from=frontend_build /app/frontend/dist /frontend_build

# Environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Entrypoint script
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Expose port
EXPOSE 8000

# Start command
CMD ["./entrypoint.sh"]
