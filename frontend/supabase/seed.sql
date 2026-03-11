-- =============================================================================
-- Seed data for local development
-- Run after: supabase db reset
-- =============================================================================

-- Organization
insert into public.organizations (id, name, legal_name, email, active)
values (
  '00000000-0000-0000-0000-000000000001',
  'GIVE Interactuar',
  'Fundación GIVE Interactuar',
  'admin@giveinteractuar.org',
  true
)
on conflict (id) do nothing;

-- Internal user (admin)
insert into public.internal_users (id, organization_id, full_name, email, role, active)
values (
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'Admin GIVE',
  'admin@giveinteractuar.org',
  'admin',
  true
)
on conflict (id) do nothing;

-- Credential template
insert into public.credential_templates (
  id, organization_id, name, credential_type, schema_version, template_definition, active
)
values (
  '00000000-0000-0000-0000-000000000200',
  '00000000-0000-0000-0000-000000000001',
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
