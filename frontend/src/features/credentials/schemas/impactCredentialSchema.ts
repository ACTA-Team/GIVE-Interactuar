import { z } from 'zod';

export const assessmentPeriodSchema = z.object({
  startDate: z.string().min(1, 'Fecha de inicio es requerida'),
  endDate: z.string().min(1, 'Fecha de fin es requerida'),
});

export const impactCredentialFormSchema = z.object({
  companyName: z.string().min(1, 'Nombre de empresa es requerido'),
  sector: z.string().min(1, 'Sector es requerido'),
  yearsInOperation: z.number().min(0, 'Debe ser mayor o igual a 0'),
  salesPreviousYear: z.number().min(0, 'Debe ser mayor o igual a 0'),
  salesCurrentYear: z.number().min(0, 'Debe ser mayor o igual a 0'),
  currentEmployees: z.number().int().min(0, 'Debe ser mayor o igual a 0'),
  newJobsCreated: z.number().int().min(0, 'Debe ser mayor o igual a 0'),
  newFormalJobsCreated: z.number().int().min(0, 'Debe ser mayor o igual a 0'),
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
