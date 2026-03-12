-- Financial profiles for entrepreneurs (credit assessment data)
create table if not exists financial_profiles (
  id            uuid primary key default gen_random_uuid(),
  entrepreneur_id uuid not null references entrepreneurs(id),
  credit_level  text check (credit_level in ('bajo','medio','alto','excelente')),
  loan_status   text,
  raw_data      jsonb default '{}',
  imported_at   timestamptz,
  source_file   text,
  created_at    timestamptz default now()
);

create index idx_financial_profiles_entrepreneur on financial_profiles(entrepreneur_id);
