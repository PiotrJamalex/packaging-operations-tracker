
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
RUN mkdir -p /app/data/tmp && chmod 777 /app/data && chmod 777 /app/data/tmp

# Inicjowanie plików JSON z pustymi tablicami
RUN echo "[]" > /app/data/operations.json && \
    echo "[]" > /app/data/employees.json && \
    echo "[]" > /app/data/machines.json && \
    echo "[]" > /app/data/projects.json && \
    chmod 666 /app/data/*.json

# Kopiowanie plików z etapu budowania do katalogu serwera Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Kopiowanie konfiguracji Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposing port 80
EXPOSE 80

# Uruchomienie OpenResty
CMD ["nginx", "-g", "daemon off;"]
