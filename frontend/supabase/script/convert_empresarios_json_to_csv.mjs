import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const rootDir = resolve(process.cwd(), 'frontend', 'supabase', 'docs');
const jsonPath = resolve(rootDir, 'empresarios.json');
const csvPath = resolve(rootDir, 'empresarios.csv');

const raw = readFileSync(jsonPath, 'utf8');
const data = JSON.parse(raw);

if (!Array.isArray(data)) {
  throw new Error('Expected empresarios.json to contain an array');
}

// Use keys from the first object as the header order
const headerKeys = [
  'name',
  'company',
  'program',
  'partner',
  'status',
  'gender',
  'municipality',
  'sector',
  'sales_prev_year_cop',
  'sales_cop',
  'growth_pct',
  'new_jobs',
  'level',
  'group',
  'cohort_year',
  'active_credit',
  'education',
  'strata',
  'residence_zone',
  'legal_entity',
  'company_size',
  'age',
  'age_range',
  'credit_requested',
  'delinquent',
];

const escapeCsv = (value) => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // Quote if contains comma, quote, or newline
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const lines = [];

// Header
lines.push(headerKeys.map(escapeCsv).join(','));

// Rows
for (const row of data) {
  const values = headerKeys.map((key) => escapeCsv(row[key]));
  lines.push(values.join(','));
}

writeFileSync(csvPath, lines.join('\n'), 'utf8');
console.log(`Wrote ${data.length} rows to ${csvPath}`);
