-- =============================================================================
-- Migration: Add course_completion credential type
-- Course-completion credentials are issued for students (no Supabase record,
-- no entrepreneur), so entrepreneur_id must become optional for this type.
-- Generated: 2026-07-26
-- =============================================================================

alter table public.credentials alter column entrepreneur_id drop not null;

alter type public.credential_type add value if not exists 'course_completion';
