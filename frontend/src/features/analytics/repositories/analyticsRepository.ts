import type {
  DashboardData,
  DashboardSummary,
  DashboardByProgram,
  DashboardByGender,
  DashboardByAlly,
  DashboardByAge,
  DashboardMonthlySales,
  DashboardPortfolio,
  EntrepreneurRecord,
} from '../types';
import type { SupabaseLikeClient } from '@/@types/supabase';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

function ageFromBirthDate(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function ageRange(age: number | null): string | null {
  if (age === null) return null;
  if (age < 25) return '18-24';
  if (age < 35) return '25-34';
  if (age < 45) return '35-44';
  if (age < 55) return '45-54';
  return '55+';
}

const PROGRAM_LABEL: Record<string, string> = {
  mba_empresarial: 'Entrepreneurial MBA',
  mba_agroempresarial: 'Agribusiness MBA',
};

const CLASSIFICATION_LABELS: Record<string, string> = {
  A: 'Normal (A)',
  B: 'Acceptable (B)',
  E: 'Uncollectible (E)',
};

const MONTH_NAMES: Record<number, string> = {
  1: 'Jan',
  2: 'Feb',
  3: 'Mar',
  4: 'Apr',
  5: 'May',
  6: 'Jun',
  7: 'Jul',
  8: 'Aug',
  9: 'Sep',
  10: 'Oct',
  11: 'Nov',
  12: 'Dec',
};

export function createAnalyticsRepository(client: SupabaseLikeClient) {
  const db = client as AnyClient;

  return {
    async getDashboard(): Promise<DashboardData> {
      // Fetch measurements with joins
      const { data: measurements, error: mErr } = await db
        .from('im_measurements')
        .select(
          '*, im_cohorts(name, cohort_year, program, im_allies(name), im_levels(name)), im_consultants(full_name)',
        );
      if (mErr) throw mErr;

      // Fetch demographics
      const { data: demographics, error: dErr } = await db
        .from('im_entrepreneur_demographics')
        .select('*, im_education_levels(name)');
      if (dErr) throw dErr;

      // Fetch monthly sales
      const { data: monthlySales, error: sErr } = await db
        .from('im_monthly_sales')
        .select('measurement_id, month, amount');
      if (sErr) throw sErr;

      // Fetch employment snapshots
      const { data: employment, error: eErr } = await db
        .from('im_employment_snapshots')
        .select('*');
      if (eErr) throw eErr;

      // Fetch overdue credits
      const { data: overdue, error: oErr } = await db
        .from('im_overdue_credits')
        .select('*');
      if (oErr) throw oErr;

      // Build demographics map
      const demoMap = new Map<string, Record<string, unknown>>();
      for (const d of demographics ?? []) {
        demoMap.set(d.entrepreneur_id, d);
      }

      // Build employment map by measurement
      const empMap = new Map<string, Record<string, unknown>[]>();
      for (const e of employment ?? []) {
        const arr = empMap.get(e.measurement_id) ?? [];
        arr.push(e);
        empMap.set(e.measurement_id, arr);
      }

      // Build sales map by measurement
      const salesMap = new Map<string, Record<string, unknown>[]>();
      for (const s of monthlySales ?? []) {
        const arr = salesMap.get(s.measurement_id) ?? [];
        arr.push(s);
        salesMap.set(s.measurement_id, arr);
      }

      // Aggregate
      const mList = measurements ?? [];
      const total = mList.length;
      const activeCount = mList.filter(
        (m: Record<string, unknown>) => m.enrollment_status === 'activo',
      ).length;

      let women = 0;
      let men = 0;
      let totalSalesN1 = 0;
      let totalSalesN = 0;
      let salesCount = 0;
      let totalEmplN1 = 0;
      let totalEmplN = 0;
      let totalNewJobs = 0;
      let totalFormalized = 0;

      const programStats = new Map<
        string,
        {
          count: number;
          salesN1: number;
          salesN: number;
          salesCnt: number;
          newJobs: number;
        }
      >();
      const genderStats = new Map<
        string,
        { count: number; salesN1: number; salesN: number; salesCnt: number }
      >();
      const allyStats = new Map<string, { count: number; newJobs: number }>();
      const ageStats = new Map<string, number>();
      const monthlySalesAgg = new Map<
        number,
        { total: number; count: number }
      >();

      for (const m of mList) {
        const demo = demoMap.get(m.entrepreneur_id);
        const gender = (demo?.gender as string) ?? 'unknown';
        if (gender === 'mujer') women++;
        else if (gender === 'hombre') men++;

        const cohort = m.im_cohorts as Record<string, unknown> | null;
        const program = cohort?.program as string;
        const programLabel = PROGRAM_LABEL[program] ?? program;
        const ally = (cohort?.im_allies as Record<string, unknown>)
          ?.name as string;

        // Sales for this measurement
        const mSales = salesMap.get(m.id) ?? [];
        const totalSalesForM = mSales.reduce(
          (sum: number, s: Record<string, unknown>) =>
            sum + (Number(s.amount) || 0),
          0,
        );
        const prevYearSales = Number(m.total_sales_prev_year) || 0;

        if (totalSalesForM > 0 || prevYearSales > 0) {
          totalSalesN1 += prevYearSales;
          totalSalesN += totalSalesForM;
          salesCount++;
        }

        // Employment
        const emps = empMap.get(m.id) ?? [];
        let prevFT = 0;
        let currFT = 0;
        let currFormalized = 0;
        for (const e of emps) {
          if ((e.period as string) === 'prev_year') {
            prevFT +=
              (Number(e.full_time_men) || 0) + (Number(e.full_time_women) || 0);
          } else {
            currFT +=
              (Number(e.full_time_men) || 0) + (Number(e.full_time_women) || 0);
            currFormalized +=
              (Number(e.formalized_men) || 0) +
              (Number(e.formalized_women) || 0);
          }
        }
        totalEmplN1 += prevFT;
        totalEmplN += currFT;
        const newJobs = Math.max(0, currFT - prevFT);
        totalNewJobs += newJobs;
        totalFormalized += currFormalized;

        // Program stats
        const ps = programStats.get(programLabel) ?? {
          count: 0,
          salesN1: 0,
          salesN: 0,
          salesCnt: 0,
          newJobs: 0,
        };
        ps.count++;
        ps.salesN1 += prevYearSales;
        ps.salesN += totalSalesForM;
        if (totalSalesForM > 0 || prevYearSales > 0) ps.salesCnt++;
        ps.newJobs += newJobs;
        programStats.set(programLabel, ps);

        // Gender stats
        const gs = genderStats.get(gender) ?? {
          count: 0,
          salesN1: 0,
          salesN: 0,
          salesCnt: 0,
        };
        gs.count++;
        gs.salesN1 += prevYearSales;
        gs.salesN += totalSalesForM;
        if (totalSalesForM > 0 || prevYearSales > 0) gs.salesCnt++;
        genderStats.set(gender, gs);

        // Ally stats
        const as_ = allyStats.get(ally) ?? { count: 0, newJobs: 0 };
        as_.count++;
        as_.newJobs += newJobs;
        allyStats.set(ally, as_);

        // Age stats
        const age = ageFromBirthDate(demo?.birth_date as string | null);
        const range = ageRange(age);
        if (range) ageStats.set(range, (ageStats.get(range) ?? 0) + 1);

        // Monthly sales aggregation
        for (const s of mSales) {
          const month = s.month as number;
          const agg = monthlySalesAgg.get(month) ?? { total: 0, count: 0 };
          agg.total += Number(s.amount) || 0;
          agg.count++;
          monthlySalesAgg.set(month, agg);
        }
      }

      const avgSalesN1 = salesCount > 0 ? totalSalesN1 / salesCount : 0;
      const avgSalesN = salesCount > 0 ? totalSalesN / salesCount : 0;
      const variation =
        avgSalesN1 > 0 ? ((avgSalesN - avgSalesN1) / avgSalesN1) * 100 : 0;

      const summary: DashboardSummary = {
        total_participants: total,
        active_count: activeCount,
        retention_rate_pct:
          total > 0 ? Math.round((activeCount / total) * 10000) / 100 : 0,
        women,
        men,
        women_percentage:
          total > 0 ? Math.round((women / total) * 10000) / 100 : 0,
        previous_year_sales_total_cop: totalSalesN1,
        current_year_sales_total_cop: totalSalesN,
        average_previous_year_sales_cop: Math.round(avgSalesN1),
        average_current_year_sales_cop: Math.round(avgSalesN),
        average_variation_pct: Math.round(variation * 100) / 100,
        full_time_jobs_previous_year: totalEmplN1,
        full_time_jobs_current_year: totalEmplN,
        new_jobs: totalNewJobs,
        formalized_jobs: totalFormalized,
      };

      const by_program: DashboardByProgram[] = [];
      for (const [programName, ps] of programStats) {
        const avgN1 = ps.salesCnt > 0 ? ps.salesN1 / ps.salesCnt : 0;
        const avgN = ps.salesCnt > 0 ? ps.salesN / ps.salesCnt : 0;
        const pctVar = avgN1 > 0 ? ((avgN - avgN1) / avgN1) * 100 : 0;
        by_program.push({
          program: programName,
          participants: ps.count,
          average_previous_year_sales_cop: Math.round(avgN1),
          average_current_year_sales_cop: Math.round(avgN),
          average_variation_pct: Math.round(pctVar * 100) / 100,
          new_jobs: ps.newJobs,
        });
      }

      const by_gender: DashboardByGender[] = [];
      for (const [genderKey, gs] of genderStats) {
        const avgN1 = gs.salesCnt > 0 ? gs.salesN1 / gs.salesCnt : 0;
        const avgN = gs.salesCnt > 0 ? gs.salesN / gs.salesCnt : 0;
        const pctVar = avgN1 > 0 ? ((avgN - avgN1) / avgN1) * 100 : 0;
        by_gender.push({
          gender:
            genderKey === 'mujer'
              ? 'Woman'
              : genderKey === 'hombre'
                ? 'Man'
                : genderKey,
          participants: gs.count,
          average_previous_year_sales_cop: Math.round(avgN1),
          average_current_year_sales_cop: Math.round(avgN),
          average_variation_pct: Math.round(pctVar * 100) / 100,
        });
      }

      const by_ally: DashboardByAlly[] = [];
      for (const [allyName, as_] of allyStats) {
        by_ally.push({
          ally: allyName,
          participants: as_.count,
          new_jobs: as_.newJobs,
        });
      }
      by_ally.sort((a, b) => b.participants - a.participants);

      const by_age: DashboardByAge[] = [];
      for (const range of ['18-24', '25-34', '35-44', '45-54', '55+']) {
        const count = ageStats.get(range) ?? 0;
        if (count > 0) by_age.push({ range, participants: count });
      }

      const monthly_sales: DashboardMonthlySales[] = [];
      for (let m = 1; m <= 12; m++) {
        const agg = monthlySalesAgg.get(m);
        if (agg && agg.count > 0) {
          monthly_sales.push({
            month: MONTH_NAMES[m] ?? String(m),
            average_cop: Math.round(agg.total / agg.count),
            n: agg.count,
          });
        }
      }

      // Portfolio
      const overdueList = overdue ?? [];
      const entrepreneursWithCredit = new Set(
        mList
          .filter(
            (m: Record<string, unknown>) =>
              m.credit_active_12m === true ||
              m.credit_segment_start !== null ||
              m.credit_segment_end !== null,
          )
          .map((m: Record<string, unknown>) => m.entrepreneur_id),
      );
      const entrepreneursInDefaultSet = new Set(
        overdueList.map((o: Record<string, unknown>) => o.entrepreneur_id),
      );
      const totalWithCredit =
        entrepreneursWithCredit.size > 0
          ? entrepreneursWithCredit.size
          : entrepreneursInDefaultSet.size;
      const entrepreneursInDefault = entrepreneursInDefaultSet.size;
      const currentCount = Math.max(0, totalWithCredit - entrepreneursInDefault);
      let totalOverdueBalance = 0;
      const clasMap = new Map<string, { cases: number; balance: number }>();
      for (const o of overdueList) {
        const balance = Number(o.overdue_balance) || 0;
        totalOverdueBalance += balance;
        const clas = (o.classification as string) ?? 'A';
        const c = clasMap.get(clas) ?? { cases: 0, balance: 0 };
        c.cases++;
        c.balance += balance;
        clasMap.set(clas, c);
      }

      const portfolio: DashboardPortfolio = {
        total_with_credit: totalWithCredit,
        current: currentCount,
        in_default: entrepreneursInDefault,
        default_rate_pct:
          totalWithCredit > 0
            ? Math.round((entrepreneursInDefault / totalWithCredit) * 10000) /
              100
            : 0,
        total_overdue_balance_cop: totalOverdueBalance,
        by_classification: Array.from(clasMap.entries()).map(
          ([classification, c]) => ({
            classification,
            label: CLASSIFICATION_LABELS[classification] ?? classification,
            cases: c.cases,
            overdue_balance_cop: c.balance,
          }),
        ),
      };

      return {
        metadata: {
          program: 'MicroMBA GIVE Colombia',
          period: 'Impact Measurement',
          note: 'Aggregated data from im_measurements and related tables',
          source: 'Impact Measurement MicroMBA',
        },
        summary,
        by_program,
        by_gender,
        by_ally,
        by_age,
        monthly_sales,
        portfolio,
      };
    },

    async getEntrepreneurs(filters?: {
      program?: string;
      gender?: string;
      requestedCredit?: string;
      overdue?: string;
    }): Promise<EntrepreneurRecord[]> {
      // Fetch measurements with joins
      const { data: measurements, error: mErr } = await db
        .from('im_measurements')
        .select(
          '*, entrepreneurs(full_name, document_number, municipality), im_cohorts(name, cohort_year, program, im_allies(name), im_levels(name))',
        );
      if (mErr) throw mErr;

      const { data: demographics, error: dErr } = await db
        .from('im_entrepreneur_demographics')
        .select('*, im_education_levels(name)');
      if (dErr) throw dErr;

      const { data: businesses, error: bErr } = await db
        .from('im_businesses')
        .select(
          '*, im_legal_figures(name), im_economic_activities(im_economic_sectors(name))',
        );
      if (bErr) throw bErr;

      const { data: monthlySalesData, error: sErr } = await db
        .from('im_monthly_sales')
        .select('measurement_id, amount');
      if (sErr) throw sErr;

      const { data: empData, error: eErr } = await db
        .from('im_employment_snapshots')
        .select('*');
      if (eErr) throw eErr;

      const { data: overdueData, error: oErr } = await db
        .from('im_overdue_credits')
        .select('entrepreneur_id');
      if (oErr) throw oErr;

      const { data: costsData, error: cErr } = await db
        .from('im_monthly_costs')
        .select('measurement_id, amount');
      if (cErr) throw cErr;

      const { data: balancesData, error: blErr } = await db
        .from('im_quarterly_balances')
        .select('measurement_id, quarter, assets, liabilities');
      if (blErr) throw blErr;

      const { data: bizProfiles, error: bpErr } = await db
        .from('entrepreneur_business_profiles')
        .select('entrepreneur_id, formalized, employee_count');
      if (bpErr) throw bpErr;

      const demoMap = new Map<string, Record<string, unknown>>();
      for (const d of demographics ?? []) demoMap.set(d.entrepreneur_id, d);

      const bizMap = new Map<string, Record<string, unknown>>();
      for (const b of businesses ?? []) bizMap.set(b.entrepreneur_id, b);

      const salesByM = new Map<string, number>();
      for (const s of monthlySalesData ?? []) {
        salesByM.set(
          s.measurement_id,
          (salesByM.get(s.measurement_id) ?? 0) + (Number(s.amount) || 0),
        );
      }

      const empByM = new Map<string, Record<string, unknown>[]>();
      for (const e of empData ?? []) {
        const arr = empByM.get(e.measurement_id) ?? [];
        arr.push(e);
        empByM.set(e.measurement_id, arr);
      }

      const overdueSet = new Set(
        (overdueData ?? []).map(
          (o: Record<string, unknown>) => o.entrepreneur_id,
        ),
      );

      const costsByM = new Map<string, number>();
      for (const c of costsData ?? []) {
        costsByM.set(
          c.measurement_id,
          (costsByM.get(c.measurement_id) ?? 0) + (Number(c.amount) || 0),
        );
      }

      const balancesByM = new Map<
        string,
        { assets: number; liabilities: number }
      >();
      for (const b of balancesData ?? []) {
        const existing = balancesByM.get(b.measurement_id);
        const bQuarter = Number(b.quarter) || 0;
        const existingQuarter = existing ? 4 : 0;
        if (bQuarter >= existingQuarter) {
          balancesByM.set(b.measurement_id, {
            assets: Number(b.assets) || 0,
            liabilities: Number(b.liabilities) || 0,
          });
        }
      }

      const bizProfileMap = new Map<
        string,
        { formalized: boolean | null; employeeCount: number | null }
      >();
      for (const bp of bizProfiles ?? []) {
        bizProfileMap.set(bp.entrepreneur_id, {
          formalized: (bp.formalized as boolean | null) ?? null,
          employeeCount: (Number(bp.employee_count) || null) as number | null,
        });
      }

      const records: EntrepreneurRecord[] = [];

      for (const m of measurements ?? []) {
        const ent = m.entrepreneurs as Record<string, unknown> | null;
        const cohort = m.im_cohorts as Record<string, unknown> | null;
        const program = cohort?.program as string;
        const programLabel = PROGRAM_LABEL[program] ?? program;
        const ally = (cohort?.im_allies as Record<string, unknown>)
          ?.name as string;
        const level = (cohort?.im_levels as Record<string, unknown>)?.name as
          | string
          | null;
        const demo = demoMap.get(m.entrepreneur_id);
        const biz = bizMap.get(m.entrepreneur_id);
        const gender = (demo?.gender as string) ?? null;
        const genderLabel =
          gender === 'mujer' ? 'Woman' : gender === 'hombre' ? 'Man' : null;

        // Sales
        const salesN = salesByM.get(m.id) ?? null;
        const salesN1 = Number(m.total_sales_prev_year) || null;
        let salesVariation: number | null = null;
        if (salesN1 && salesN !== null) {
          salesVariation =
            Math.round(((salesN - salesN1) / salesN1) * 10000) / 100;
        }

        // Employment
        const emps = empByM.get(m.id) ?? [];
        let prevFT = 0;
        let currFT = 0;
        for (const e of emps) {
          if ((e.period as string) === 'prev_year') {
            prevFT +=
              (Number(e.full_time_men) || 0) + (Number(e.full_time_women) || 0);
          } else {
            currFT +=
              (Number(e.full_time_men) || 0) + (Number(e.full_time_women) || 0);
          }
        }
        const newJobs = currFT - prevFT;

        const age = ageFromBirthDate(demo?.birth_date as string | null);
        const creditActive = m.credit_active_12m as boolean | null;
        const isOverdue = overdueSet.has(m.entrepreneur_id);

        const sector = (
          (biz?.im_economic_activities as Record<string, unknown>)
            ?.im_economic_sectors as Record<string, unknown>
        )?.name as string | null;
        const legalFig = (biz?.im_legal_figures as Record<string, unknown>)
          ?.name as string | null;

        // Apply filters
        if (filters?.program && programLabel !== filters.program) continue;
        if (filters?.gender && genderLabel !== filters.gender) continue;
        if (filters?.requestedCredit) {
          const wantsYes = filters.requestedCredit === 'Yes';
          if (wantsYes && !creditActive) continue;
          if (!wantsYes && creditActive) continue;
        }
        if (filters?.overdue) {
          const wantsYes = filters.overdue === 'Yes';
          if (wantsYes && !isOverdue) continue;
          if (!wantsYes && isOverdue) continue;
        }

        const bizProfile = bizProfileMap.get(m.entrepreneur_id);
        const balance = balancesByM.get(m.id);
        const costs = costsByM.get(m.id);

        // Calculate years in operation from founded_date
        const foundedDate = biz?.founded_date
          ? new Date(biz.founded_date as string)
          : null;
        const yearsInOperation = foundedDate
          ? new Date().getFullYear() - foundedDate.getFullYear()
          : null;

        records.push({
          document_number: (ent?.document_number as string) ?? '',
          full_name: (ent?.full_name as string) ?? '',
          business_name: (biz?.business_name as string) ?? null,
          program: programLabel,
          ally: ally,
          enrollment_status: m.enrollment_status as string,
          gender: genderLabel,
          municipality: (ent?.municipality as string) ?? null,
          sector,
          sales_prev_year_cop: salesN1,
          sales_current_year_cop: salesN,
          sales_variation_pct: salesVariation,
          new_jobs: newJobs,
          level: level,
          cohort_name: (cohort?.name as string) ?? '',
          cohort_year: (cohort?.cohort_year as number) ?? 0,
          active_credit:
            creditActive === true
              ? 'Yes'
              : creditActive === false
                ? 'No'
                : null,
          education_level:
            ((demo?.im_education_levels as Record<string, unknown>)?.name as
              | string
              | null) ?? null,
          socioeconomic_stratum:
            (demo?.socioeconomic_stratum as number) ?? null,
          home_zone: (demo?.home_zone as string) ?? null,
          legal_figure: legalFig,
          business_size: (biz?.business_size as string) ?? null,
          age: age,
          age_range: ageRange(age),
          requested_credit: creditActive
            ? 'Yes'
            : creditActive === false
              ? 'No'
              : null,
          overdue: isOverdue ? 'Yes' : 'No',
          years_in_operation: yearsInOperation,
          total_costs_cop: costs ?? null,
          total_assets_cop: balance?.assets ?? null,
          total_liabilities_cop: balance?.liabilities ?? null,
          current_employees: bizProfile?.employeeCount ?? null,
          is_formalized: bizProfile?.formalized ?? null,
        });
      }

      return records;
    },
  };
}

export type AnalyticsRepository = ReturnType<typeof createAnalyticsRepository>;
