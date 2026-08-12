-- Rejects any new auth.users row whose email isn't @interactuar.com.
-- Client-side checks (src/app/page.tsx) are just UX — this is the real
-- boundary, since anyone can call the Supabase Auth signup API directly.
create or replace function public.enforce_interactuar_domain()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email !~* '@interactuar\.com$' then
    raise exception 'Solo se permiten registros con correo @interactuar.com';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_interactuar_domain_trigger on auth.users;

create trigger enforce_interactuar_domain_trigger
  before insert on auth.users
  for each row execute function public.enforce_interactuar_domain();
