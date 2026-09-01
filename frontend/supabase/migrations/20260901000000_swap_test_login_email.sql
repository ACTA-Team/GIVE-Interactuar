-- Swaps the one-off signup-domain exception from test@gmail.com to
-- rsft6000@gmail.com. Keep the allowlist here (not a separate table) so
-- the domain check stays a single, auditable function.
create or replace function public.enforce_interactuar_domain()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email !~* '@interactuar\.org\.co$'
     and lower(new.email) not in ('rsft6000@gmail.com') then
    raise exception 'Solo se permiten registros con correo @interactuar.org.co';
  end if;
  return new;
end;
$$;
