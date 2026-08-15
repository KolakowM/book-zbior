# Księgozbiór

Aplikacja do zarządzania biblioteczką książek, recenzji i wymiany między
czytelnikami. Next.js (App Router) + Supabase. To pierwszy działający wycinek:
rejestracja, logowanie i prywatna biblioteka (dodawanie, usuwanie, filtrowanie).

## Wymagania

- Node.js 18.17+ (zalecane 20+)
- Konto i projekt w Supabase (masz już: `eibuoqcedfdolswgxvjw`)

## Uruchomienie krok po kroku

1. **Zależności**

   ```bash
   npm install
   ```

2. **Baza danych** — w panelu Supabase → SQL Editor uruchom po kolei:
   - `supabase/01_schema.sql` (to już zrobiłeś)
   - `supabase/02_profile_trigger.sql` (tworzy profil automatycznie po rejestracji)

3. **Zmienne środowiskowe** — skopiuj `.env.local.example` do `.env.local`
   i wklej klucz `anon`:

   ```bash
   cp .env.local.example .env.local
   ```

   Klucz `anon` znajdziesz w: Supabase → Project Settings → API →
   „Project API keys" → `anon` `public`.

4. **Autoryzacja (na czas developmentu)** — w Supabase → Authentication →
   Providers → Email możesz na początek **wyłączyć „Confirm email"**, żeby
   móc się logować od razu po rejestracji bez klikania w link z maila.

5. **Start**

   ```bash
   npm run dev
   ```

   Wejdź na `http://localhost:3000` → zostaniesz przekierowany na `/login`.
   Załóż konto, dodaj książkę — pojawi się na półce i zapisze w bazie.

## Co już działa

- Rejestracja / logowanie (Supabase Auth, e-mail + hasło)
- Prywatna biblioteka czytana przez RLS (widzisz tylko swoje książki)
- Dodawanie książki (ręcznie), usuwanie, wyszukiwanie, filtry statusów

## Czego jeszcze nie ma (kolejne kroki)

- Skaner ISBN i pobieranie metadanych z API (Google Books / Open Library)
- Karta pojedynczej książki, profil publiczny, dashboard statystyk
- Giełda / wymiana, czat, zgłaszanie użytkowników
- Strefa inspiracji (rekomendacje + średnie oceny społeczności)
- Deduplikacja katalogu książek

## Struktura

```
src/
  app/
    page.tsx              przekierowanie wg zalogowania
    login/                logowanie i rejestracja
    (app)/biblioteka/     prywatna półka (serwerowe pobranie danych)
  components/             BookCard, LibraryView, AddBookModal
  lib/
    supabase/             klienci przeglądarki i serwera
    actions/library.ts    akcje serwera (CRUD) — działają przez RLS
    statuses.ts, types.ts konfiguracja i typy
  styles/shelf.ts         style półki (wygląd z prototypu)
middleware.ts             odświeżanie sesji + ochrona tras
supabase/                 skrypty SQL bazy
```

## Bezpieczeństwo

- Dane finansowe (ceny, miejsce zakupu) są w tabeli `user_library` i przez RLS
  **nie opuszczają właściciela**. Publiczna półka idzie osobnym widokiem bez
  tych kolumn.
- Do produkcji: postaw serwis za Cloudflare (WAF, rate limiting, ochrona botów)
  i nigdy nie umieszczaj klucza `service_role` po stronie klienta.
