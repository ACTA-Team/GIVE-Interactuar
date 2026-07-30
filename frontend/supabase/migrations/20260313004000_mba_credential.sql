-- =============================================================================
-- Migration: Add MBA credential type
-- Extends public.credential_type enum with 'mba'
-- Generated: 2026-03-13
-- =============================================================================

alter type public.credential_type add value if not exists 'mba';

