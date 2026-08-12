-- Storage bucket for uploaded blank PDF certificate templates.
-- Private: always read server-side via the service role client
-- (src/lib/supabase/storage.ts), never directly from the browser.
-- Stores the *template* only — never the uploaded roster, which is
-- deliberately never persisted anywhere.
insert into storage.buckets (id, name, public)
values ('course-templates', 'course-templates', false)
on conflict (id) do nothing;
