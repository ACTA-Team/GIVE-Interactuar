import type { SupabaseLikeClient } from '@/lib/supabase/types';
import type {
  ImpactCredentialData,
  BehaviorCredentialData,
  ProfileCredentialData,
} from '../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function yearsFromDate(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  return Math.floor(
    (now.getTime() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
  );
}

function coefficientOfVariation(values: number[]): number | null {
  if (values.length < 3) return null;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (mean === 0) return null;
  const variance =
    values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance) / Math.abs(mean);
}

// ─── Repository ──────────────────────────────────────────────────────────────

export function createImpactMeasurementRepository(client: SupabaseLikeClient) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = client as any;

  return {
    // ═════════════════════════════════════════════════════════════════════════
    // 1. IMPACT CREDENTIAL
    // ═════════════════════════════════════════════════════════════════════════
    async getImpactCredential(
      entrepreneurId: string,
      measurementYear?: number,
    ): Promise<ImpactCredentialData | null> {
      // Get entrepreneur basic info
      const { data: ent, error: entErr } = await db
        .from('entrepreneurs')
        .select('id, first_name, last_name, full_name, document_number')
        .eq('id', entrepreneurId)
        .single();
      if (entErr || !ent) return null;

      // Get measurement (latest year if not specified)
      let mq = db
        .from('im_measurements')
        .select('*, im_cohorts(name, program), im_consultants(full_name)')
        .eq('entrepreneur_id', entrepreneurId);
      if (measurementYear) {
        mq = mq.eq('measurement_year', measurementYear);
      }
      mq = mq.order('measurement_year', { ascending: false }).limit(1);
      const { data: measurements, error: mErr } = await mq;
      if (mErr || !measurements?.length) return null;
      const m = measurements[0];

      // Get business info
      const { data: biz } = await db
        .from('im_businesses')
        .select(
          'business_name, founded_date, im_economic_activities(name, im_economic_sectors(name))',
        )
        .eq('entrepreneur_id', entrepreneurId)
        .single();

      // Get monthly sales for current year
      const { data: sales } = await db
        .from('im_monthly_sales')
        .select('month, amount')
        .eq('measurement_id', m.id);
      const totalSalesCurrent =
        sales?.reduce(
          (sum: number, s: { amount: number }) => sum + (s.amount || 0),
          0,
        ) ?? null;

      // Get employment snapshots
      const { data: employment } = await db
        .from('im_employment_snapshots')
        .select('*')
        .eq('measurement_id', m.id);
      const empPrev = employment?.find(
        (e: { period: string }) => e.period === 'prev_year',
      );
      const empCurr = employment?.find(
        (e: { period: string }) => e.period === 'current_year',
      );

      const currentFT = empCurr?.full_time_total ?? null;
      const prevFT = empPrev?.full_time_total ?? null;
      const newJobs =
        currentFT != null && prevFT != null ? currentFT - prevFT : null;

      const currentSS = empCurr?.social_security_total ?? null;
      const prevSS = empPrev?.social_security_total ?? null;
      const newFormalized =
        currentSS != null && prevSS != null ? currentSS - prevSS : null;

      const totalPrev = m.total_sales_prev_year;
      const variationPct =
        totalPrev && totalSalesCurrent
          ? ((totalSalesCurrent - totalPrev) / totalPrev) * 100
          : null;

      // Determine verdict
      let verdict: ImpactCredentialData['verdict'] = 'insufficient_data';
      if (variationPct !== null) {
        if (variationPct > 5) verdict = 'growing';
        else if (variationPct >= -5) verdict = 'sustaining';
        else verdict = 'deteriorating';
      }

      const sectorName =
        biz?.im_economic_activities?.im_economic_sectors?.name ?? null;

      return {
        entrepreneurId,
        fullName: ent.full_name,
        documentNumber: ent.document_number,
        businessName: biz?.business_name ?? null,
        economicSector: sectorName,
        yearsInOperation: yearsFromDate(biz?.founded_date),
        totalSalesPrevYear: totalPrev,
        totalSalesCurrentYear: totalSalesCurrent,
        salesVariationPct:
          variationPct !== null ? Math.round(variationPct * 100) / 100 : null,
        currentFullTimeEmployees: currentFT,
        newJobsGenerated: newJobs,
        newJobsFormalized: newFormalized,
        verdict,
      };
    },

    async getAllImpactCredentials(
      measurementYear?: number,
    ): Promise<ImpactCredentialData[]> {
      let mq = db
        .from('im_measurements')
        .select('entrepreneur_id')
        .order('entrepreneur_id');
      if (measurementYear) mq = mq.eq('measurement_year', measurementYear);
      const { data: rows } = await mq;
      if (!rows?.length) return [];

      const uniqueIds = [
        ...new Set(
          rows.map((r: { entrepreneur_id: string }) => r.entrepreneur_id),
        ),
      ] as string[];

      const results = await Promise.all(
        uniqueIds.map((id) => this.getImpactCredential(id, measurementYear)),
      );
      return results.filter((r): r is ImpactCredentialData => r !== null);
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 2. BEHAVIOR CREDENTIAL
    // ═════════════════════════════════════════════════════════════════════════
    async getBehaviorCredential(
      entrepreneurId: string,
      measurementYear?: number,
    ): Promise<BehaviorCredentialData | null> {
      const { data: ent, error: entErr } = await db
        .from('entrepreneurs')
        .select('id, full_name, document_number')
        .eq('id', entrepreneurId)
        .single();
      if (entErr || !ent) return null;

      let mq = db
        .from('im_measurements')
        .select('*')
        .eq('entrepreneur_id', entrepreneurId);
      if (measurementYear) mq = mq.eq('measurement_year', measurementYear);
      mq = mq.order('measurement_year', { ascending: false }).limit(1);
      const { data: measurements, error: mErr } = await mq;
      if (mErr || !measurements?.length) return null;
      const m = measurements[0];

      // Monthly sales & costs
      const { data: sales } = await db
        .from('im_monthly_sales')
        .select('month, amount')
        .eq('measurement_id', m.id)
        .order('month');
      const { data: costs } = await db
        .from('im_monthly_costs')
        .select('month, amount')
        .eq('measurement_id', m.id)
        .order('month');

      const salesAmounts: number[] =
        sales
          ?.filter((s: { amount: number | null }) => s.amount != null)
          .map((s: { amount: number }) => s.amount) ?? [];
      const costsAmounts: number[] =
        costs
          ?.filter((c: { amount: number | null }) => c.amount != null)
          .map((c: { amount: number }) => c.amount) ?? [];

      const totalSales = salesAmounts.reduce((a, b) => a + b, 0);
      const totalCosts = costsAmounts.reduce((a, b) => a + b, 0);
      const avgSales = salesAmounts.length
        ? totalSales / salesAmounts.length
        : null;
      const avgCosts = costsAmounts.length
        ? totalCosts / costsAmounts.length
        : null;

      // Quarterly balances (use latest quarter with data)
      const { data: balances } = await db
        .from('im_quarterly_balances')
        .select('quarter, assets, liabilities')
        .eq('measurement_id', m.id)
        .order('quarter', { ascending: false })
        .limit(1);

      const latestBalance = balances?.[0];
      const totalAssets = latestBalance?.assets ?? null;
      const totalLiabilities = latestBalance?.liabilities ?? null;

      // Derived indicators
      const operatingMargin =
        totalSales > 0 ? ((totalSales - totalCosts) / totalSales) * 100 : null;

      const leverageRatio =
        totalAssets && totalAssets > 0 && totalLiabilities != null
          ? totalLiabilities / totalAssets
          : null;

      const cv = coefficientOfVariation(salesAmounts);

      // Operating capacity (based on margin)
      let estimatedOperatingCapacity: BehaviorCredentialData['estimatedOperatingCapacity'] =
        'insufficient_data';
      if (operatingMargin !== null) {
        if (operatingMargin >= 20) estimatedOperatingCapacity = 'high';
        else if (operatingMargin >= 10) estimatedOperatingCapacity = 'medium';
        else estimatedOperatingCapacity = 'low';
      }

      // Leverage level
      let leverageLevel: BehaviorCredentialData['leverageLevel'] =
        'insufficient_data';
      if (leverageRatio !== null) {
        if (leverageRatio <= 0.4) leverageLevel = 'healthy';
        else if (leverageRatio <= 0.7) leverageLevel = 'moderate';
        else leverageLevel = 'high';
      }

      // Commercial stability (based on CV of monthly sales)
      let commercialStability: BehaviorCredentialData['commercialStability'] =
        'insufficient_data';
      if (cv !== null) {
        if (cv <= 0.15) commercialStability = 'stable';
        else if (cv <= 0.35) commercialStability = 'moderate';
        else commercialStability = 'volatile';
      }

      // Financial trend (compare avg sales vs avg costs + leverage direction)
      let financialTrend: BehaviorCredentialData['financialTrend'] =
        'insufficient_data';
      if (operatingMargin !== null && leverageRatio !== null) {
        if (operatingMargin >= 15 && leverageRatio <= 0.5)
          financialTrend = 'positive';
        else if (operatingMargin >= 5 && leverageRatio <= 0.8)
          financialTrend = 'neutral';
        else financialTrend = 'negative';
      } else if (operatingMargin !== null) {
        if (operatingMargin >= 15) financialTrend = 'positive';
        else if (operatingMargin >= 0) financialTrend = 'neutral';
        else financialTrend = 'negative';
      }

      return {
        entrepreneurId,
        fullName: ent.full_name,
        documentNumber: ent.document_number,
        creditSegmentStart: m.credit_segment_start,
        creditSegmentEnd: m.credit_segment_end,
        creditActive12m: m.credit_active_12m,
        avgMonthlySales: avgSales !== null ? Math.round(avgSales) : null,
        avgMonthlyCosts: avgCosts !== null ? Math.round(avgCosts) : null,
        totalAssets,
        totalLiabilities,
        estimatedOperatingMargin:
          operatingMargin !== null
            ? Math.round(operatingMargin * 100) / 100
            : null,
        leverageRatio:
          leverageRatio !== null
            ? Math.round(leverageRatio * 10000) / 10000
            : null,
        monthlyIncomeStability:
          cv !== null ? Math.round((1 - cv) * 10000) / 10000 : null,
        recordValidity: m.record_validity,
        estimatedOperatingCapacity,
        leverageLevel,
        commercialStability,
        financialTrend,
      };
    },

    async getAllBehaviorCredentials(
      measurementYear?: number,
    ): Promise<BehaviorCredentialData[]> {
      let mq = db
        .from('im_measurements')
        .select('entrepreneur_id')
        .order('entrepreneur_id');
      if (measurementYear) mq = mq.eq('measurement_year', measurementYear);
      const { data: rows } = await mq;
      if (!rows?.length) return [];

      const uniqueIds = [
        ...new Set(
          rows.map((r: { entrepreneur_id: string }) => r.entrepreneur_id),
        ),
      ] as string[];

      const results = await Promise.all(
        uniqueIds.map((id) => this.getBehaviorCredential(id, measurementYear)),
      );
      return results.filter((r): r is BehaviorCredentialData => r !== null);
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 3. PROFILE & FORMALIZATION CREDENTIAL
    // ═════════════════════════════════════════════════════════════════════════
    async getProfileCredential(
      entrepreneurId: string,
    ): Promise<ProfileCredentialData | null> {
      const { data: ent, error: entErr } = await db
        .from('entrepreneurs')
        .select('id, full_name, document_type, document_number')
        .eq('id', entrepreneurId)
        .single();
      if (entErr || !ent) return null;

      // Demographics
      const { data: demo } = await db
        .from('im_entrepreneur_demographics')
        .select('*, im_education_levels(name), im_compensation_funds(name)')
        .eq('entrepreneur_id', entrepreneurId)
        .single();

      // Business
      const { data: biz } = await db
        .from('im_businesses')
        .select('*, im_legal_figures(name)')
        .eq('entrepreneur_id', entrepreneurId)
        .single();

      const hasInternet = demo?.internet_access
        ? !demo.internet_access.toLowerCase().includes('no tengo')
        : null;

      const contributesPension = demo?.contributes_pension
        ? demo.contributes_pension.toLowerCase().startsWith('si') ||
          demo.contributes_pension.toLowerCase().startsWith('sí') ||
          demo.contributes_pension.toLowerCase().includes('beps')
        : null;

      const businessFormalized =
        biz?.nit != null &&
        biz.nit !== '' &&
        biz?.im_legal_figures?.name !== 'Sin formalización (sin RUT)';

      return {
        entrepreneurId,
        fullName: ent.full_name,
        documentNumber: ent.document_number,
        documentType: ent.document_type,
        identityValidated:
          ent.document_number != null && ent.document_number !== '',
        educationLevel: demo?.im_education_levels?.name ?? null,
        municipality: demo?.home_municipality ?? null,
        residenceZone: demo?.home_zone ?? null,
        isPrimaryProvider: demo?.is_primary_provider ?? null,
        avgHouseholdIncome: demo?.avg_household_income ?? null,
        businessFormalized,
        nit: biz?.nit ?? null,
        yearsInOperation: yearsFromDate(biz?.founded_date),
        legalFigure: biz?.im_legal_figures?.name ?? null,
        businessSize: biz?.business_size ?? null,
        hasInternet,
        healthRegime: demo?.health_regime ?? null,
        contributesPension,
        compensationFund: demo?.im_compensation_funds?.name ?? null,
      };
    },
    async getAllProfileCredentials(): Promise<ProfileCredentialData[]> {
      const { data: rows } = await db
        .from('im_entrepreneur_demographics')
        .select('entrepreneur_id')
        .order('entrepreneur_id');
      if (!rows?.length) return [];

      const uniqueIds = rows.map(
        (r: { entrepreneur_id: string }) => r.entrepreneur_id,
      );

      const results = await Promise.all(
        uniqueIds.map((id: string) => this.getProfileCredential(id)),
      );
      return results.filter((r): r is ProfileCredentialData => r !== null);
    },
  };
}

export type ImpactMeasurementRepository = ReturnType<
  typeof createImpactMeasurementRepository
>;
