-- ════════════════════════════════════════════════════════════════
--  KSIĘGOZBIÓR — schemat bazy Supabase (PostgreSQL 15+)
--  Wersja MVP. Bezpieczeństwo oparte na Row Level Security (RLS):
--  każdy użytkownik dotyka WYŁĄCZNIE swoich danych, a dane publiczne
--  (półka publiczna, recenzje, oferty) są udostępniane przez
--  kontrolowane widoki, które NIGDY nie pokazują danych finansowych.
-- ════════════════════════════════════════════════════════════════

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ─── 1. TYPY WYLICZENIOWE ───────────────────────────────────────
create type reading_status as enum ('want_to_read','reading','read','abandoned');
create type physical_state as enum ('in_library','lent_out','on_exchange','lost');
create type listing_status as enum ('active','in_progress','completed','cancelled');
create type proposal_status as enum ('pending','accepted','rejected','completed','cancelled');
create type activity_type as enum ('finished_book','rated_book','wrote_review','listed_book','added_book');
create type report_reason as enum ('spam','scam','offensive','fake_listing','harassment','other');
create type report_status as enum ('open','reviewing','resolved','dismissed');
create type location_precision as enum ('city','exact');

-- ─── 2. TOŻSAMOŚĆ ───────────────────────────────────────────────
-- Rozszerza wbudowane auth.users Supabase o dane publiczne profilu.
create table profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  username           text unique not null,
  display_name       text,
  avatar_url         text,
  bio                text,
  city               text,
  lat                double precision,
  lng                double precision,
  -- PRYWATNOŚĆ (Twoje wymaganie): domyślnie chronione
  loc_precision      location_precision not null default 'city',
  created_at         timestamptz not null default now()
);

-- ─── 3. GLOBALNY KATALOG KSIĄŻEK (po ISBN) ──────────────────────
create table book_catalog (
  id                 uuid primary key default uuid_generate_v4(),
  isbn_10            text,
  isbn_13            text,
  title              text not null,
  author             text not null,
  publisher          text,
  publication_year   int,
  cover_image_url    text,
  cover_color        text,               -- do kafelka w naszym UI
  description        text,
  page_count         int,
  category           text,
  created_by         uuid references profiles(id) on delete set null, -- przy dodaniu ręcznym
  created_at         timestamptz not null default now()
);
create index on book_catalog (isbn_13);
create index on book_catalog (lower(title));
create index on book_catalog (lower(author));

-- ─── 4. PRYWATNY KSIĘGOZBIÓR (dane finansowe = ściśle prywatne) ──
create table user_library (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid not null references profiles(id) on delete cascade,
  book_id            uuid not null references book_catalog(id) on delete restrict,
  reading_status     reading_status not null default 'want_to_read',
  physical_state     physical_state not null default 'in_library',
  current_page       int,                -- postęp czytania (P02)
  -- Dane finansowe — NIGDY nie wychodzą poza właściciela:
  purchase_price     numeric(10,2),
  purchase_currency  text default 'PLN',
  purchase_location  text,               -- Empik, Allegro, antykwariat…
  purchase_date      date,
  -- Ocena i notatki:
  user_rating        smallint check (user_rating between 1 and 5),
  private_notes      text,
  read_date          date,
  tags               text[] default '{}', -- lekkie "półki własne"
  is_shelf_public    boolean not null default true, -- pokaż na publicznej półce
  added_at           timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (user_id, book_id)
);
create index on user_library (user_id);
create index on user_library (book_id);

-- ─── 5. RECENZJE PUBLICZNE (warstwa społeczna, karta książki) ───
create table reviews (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid not null references profiles(id) on delete cascade,
  book_id            uuid not null references book_catalog(id) on delete cascade,
  rating             smallint not null check (rating between 1 and 5),
  body               text,
  is_public          boolean not null default true,
  created_at         timestamptz not null default now(),
  unique (user_id, book_id)
);
create index on reviews (book_id) where is_public;

-- ─── 6. POŻYCZKI (także osobom spoza portalu) ───────────────────
create table loans (
  id                 uuid primary key default uuid_generate_v4(),
  user_library_id    uuid not null references user_library(id) on delete cascade,
  borrower_user_id   uuid references profiles(id) on delete set null,
  borrower_name      text,               -- gdy osoba spoza portalu
  borrower_contact   text,
  loan_date          date not null default current_date,
  expected_return    date,
  returned_at        date,
  created_at         timestamptz not null default now()
);
create index on loans (user_library_id);

