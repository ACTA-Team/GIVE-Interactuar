// TODO: regenerate with:
// supabase gen types typescript --local > src/lib/supabase/database.types.ts
// after running `supabase db push` or `supabase start`

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: Record<string, never>
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
