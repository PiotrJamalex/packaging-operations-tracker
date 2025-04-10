
# Build stage
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Install required packages for file handling
RUN apk update && \
    apk add --no-cache python3 py3-flask py3-pip && \
    pip install flask-cors && \
    mkdir -p /app/data /tmp/nginx/client-body

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy file handler script
COPY file_handler.py /app/file_handler.py

# Remove any default configuration if it exists
RUN rm -f /etc/nginx/conf.d/default.conf

# Create a proper entrypoint script
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'set -e' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# Create data directory if it does not exist' >> /docker-entrypoint.sh && \
    echo 'mkdir -p /app/data' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# Initialize JSON data file if it does not exist' >> /docker-entrypoint.sh && \
    echo 'if [ ! -f "/app/data/data.json" ]; then' >> /docker-entrypoint.sh && \
    echo '    echo "Initializing data.json with empty structure"' >> /docker-entrypoint.sh && \
    echo '    echo "{\"operations\": [], \"employees\": [], \"machines\": [], \"projects\": []}" > "/app/data/data.json"' >> /docker-entrypoint.sh && \
    echo 'fi' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# Set permissions' >> /docker-entrypoint.sh && \
    echo 'chmod -R 777 /app/data' >> /docker-entrypoint.sh && \
    echo 'chmod 666 /app/data/data.json' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# Debug information' >> /docker-entrypoint.sh && \
    echo 'echo "Directory structure:"' >> /docker-entrypoint.sh && \
    echo 'ls -la /app' >> /docker-entrypoint.sh && \
    echo 'ls -la /app/data' >> /docker-entrypoint.sh && \
    echo 'echo "Data file content:"' >> /docker-entrypoint.sh && \
    echo 'cat /app/data/data.json' >> /docker-entrypoint.sh && \
    echo 'ls -la /usr/share/nginx/html' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# Start the file handler server in background' >> /docker-entrypoint.sh && \
    echo 'echo "Starting file handler server..."' >> /docker-entrypoint.sh && \
    echo 'python3 /app/file_handler.py > /var/log/file_handler.log 2>&1 &' >> /docker-entrypoint.sh && \
    echo 'echo "Waiting for file handler server to start..."' >> /docker-entrypoint.sh && \
    echo 'sleep 5' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# Start nginx' >> /docker-entrypoint.sh && \
    echo 'echo "Starting nginx..."' >> /docker-entrypoint.sh && \
    echo 'nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# Set correct permissions
RUN mkdir -p /app/data && \
    chmod -R 777 /app/data

# Expose port
EXPOSE 80

# Set entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]
