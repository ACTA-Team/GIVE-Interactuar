create policy "Allow anon read empresarios"
on public.empresarios
for select
to anon
using (true);