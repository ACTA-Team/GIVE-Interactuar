import type { Organization, InternalUser } from '../types';
import type { SupabaseLikeClient } from '@/@types/supabase';

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

export function createOrganizationRepository(client: SupabaseLikeClient) {
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

    async findAll(filters?: { active?: boolean }): Promise<Organization[]> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (client as any).from('organizations').select('*');
      if (filters?.active !== undefined) {
        query = query.eq('active', filters.active);
      }
      query = query.order('name');
      const { data, error } = await query;
      if (error) throw error;
      return (data as RawRow[]).map(mapOrganization);
    },

    async findAllInternalUsers(filters?: {
      organizationId?: string;
      active?: boolean;
      role?: string;
    }): Promise<InternalUser[]> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (client as any).from('internal_users').select('*');
      if (filters?.organizationId !== undefined) {
        query = query.eq('organization_id', filters.organizationId);
      }
      if (filters?.active !== undefined) {
        query = query.eq('active', filters.active);
      }
      if (filters?.role !== undefined) {
        query = query.eq('role', filters.role);
      }
      query = query.order('full_name');
      const { data, error } = await query;
      if (error) throw error;
      return (data as RawRow[]).map(mapInternalUser);
    },

    async findInternalUserById(id: string): Promise<InternalUser | null> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (client as any)
        .from('internal_users')
        .select('*')
        .eq('id', id)
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
