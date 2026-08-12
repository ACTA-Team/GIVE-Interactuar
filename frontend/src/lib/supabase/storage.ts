// Server-only module: no "use client" directive, and must not be imported
// from any file that has one.
//
// Thin wrapper around the "course-templates" bucket — the one deliberate
// exception to "the uploaded roster never persists": the blank PDF
// certificate template a professor uploads alongside the Excel gets stored
// here so /credential/{publicId}'s PDF keeps working after the browser
// session ends. The roster itself is never written anywhere.
//
// Deliberately NOT using createServerSupabaseClient() (the @supabase/ssr
// cookie-aware client) here: when the incoming request carries the
// professor's own session cookies, that client's Storage calls appear to
// authenticate as that (anon/authenticated) session instead of the service
// role key, which trips "new row violates row-level security policy" on
// this bucket (no policies exist for non-service-role callers, by design —
// this bucket is only ever meant to be read/written server-side). A plain,
// cookie-independent client sidesteps that entirely and always uses the
// service role key.
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseRoleKey } from '@/lib/constants/env';

const BUCKET = 'course-templates';

function getStorageClient() {
  return createClient(supabaseUrl!, supabaseRoleKey!);
}

export async function uploadCourseTemplate(
  key: string,
  buffer: Buffer,
): Promise<void> {
  const supabase = getStorageClient();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(key, buffer, { contentType: 'application/pdf', upsert: true });
  if (error) throw error;
}

export async function getCourseTemplate(key: string): Promise<Buffer> {
  const supabase = getStorageClient();
  const { data, error } = await supabase.storage.from(BUCKET).download(key);
  if (error) throw error;
  return Buffer.from(await data.arrayBuffer());
}
