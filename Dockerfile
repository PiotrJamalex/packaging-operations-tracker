
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

# Install required packages
RUN apk update && \
    apk add --no-cache nginx-mod-http-lua && \
    mkdir -p /app/data /tmp/nginx/client-body

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Remove any default configuration if it exists
RUN rm -f /etc/nginx/conf.d/default.conf

# Create a proper entrypoint script
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'set -e' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# Create data directory if it does not exist' >> /docker-entrypoint.sh && \
    echo 'mkdir -p /app/data' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# Initialize JSON files if they do not exist' >> /docker-entrypoint.sh && \
    echo 'for file in operations employees machines projects; do' >> /docker-entrypoint.sh && \
    echo '    if [ ! -f "/app/data/$file.json" ]; then' >> /docker-entrypoint.sh && \
    echo '        echo "Initializing $file.json with empty array"' >> /docker-entrypoint.sh && \
    echo '        echo "[]" > "/app/data/$file.json"' >> /docker-entrypoint.sh && \
    echo '    fi' >> /docker-entrypoint.sh && \
    echo 'done' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# Set permissions' >> /docker-entrypoint.sh && \
    echo 'chmod -R 777 /app/data' >> /docker-entrypoint.sh && \
    echo 'chmod 666 /app/data/*.json' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# Debug information' >> /docker-entrypoint.sh && \
    echo 'echo "Directory structure:"' >> /docker-entrypoint.sh && \
    echo 'ls -la /app' >> /docker-entrypoint.sh && \
    echo 'ls -la /app/data' >> /docker-entrypoint.sh && \
    echo 'ls -la /usr/share/nginx/html' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# Load the http_lua module before starting nginx' >> /docker-entrypoint.sh && \
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
