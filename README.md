
# Packaging Operations Tracker

## Instrukcja instalacji

### Wymagania
- Docker
- Docker Compose

### Instalacja

1. Sklonuj repozytorium lub ściągnij pliki aplikacji

2. Uruchom aplikację za pomocą Docker Compose:
```sh
docker compose up -d
```

3. Aplikacja będzie dostępna pod adresem:
```
http://localhost:8080
```

4. Aby zatrzymać aplikację:
```sh
docker compose down
```

5. W przypadku problemów z uruchomieniem, sprawdź logi:
```sh
docker compose logs
```

### Dane aplikacji

Wszystkie dane są zapisywane w folderze `./data` w katalogu głównym aplikacji. Pliki są w formacie JSON i mogą być eksportowane do Excela bezpośrednio z aplikacji.

- `operations.json` - wszystkie operacje produkcyjne
- `employees.json` - lista pracowników
- `machines.json` - lista maszyn
- `projects.json` - lista projektów

## Funkcje aplikacji

- Rejestrowanie operacji produkcyjnych
- Zarządzanie pracownikami i maszynami
- Zarządzanie projektami
- Eksport danych do pliku Excel
- Automatyczne zapisywanie wszystkich danych

## Rozwiązywanie problemów

Jeśli aplikacja nie działa poprawnie:

1. Upewnij się, że port 8080 nie jest używany przez inną aplikację
2. Sprawdź czy pliki w folderze `./data` mają odpowiednie uprawnienia
3. Zrestartuj kontener: `docker compose restart`
4. Sprawdź logi: `docker compose logs`

## Kontakt

W razie pytań lub problemów, skontaktuj się z autorem aplikacji.
