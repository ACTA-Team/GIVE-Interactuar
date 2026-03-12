import { z } from 'zod';

export const assessmentPeriodSchema = z.object({
  startDate: z.string().min(1, 'Fecha de inicio es requerida'),
  endDate: z.string().min(1, 'Fecha de fin es requerida'),
});

export const impactCredentialFormSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  sector: z.string().min(1, 'Sector is required'),
  yearsInOperation: z.number().min(0, 'Must be greater than or equal to 0'),
  salesPreviousYear: z.number().min(0, 'Must be greater than or equal to 0'),
  salesCurrentYear: z.number().min(0, 'Must be greater than or equal to 0'),
  currentEmployees: z
    .number()
    .int()
    .min(0, 'Must be greater than or equal to 0'),
  newJobsCreated: z.number().int().min(0, 'Must be greater than or equal to 0'),
  newFormalJobsCreated: z
    .number()
    .int()
    .min(0, 'Must be greater than or equal to 0'),
  businessTrend: z.enum(['growing', 'stable', 'deteriorating']),
  assessmentPeriod: assessmentPeriodSchema.optional(),
});

export type ImpactCredentialFormInput = z.infer<
  typeof impactCredentialFormSchema
>;

export function computeImpactDerivedFields(data: ImpactCredentialFormInput) {
  const salesVariationPercent =
    data.salesPreviousYear > 0
      ? ((data.salesCurrentYear - data.salesPreviousYear) /
          data.salesPreviousYear) *
        100
      : 0;

  return {
    salesVariationPercent: Math.round(salesVariationPercent * 100) / 100,
  };
}
