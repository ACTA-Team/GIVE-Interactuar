-- Real domain is @interactuar.org.co, not @interactuar.com.
create or replace function public.enforce_interactuar_domain()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email !~* '@interactuar\.org\.co$'
     and lower(new.email) not in ('test@gmail.com') then
    raise exception 'Solo se permiten registros con correo @interactuar.org.co';
  end if;
  return new;
end;
$$;
