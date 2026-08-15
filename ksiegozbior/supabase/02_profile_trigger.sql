-- ════════════════════════════════════════════════════════════════
--  Automatyczne tworzenie profilu po rejestracji użytkownika.
--  Uruchom w Supabase (SQL Editor) PO głównym schema.sql.
-- ════════════════════════════════════════════════════════════════

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    -- unikalny username: część przed @ + krótki losowy sufiks
    split_part(new.email, '@', 1) || '_' || substr(md5(random()::text), 1, 4),
    split_part(new.email, '@', 1)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
