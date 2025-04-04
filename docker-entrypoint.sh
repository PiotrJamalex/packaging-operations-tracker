
#!/bin/sh
set -e

# Create data directory if it doesn't exist
mkdir -p /app/data

# Initialize JSON files if they don't exist
for file in operations employees machines projects; do
    if [ ! -f "/app/data/$file.json" ]; then
        echo "Initializing $file.json with empty array"
        echo "[]" > "/app/data/$file.json"
    fi
done

# Set permissions
chmod -R 777 /app/data
chmod 666 /app/data/*.json

# Debug information
echo "Directory structure:"
ls -la /app
ls -la /app/data
ls -la /usr/share/nginx/html

# Start nginx
echo "Starting nginx..."
nginx -g "daemon off;"
