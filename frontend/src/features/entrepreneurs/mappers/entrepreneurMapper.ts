import type {
  Entrepreneur,
  BusinessProfile,
  EntrepreneurProfileSnapshot,
} from '../types';

// TODO: replace Record<string, unknown> with Database['public']['Tables']['entrepreneurs']['Row']
// once database.types.ts is generated via `supabase gen types typescript`
type RawRow = Record<string, unknown>;

export function mapEntrepreneur(row: RawRow): Entrepreneur {
  return {
    id: row.id as string,
    organizationId: row.organization_id as string,
    firstName: row.first_name as string,
    lastName: row.last_name as string,
    fullName: row.full_name as string,
    documentType: row.document_type as string,
    documentNumber: row.document_number as string,
    email: (row.email as string) ?? null,
    phone: (row.phone as string) ?? null,
    municipality: (row.municipality as string) ?? null,
    department: (row.department as string) ?? null,
    country: (row.country as string) ?? 'Colombia',
    active: row.active as boolean,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function mapBusinessProfile(row: RawRow): BusinessProfile {
  return {
    id: row.id as string,
    entrepreneurId: row.entrepreneur_id as string,
    businessName: (row.business_name as string) ?? null,
    businessSector: (row.business_sector as string) ?? null,
    businessActivity: (row.business_activity as string) ?? null,
    monthlySales: (row.monthly_sales as number) ?? null,
    monthlyCosts: (row.monthly_costs as number) ?? null,
    employeeCount: (row.employee_count as number) ?? null,
    formalized: (row.formalized as boolean) ?? null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function mapSnapshot(row: RawRow): EntrepreneurProfileSnapshot {
  return {
    id: row.id as string,
    entrepreneurId: row.entrepreneur_id as string,
    sourceSubmissionId: (row.source_submission_id as string) ?? null,
    sourceSyncRunId: (row.source_sync_run_id as string) ?? null,
    snapshotVersion: row.snapshot_version as number,
    isLatest: row.is_latest as boolean,
    snapshotDate: row.snapshot_date as string,
    data: (row.data as Record<string, unknown>) ?? {},
    createdAt: row.created_at as string,
  };
}
