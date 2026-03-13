import { z } from 'zod';

export const mbaCredentialFormSchema = z.object({
  holderName: z.string().min(1, 'El nombre es requerido'),
  company: z.string().nullable().optional(),

  programName: z.string().min(1, 'El programa es requerido'),
  cohortYear: z.number().int().min(2000).max(2100),
  cohortLabel: z.string().min(1, 'La cohorte es requerida'),

  partnerName: z.string().min(1, 'El aliado es requerido'),
  programLevel: z.string().min(1, 'El nivel es requerido'),
  programGroup: z.string().min(1, 'El grupo es requerido'),

  programDisplayTitle: z.string().min(1),
  programDisplaySubtitle: z.string().min(1),

  datasetProgram: z.string().nullable().optional(),
  datasetPartner: z.string().nullable().optional(),
  datasetStatus: z.string().nullable().optional(),
  datasetMunicipality: z.string().nullable().optional(),
  datasetSector: z.string().nullable().optional(),
  datasetSalesPrevYearCop: z.number().nullable().optional(),
  datasetSalesCop: z.number().nullable().optional(),
  datasetGrowthPct: z.number().nullable().optional(),
  datasetNewJobs: z.number().int().nullable().optional(),
});

export type MbaCredentialFormInput = z.infer<typeof mbaCredentialFormSchema>;

