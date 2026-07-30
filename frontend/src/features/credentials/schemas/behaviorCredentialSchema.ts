import { z } from 'zod';

export const activeCreditSchema = z.object({
  exists: z.boolean(),
  amount: z.number().min(0).optional(),
  currency: z.string().optional(),
  status: z.enum(['current', 'late', 'restructured', 'closed']).optional(),
});

export const behaviorCredentialFormSchema = z.object({
  creditSegmentStart: z.string().min(1, 'Start segment is required'),
  creditSegmentEnd: z.string().min(1, 'End segment is required'),
  activeCredit: activeCreditSchema.nullable().optional(),
  averageSales: z.number().min(0, 'Must be greater than or equal to 0'),
  costsAndExpenses: z.number().min(0, 'Must be greater than or equal to 0'),
  assets: z.number().min(0, 'Must be greater than or equal to 0'),
  liabilities: z.number().min(0, 'Must be greater than or equal to 0'),
  monthlyIncomeStability: z.enum(['high', 'medium', 'low', 'volatile']),
  registryValidation: z.enum([
    'validated',
    'partially_validated',
    'not_validated',
  ]),
  newJobs: z.number().int().min(0, 'Must be greater than or equal to 0'),
  commercialStability: z.enum(['stable', 'seasonal', 'volatile']),
  financialTrend: z.enum(['improving', 'stable', 'deteriorating']),
});

export type BehaviorCredentialFormInput = z.infer<
  typeof behaviorCredentialFormSchema
>;

export function computeBehaviorDerivedFields(
  data: BehaviorCredentialFormInput,
) {
  const estimatedOperatingMargin =
    data.averageSales > 0
      ? ((data.averageSales - data.costsAndExpenses) / data.averageSales) * 100
      : 0;

  const liabilitiesToAssetsRatio =
    data.assets > 0 ? data.liabilities / data.assets : 0;

  const estimatedOperationalCapacity: 'strong' | 'moderate' | 'weak' =
    estimatedOperatingMargin >= 30
      ? 'strong'
      : estimatedOperatingMargin >= 10
        ? 'moderate'
        : 'weak';

  const leverageLevel: 'low' | 'moderate' | 'high' =
    liabilitiesToAssetsRatio <= 0.3
      ? 'low'
      : liabilitiesToAssetsRatio <= 0.6
        ? 'moderate'
        : 'high';

  const paymentCapacitySignal: 'strong' | 'acceptable' | 'weak' | 'critical' =
    estimatedOperationalCapacity === 'strong' && leverageLevel === 'low'
      ? 'strong'
      : estimatedOperationalCapacity === 'weak' || leverageLevel === 'high'
        ? data.financialTrend === 'deteriorating'
          ? 'critical'
          : 'weak'
        : 'acceptable';

  return {
    estimatedOperatingMargin: Math.round(estimatedOperatingMargin * 100) / 100,
    liabilitiesToAssetsRatio: Math.round(liabilitiesToAssetsRatio * 100) / 100,
    estimatedOperationalCapacity,
    leverageLevel,
    paymentCapacitySignal,
  };
}
