
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
    apk add --no-cache python3 py3-flask py3-pip bash && \
    pip install flask-cors && \
    mkdir -p /app/data /tmp/nginx/client-body && \
    chmod -R 777 /app/data /tmp/nginx/client-body

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy file handler script
COPY file_handler.py /app/file_handler.py

# Remove any default configuration if it exists
RUN rm -f /etc/nginx/conf.d/default.conf

# Create a simple entrypoint script with better error handling
RUN echo '#!/bin/bash' > /docker-entrypoint.sh && \
    echo 'set -e' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# Create data directory with proper permissions' >> /docker-entrypoint.sh && \
    echo 'mkdir -p /app/data' >> /docker-entrypoint.sh && \
    echo 'touch /app/data/data.json' >> /docker-entrypoint.sh && \
    echo 'chmod -R 777 /app' >> /docker-entrypoint.sh && \
    echo 'chmod 666 /app/data/data.json' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# Check file permissions' >> /docker-entrypoint.sh && \
    echo 'echo "Checking file permissions:"' >> /docker-entrypoint.sh && \
    echo 'ls -la /app/data/' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# Initialize data file with default content if empty' >> /docker-entrypoint.sh && \
    echo 'if [ ! -s /app/data/data.json ]; then' >> /docker-entrypoint.sh && \
    echo '  echo "{\\"operations\\":[],\\"employees\\":[{\\"id\\":\\"aneta\\",\\"name\\":\\"Aneta\\"},{\\"id\\":\\"ewa\\",\\"name\\":\\"Ewa\\"},{\\"id\\":\\"adam\\",\\"name\\":\\"Adam\\"},{\\"id\\":\\"piotr\\",\\"name\\":\\"Piotr\\"}],\\"machines\\":[{\\"id\\":\\"drukarka\\",\\"name\\":\\"Drukarka\\",\\"icon\\":\\"printer\\"},{\\"id\\":\\"autobox\\",\\"name\\":\\"Autobox\\",\\"icon\\":\\"package\\"},{\\"id\\":\\"bigówka\\",\\"name\\":\\"Bigówka\\",\\"icon\\":\\"scissors\\"}],\\"projects\\":[]}" > /app/data/data.json' >> /docker-entrypoint.sh && \
    echo '  echo "Created and initialized new data file"' >> /docker-entrypoint.sh && \
    echo 'else' >> /docker-entrypoint.sh && \
    echo '  echo "Using existing data file"' >> /docker-entrypoint.sh && \
    echo 'fi' >> /docker-entrypoint.sh && \
    echo 'chmod 666 /app/data/data.json' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# Start the file handler server in background' >> /docker-entrypoint.sh && \
    echo 'echo "Starting file handler server..."' >> /docker-entrypoint.sh && \
    echo 'python3 /app/file_handler.py > /var/log/file_handler.log 2>&1 &' >> /docker-entrypoint.sh && \
    echo 'FILE_HANDLER_PID=$!' >> /docker-entrypoint.sh && \
    echo 'sleep 3' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# Log the file handler startup' >> /docker-entrypoint.sh && \
    echo 'echo "File handler started with PID: $FILE_HANDLER_PID, checking health..."' >> /docker-entrypoint.sh && \
    echo 'if ! curl -s http://127.0.0.1:8000/health; then' >> /docker-entrypoint.sh && \
    echo '  echo "Warning: File handler health check failed"' >> /docker-entrypoint.sh && \
    echo '  echo "File handler logs:"' >> /docker-entrypoint.sh && \
    echo '  tail -n 20 /var/log/file_handler.log' >> /docker-entrypoint.sh && \
    echo 'else' >> /docker-entrypoint.sh && \
    echo '  echo "File handler health check passed"' >> /docker-entrypoint.sh && \
    echo 'fi' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# Log nginx configuration for debugging' >> /docker-entrypoint.sh && \
    echo 'echo "Testing nginx configuration..."' >> /docker-entrypoint.sh && \
    echo 'nginx -t' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# Start nginx' >> /docker-entrypoint.sh && \
    echo 'echo "Starting nginx..."' >> /docker-entrypoint.sh && \
    echo 'nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# Set correct permissions
RUN mkdir -p /app/data && \
    touch /app/data/data.json && \
    chmod -R 777 /app && \
    chmod 666 /app/data/data.json

# Expose port
EXPOSE 80

# Set entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]
