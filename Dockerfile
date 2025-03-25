
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
FROM nginx:alpine

# Kopiowanie plików z etapu budowania do katalogu serwera Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Kopiowanie konfiguracji Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposing port 80
EXPOSE 80

# Uruchomienie Nginx
CMD ["nginx", "-g", "daemon off;"]
