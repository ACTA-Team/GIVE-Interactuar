create policy "Allow anon read empresarios"
on public.empresarios
for select
to anon
using (true);

create policy "Allow authenticated read empresarios"
on public.empresarios
for select
to authenticated
using (true);

create policy "Allow authenticated read credentials"
on public.credentials
for select
to authenticated
using (true);

create policy "Allow authenticated insert credentials"
on public.credentials
for insert
to authenticated
with check (true);

create policy "Allow authenticated read issuance_drafts"
on public.issuance_drafts
for select
to authenticated
using (true);

create policy "Allow authenticated insert issuance_drafts"
on public.issuance_drafts
for insert
to authenticated
with check (true);

create policy "Allow authenticated read credential_templates"
on public.credential_templates
for select
to authenticated
using (true);

-- Overdue portfolio (cartera_vencida) metrics for dashboard
create policy "Allow authenticated read cartera_vencida"
on public.cartera_vencida
for select
to authenticated
using (true);

-- Escuela intervention type distribution for dashboard
create policy "Allow authenticated read escuela"
on public.escuela
for select
to authenticated
using (true);
