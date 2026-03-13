import { z } from 'zod';

export const CredentialTypeSchema = z.enum([
  'impact',
  'behavior',
  'profile',
  'mba',
]);
export const CredentialStatusSchema = z.enum([
  'draft',
  'issued',
  'revoked',
  'expired',
  'pending_endorsement',
]);

export const IssuanceDraftSchema = z.object({
  entrepreneurId: z.string().uuid('ID de emprendedor inválido'),
  title: z.string().min(1, 'El título es requerido'),
  credentialType: CredentialTypeSchema,
  description: z.string().optional(),
  operatorNote: z.string().optional(),
});

export type IssuanceDraftInput = z.infer<typeof IssuanceDraftSchema>;

export const CredentialFiltersSchema = z.object({
  entrepreneurId: z.string().uuid().optional(),
  status: CredentialStatusSchema.optional(),
  credentialType: CredentialTypeSchema.optional(),
});

export type CredentialFilters = z.infer<typeof CredentialFiltersSchema>;
