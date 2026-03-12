import { z } from 'zod';

export const socialSecurityCoverageSchema = z.object({
  hasSocialSecurity: z.boolean(),
  hasPension: z.boolean(),
  notes: z.string().optional(),
});

export const employmentFormalizationSchema = z.object({
  formalizedJobsCount: z.number().int().min(0, 'Debe ser mayor o igual a 0'),
  informalJobsCount: z.number().int().min(0).optional(),
});

export const profileCredentialFormSchema = z.object({
  identityValidated: z.boolean(),
  educationLevel: z.enum([
    'none',
    'primary',
    'secondary',
    'technical',
    'undergraduate',
    'postgraduate',
    'other',
  ]),
  municipality: z.string().min(1, 'Municipality is required'),
  zone: z.enum(['urban', 'rural', 'periurban', 'other']),
  mainHouseholdProvider: z.boolean(),
  householdIncome: z.number().min(0, 'Must be greater than or equal to 0'),
  formalizedBusiness: z.boolean(),
  nit: z.string().nullable().optional(),
  yearsInOperation: z.number().min(0, 'Must be greater than or equal to 0'),
  legalForm: z.string().nullable().optional(),
  companySize: z.enum(['micro', 'small', 'medium', 'large', 'unknown']),
  internetAccess: z.boolean(),
  socialSecurityCoverage: socialSecurityCoverageSchema.optional(),
  employmentFormalization: employmentFormalizationSchema,
  traceabilityLevel: z.enum(['high', 'medium', 'low']),
  formalizationLevel: z.enum(['high', 'medium', 'low', 'none']),
  applicantStabilitySignal: z.enum(['strong', 'moderate', 'weak']),
});

export type ProfileCredentialFormInput = z.infer<
  typeof profileCredentialFormSchema
>;
