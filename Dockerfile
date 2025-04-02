
# Etap budowania
FROM node:18-alpine AS build

# Ustawienie katalogu roboczego
WORKDIR /app

# Kopiowanie plików package.json i package-lock.json
COPY package*.json ./

# Instalacja zależności
RUN npm ci

# Kopiowanie reszty kodu źródłowego
COPY . .

# Budowanie aplikacji
RUN npm run build

# Etap produkcyjny
FROM openresty/openresty:alpine

# Tworzenie katalogów do przechowywania danych
RUN mkdir -p /app/data/tmp && \
    chmod -R 777 /app/data && \
    chmod -R 777 /app/data/tmp

# Inicjowanie plików JSON tylko jeśli nie istnieją
RUN echo "[]" > /app/data/operations.json.template && \
    echo "[]" > /app/data/employees.json.template && \
    echo "[]" > /app/data/machines.json.template && \
    echo "[]" > /app/data/projects.json.template && \
    chmod 666 /app/data/*.json.template

# Skrypt startowy do inicjalizacji plików JSON
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Kopiowanie plików z etapu budowania do katalogu serwera Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Kopiowanie konfiguracji Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposing port 80
EXPOSE 80

# Uruchomienie skryptu startowego i OpenResty
ENTRYPOINT ["/docker-entrypoint.sh"]
