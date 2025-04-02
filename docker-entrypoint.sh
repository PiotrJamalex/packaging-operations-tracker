
#!/bin/sh
set -e

# Utwórz katalog danych, jeśli nie istnieje
mkdir -p /app/data

# Initialize JSON files if they don't exist
for file in operations employees machines projects; do
    if [ ! -f "/app/data/$file.json" ]; then
        echo "Initializing $file.json with empty array"
        echo "[]" > "/app/data/$file.json"
    fi
done

# Make sure permissions are correct
chmod -R 777 /app/data
chmod 666 /app/data/*.json

# Start nginx
nginx -g "daemon off;"
