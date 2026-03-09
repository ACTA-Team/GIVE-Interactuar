import type { SupabaseClient } from '@supabase/supabase-js';
import type { Organization, InternalUser } from '../types';

type RawRow = Record<string, unknown>;

function mapOrganization(row: RawRow): Organization {
  return {
    id: row.id as string,
    name: row.name as string,
    legalName: (row.legal_name as string) ?? null,
    documentType: (row.document_type as string) ?? null,
    documentNumber: (row.document_number as string) ?? null,
    email: (row.email as string) ?? null,
    phone: (row.phone as string) ?? null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    active: row.active as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapInternalUser(row: RawRow): InternalUser {
  return {
    id: row.id as string,
    authUserId: (row.auth_user_id as string) ?? null,
    organizationId: row.organization_id as string,
    fullName: row.full_name as string,
    email: row.email as string,
    role: row.role as InternalUser['role'],
    active: row.active as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// TODO: switch to SupabaseClient<Database> once database.types.ts is generated
export function createOrganizationRepository(client: SupabaseClient) {
  return {
    async findById(id: string): Promise<Organization | null> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (client as any)
        .from('organizations')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return mapOrganization(data);
    },

    async findUserByAuthId(authUserId: string): Promise<InternalUser | null> {
      // Used to resolve the current user's organization and role from auth session
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (client as any)
        .from('internal_users')
        .select('*')
        .eq('auth_user_id', authUserId)
        .single();
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return mapInternalUser(data);
    },
  };
}

export type OrganizationRepository = ReturnType<
  typeof createOrganizationRepository
>;
