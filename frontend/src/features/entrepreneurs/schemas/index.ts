import { z } from 'zod';

export const EntrepreneurSearchSchema = z.object({
  query: z.string().optional(),
  municipality: z.string().optional(),
  department: z.string().optional(),
  active: z.boolean().optional(),
});

export type EntrepreneurSearchInput = z.infer<typeof EntrepreneurSearchSchema>;

export const CreateEntrepreneurSchema = z.object({
  firstName: z.string().min(1, 'Requerido'),
  lastName: z.string().min(1, 'Requerido'),
  documentType: z.string().min(1, 'Requerido'),
  documentNumber: z.string().min(1, 'Requerido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  municipality: z.string().optional(),
  department: z.string().optional(),
  country: z.string().default('Colombia'),
});

export type CreateEntrepreneurInput = z.infer<typeof CreateEntrepreneurSchema>;
