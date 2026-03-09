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
-- NOTE: auth_user_id is null here — set it after creating the user in Supabase Auth
-- Example: update public.internal_users set auth_user_id = '<auth-uuid>' where email = 'admin@giveinteractuar.org';
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

-- Sample entrepreneur
insert into public.entrepreneurs (
  id, organization_id, first_name, last_name,
  document_type, document_number,
  email, municipality, department, country
)
values (
  '00000000-0000-0000-0000-000000000100',
  '00000000-0000-0000-0000-000000000001',
  'María',
  'García',
  'CC',
  '1234567890',
  'maria.garcia@example.com',
  'Medellín',
  'Antioquia',
  'Colombia'
)
on conflict do nothing;

-- Sample business profile for the entrepreneur
insert into public.entrepreneur_business_profiles (
  entrepreneur_id, business_name, business_sector, formalized
)
values (
  '00000000-0000-0000-0000-000000000100',
  'Artesanías García',
  'Artesanías',
  false
)
on conflict do nothing;

-- Sample credential template
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

-- TODO: add sample form_sources once Google Forms integration is configured
-- TODO: add sample stellar_wallets once Stellar testnet accounts are created