-- ─── 7. LISTA ŻYCZEŃ ("szukam…") — podstawa smart-matcha ────────
create table wishlist (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid not null references profiles(id) on delete cascade,
  book_id            uuid references book_catalog(id) on delete cascade,
  free_text          text,               -- gdy tytułu nie ma jeszcze w bazie
  note               text,
  created_at         timestamptz not null default now()
);
create index on wishlist (user_id);
create index on wishlist (book_id);

-- ─── 8. GIEŁDA / WYMIANA (portal tylko kojarzy ludzi) ───────────
-- Platforma NIE pośredniczy w transakcji ani płatnościach.
create table listings (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid not null references profiles(id) on delete cascade,
  user_library_id    uuid not null references user_library(id) on delete cascade,
  condition_desc     text,               -- "bdb", "lekkie zagięcia"
  preferred_notes    text,               -- "szukam: Diuna lub WP"
  status             listing_status not null default 'active',
  -- zdenormalizowana lokalizacja do szybkiego wyszukiwania po okolicy:
  city               text,
  lat                double precision,
  lng                double precision,
  created_at         timestamptz not null default now()
);
create index on listings (status);
create index on listings (city);

create table listing_photos (
  id                 uuid primary key default uuid_generate_v4(),
  listing_id         uuid not null references listings(id) on delete cascade,
  url                text not null,
  position           int default 0
);

