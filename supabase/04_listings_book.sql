-- Denormalizacja: book_id + backfill na listings.
-- Dzięki temu giełda pokazuje książkę z oferty bez dostępu do prywatnego user_library.
-- Bezpieczne do wielokrotnego uruchomienia.

alter table public.listings
  add column if not exists book_id uuid references public.book_catalog(id);

-- Uzupełnij istniejące oferty (SQL działa z uprawnieniami właściciela, omija RLS).
update public.listings l
set book_id = ul.book_id
from public.user_library ul
where l.user_library_id = ul.id
  and l.book_id is null;

create index if not exists listings_book_id_idx on public.listings (book_id);
