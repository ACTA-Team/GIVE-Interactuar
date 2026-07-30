-- =============================================================================
-- Seed data for local development
-- Run after: supabase db reset
-- =============================================================================

-- Credential template
insert into public.credential_templates (
  id, name, credential_type, schema_version, template_definition, active
)
values (
  '00000000-0000-0000-0000-000000000200',
  'Credencial de Impacto - v1',
  'impact',
  '1.0.0',
  '{
    "fields": [
      { "key": "program", "label": "Programa", "type": "text" },
      { "key": "cohort",  "label": "Cohorte",  "type": "text" },
      { "key": "score",   "label": "Puntaje",  "type": "number" }
    ]
  }'::jsonb,
  true
)
on conflict (id) do nothing;