create table exchange_proposals (
  id                 uuid primary key default uuid_generate_v4(),
  listing_id         uuid not null references listings(id) on delete cascade,
  requester_id       uuid not null references profiles(id) on delete cascade,
  offered_library_id uuid references user_library(id) on delete set null,
  status             proposal_status not null default 'pending',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index on exchange_proposals (listing_id);
create index on exchange_proposals (requester_id);

-- ─── 9. CZAT (bezpieczna komunikacja, bez numerów telefonu) ─────
create table messages (
  id                 uuid primary key default uuid_generate_v4(),
  proposal_id        uuid not null references exchange_proposals(id) on delete cascade,
  sender_id          uuid not null references profiles(id) on delete cascade,
  body               text not null,
  read_at            timestamptz,
  created_at         timestamptz not null default now()
);
create index on messages (proposal_id);

-- ─── 10. OCENY TRANSAKCJI (reputacja na giełdzie) ───────────────
create table exchange_reviews (
  id                 uuid primary key default uuid_generate_v4(),
  proposal_id        uuid not null references exchange_proposals(id) on delete cascade,
  reviewer_id        uuid not null references profiles(id) on delete cascade,
  reviewed_user_id   uuid not null references profiles(id) on delete cascade,
  rating             smallint not null check (rating between 1 and 5),
  comment            text,
  created_at         timestamptz not null default now(),
  unique (proposal_id, reviewer_id)
);

-- ─── 11. WARSTWA SPOŁECZNA: obserwowanie + feed ─────────────────
create table follows (
  follower_id        uuid not null references profiles(id) on delete cascade,
  following_id       uuid not null references profiles(id) on delete cascade,
  created_at         timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create table activities (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid not null references profiles(id) on delete cascade,
  type               activity_type not null,
  book_id            uuid references book_catalog(id) on delete cascade,
  listing_id         uuid references listings(id) on delete cascade,
  metadata           jsonb default '{}',
  created_at         timestamptz not null default now()
);
create index on activities (user_id, created_at desc);

create table activity_likes (
  activity_id        uuid not null references activities(id) on delete cascade,
  user_id            uuid not null references profiles(id) on delete cascade,
  primary key (activity_id, user_id)
);

create table activity_comments (
  id                 uuid primary key default uuid_generate_v4(),
  activity_id        uuid not null references activities(id) on delete cascade,
  user_id            uuid not null references profiles(id) on delete cascade,
  body               text not null,
  created_at         timestamptz not null default now()
);

-- ─── 12. BEZPIECZEŃSTWO: zgłoszenia i blokady ───────────────────
create table reports (
  id                 uuid primary key default uuid_generate_v4(),
  reporter_id        uuid not null references profiles(id) on delete cascade,
  reported_user_id   uuid references profiles(id) on delete cascade,
  reported_listing_id uuid references listings(id) on delete cascade,
  reason             report_reason not null,
  details            text,
  status             report_status not null default 'open',
  created_at         timestamptz not null default now()
);

create table blocks (
  blocker_id         uuid not null references profiles(id) on delete cascade,
  blocked_id         uuid not null references profiles(id) on delete cascade,
  created_at         timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);

-- ─── 13. POWIADOMIENIA ──────────────────────────────────────────
create table notifications (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid not null references profiles(id) on delete cascade, -- odbiorca
  type               text not null,
  actor_id           uuid references profiles(id) on delete set null,
  payload            jsonb default '{}',
  read_at            timestamptz,
  created_at         timestamptz not null default now()
);
create index on notifications (user_id, created_at desc);

-- ─── 14. Trigger updated_at ─────────────────────────────────────
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger t_ul_updated before update on user_library
  for each row execute function set_updated_at();
create trigger t_ep_updated before update on exchange_proposals
  for each row execute function set_updated_at();

-- ════════════════════════════════════════════════════════════════
--  15. ROW LEVEL SECURITY — sedno bezpieczeństwa
-- ════════════════════════════════════════════════════════════════
alter table profiles            enable row level security;
alter table book_catalog        enable row level security;
alter table user_library        enable row level security;
alter table reviews             enable row level security;
alter table loans               enable row level security;
alter table wishlist            enable row level security;
alter table listings            enable row level security;
alter table listing_photos      enable row level security;
alter table exchange_proposals  enable row level security;
alter table messages            enable row level security;
alter table exchange_reviews    enable row level security;
alter table follows             enable row level security;
alter table activities          enable row level security;
alter table activity_likes      enable row level security;
alter table activity_comments   enable row level security;
alter table reports             enable row level security;
alter table blocks              enable row level security;
alter table notifications       enable row level security;

-- profiles: profil publiczny do odczytu; edytuje tylko właściciel
create policy profiles_read   on profiles for select using (true);
create policy profiles_insert on profiles for insert with check (auth.uid() = id);
create policy profiles_update on profiles for update using (auth.uid() = id);

-- book_catalog: katalog wspólny do odczytu; dodawać może zalogowany
create policy catalog_read   on book_catalog for select using (true);
create policy catalog_insert on book_catalog for insert
  with check (auth.role() = 'authenticated');

-- user_library: CAŁKOWICIE PRYWATNE (w tym ceny) — tylko właściciel.
-- Publiczna półka jest udostępniana osobnym widokiem (patrz sekcja 16).
create policy ul_all on user_library for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- reviews: publiczne do czytania (gdy is_public); pisze właściciel
create policy reviews_read   on reviews for select
  using (is_public or auth.uid() = user_id);
create policy reviews_write  on reviews for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- loans: prywatne — tylko właściciel egzemplarza
create policy loans_all on loans for all using (
  exists (select 1 from user_library ul
          where ul.id = loans.user_library_id and ul.user_id = auth.uid())
) with check (
  exists (select 1 from user_library ul
          where ul.id = loans.user_library_id and ul.user_id = auth.uid())
);

-- wishlist: publiczna (potrzebna do smart-matcha); pisze właściciel
create policy wishlist_read  on wishlist for select using (true);
create policy wishlist_write on wishlist for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- listings: aktywne oferty publiczne; edytuje właściciel
create policy listings_read  on listings for select
  using (status = 'active' or auth.uid() = user_id);
create policy listings_write on listings for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy listing_photos_read on listing_photos for select using (true);
create policy listing_photos_write on listing_photos for all using (
  exists (select 1 from listings l
          where l.id = listing_photos.listing_id and l.user_id = auth.uid())
);

-- exchange_proposals: widzi wnioskujący i właściciel oferty
create policy proposals_read on exchange_proposals for select using (
  requester_id = auth.uid()
  or exists (select 1 from listings l
             where l.id = exchange_proposals.listing_id and l.user_id = auth.uid())
);
create policy proposals_insert on exchange_proposals for insert
  with check (requester_id = auth.uid());
create policy proposals_update on exchange_proposals for update using (
  requester_id = auth.uid()
  or exists (select 1 from listings l
             where l.id = exchange_proposals.listing_id and l.user_id = auth.uid())
);

-- messages: tylko uczestnicy danej propozycji wymiany
create policy messages_read on messages for select using (
  exists (select 1 from exchange_proposals p
          join listings l on l.id = p.listing_id
          where p.id = messages.proposal_id
            and (p.requester_id = auth.uid() or l.user_id = auth.uid()))
);
create policy messages_send on messages for insert with check (
  sender_id = auth.uid()
  and exists (select 1 from exchange_proposals p
              join listings l on l.id = p.listing_id
              where p.id = messages.proposal_id
                and (p.requester_id = auth.uid() or l.user_id = auth.uid()))
);

-- exchange_reviews: publiczne do czytania (reputacja); pisze recenzent
create policy exch_reviews_read  on exchange_reviews for select using (true);
create policy exch_reviews_write on exchange_reviews for insert
  with check (reviewer_id = auth.uid());

-- follows: publiczne do czytania; zarządza obserwujący
create policy follows_read  on follows for select using (true);
create policy follows_write on follows for all
  using (follower_id = auth.uid()) with check (follower_id = auth.uid());

-- activities + interakcje: publiczne do czytania; pisze autor
create policy act_read  on activities for select using (true);
create policy act_write on activities for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy likes_read  on activity_likes for select using (true);
create policy likes_write on activity_likes for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy comments_read  on activity_comments for select using (true);
create policy comments_write on activity_comments for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- reports: zgłasza każdy zalogowany; ZWYKŁY user NIE czyta zgłoszeń
create policy reports_insert on reports for insert
  with check (reporter_id = auth.uid());
-- (odczyt zgłoszeń tylko przez service_role / panel moderatora)

-- blocks: użytkownik zarządza własnymi blokadami
create policy blocks_all on blocks for all
  using (blocker_id = auth.uid()) with check (blocker_id = auth.uid());

-- notifications: tylko odbiorca
create policy notif_all on notifications for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ════════════════════════════════════════════════════════════════
--  16. WIDOKI PUBLICZNE I DYSKRYPCYJNE
-- ════════════════════════════════════════════════════════════════

-- Publiczna półka: BEZPIECZNA projekcja user_library.
-- Widok "definer" celowo omija ceny/notatki i pokazuje tylko to,
-- co user zgodził się upublicznić (is_shelf_public).
create view public_shelf with (security_invoker = false) as
  select ul.user_id, ul.book_id, ul.reading_status,
         ul.user_rating, ul.tags, ul.added_at
  from user_library ul
  where ul.is_shelf_public;
grant select on public_shelf to anon, authenticated;

-- Średnia ocena społeczności per książka — do STREFY INSPIRACJI.
-- Opiera się na publicznych recenzjach (invoker = respektuje RLS).
create view community_book_rating with (security_invoker = true) as
  select book_id,
         round(avg(rating)::numeric, 2) as avg_rating,
         count(*)                        as ratings_count
  from reviews
  where is_public
  group by book_id;
grant select on community_book_rating to anon, authenticated;

-- ════════════════════════════════════════════════════════════════
--  17. WIDOKI DASHBOARDU (per użytkownik — invoker = tylko własne)
-- ════════════════════════════════════════════════════════════════

-- Miesięczne wydatki na książki (wykres słupkowy).
create view v_monthly_spend with (security_invoker = true) as
  select user_id,
         date_trunc('month', purchase_date)::date as month,
         sum(purchase_price)                        as total
  from user_library
  where purchase_price is not null and purchase_date is not null
  group by user_id, date_trunc('month', purchase_date);
grant select on v_monthly_spend to authenticated;

-- Zbiorcze statystyki czytelnicze (kafelki "W skrócie").
create view v_reading_stats with (security_invoker = true) as
  select ul.user_id,
         count(*) filter (where ul.reading_status = 'read')       as books_read,
         coalesce(sum(bc.page_count) filter
                  (where ul.reading_status = 'read'), 0)          as pages_read,
         round(avg(ul.user_rating)::numeric, 2)                   as avg_rating
  from user_library ul
  join book_catalog bc on bc.id = ul.book_id
  group by ul.user_id;
grant select on v_reading_stats to authenticated;

-- Uwaga: "ulubione gatunki" i "najczęściej czytani autorzy" to proste
-- GROUP BY po user_library × book_catalog — liczone w warstwie aplikacji.
