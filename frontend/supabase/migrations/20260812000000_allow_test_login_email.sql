-- Adds a one-off exception to the @interactuar.com signup restriction for
-- a test account. Keep the allowlist here (not a separate table) so the
-- domain check stays a single, auditable function.
create or replace function public.enforce_interactuar_domain()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email !~* '@interactuar\.com$'
     and lower(new.email) not in ('test@gmail.com') then
    raise exception 'Solo se permiten registros con correo @interactuar.com';
  end if;
  return new;
end;
$$;
