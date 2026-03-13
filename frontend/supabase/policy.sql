create policy "Allow anon read escuela"
  on public.escuela for select to anon using (true);

create policy "Allow anon read empresarios"
on public.empresarios
for select
to anon
using (true);

create policy "Allow anon read cartera_vencida"
  on public.cartera_vencida for select to anon using (true);

create policy "Allow anon read recoleccion"
  on public.recoleccion for select to anon using (true);

create policy "Allow anon read credentials"
  on public.credentials for select to anon using (true);

create policy "Allow anon read issuance_drafts"
  on public.issuance_drafts for select to anon using (true);

create policy "Allow anon read credential_templates"
  on public.credential_templates for select to anon using (true);

create policy "Allow anon read escuela"
  on public.escuela for select to anon using (true);