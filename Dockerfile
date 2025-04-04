
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
    apk add --no-cache nginx-mod-http-lua dos2unix && \
    mkdir -p /app/data /tmp/nginx/client-body

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint script and ensure it has Unix line endings
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN dos2unix /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# Set correct permissions
RUN mkdir -p /app/data && \
    chmod -R 777 /app/data

# Expose port
EXPOSE 80

# Set entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]
