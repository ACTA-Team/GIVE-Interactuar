import type {
  CredentialType,
  VCCredentialType,
} from '@/features/credentials/types';
import { CREDENTIAL_TYPE_TO_VC } from '@/features/credentials/types';
import type { ImpactCredentialFormInput } from '@/features/credentials/schemas/impactCredentialSchema';
import { computeImpactDerivedFields } from '@/features/credentials/schemas/impactCredentialSchema';
import type { BehaviorCredentialFormInput } from '@/features/credentials/schemas/behaviorCredentialSchema';
import { computeBehaviorDerivedFields } from '@/features/credentials/schemas/behaviorCredentialSchema';
import type { ProfileCredentialFormInput } from '@/features/credentials/schemas/profileCredentialSchema';

type FormData =
  | ImpactCredentialFormInput
  | BehaviorCredentialFormInput
  | ProfileCredentialFormInput;

interface VCPayload {
  '@context': string[];
  type: ['VerifiableCredential', VCCredentialType];
  issuer: string;
  validFrom: string;
  credentialSubject: Record<string, unknown>;
}

interface BuildVCOptions {
  credentialType: CredentialType;
  formData: FormData;
  entrepreneurId: string;
  entrepreneurName: string;
  businessName: string;
  issuerDid: string;
}

function buildImpactSubject(
  data: ImpactCredentialFormInput,
  entrepreneurId: string,
): Record<string, unknown> {
  const derived = computeImpactDerivedFields(data);
  return {
    id: `urn:give:entrepreneur:${entrepreneurId}`,
    companyName: data.companyName,
    sector: data.sector,
    yearsInOperation: data.yearsInOperation,
    salesPreviousYear: data.salesPreviousYear,
    salesCurrentYear: data.salesCurrentYear,
    salesVariationPercent: derived.salesVariationPercent,
    currentEmployees: data.currentEmployees,
    newJobsCreated: data.newJobsCreated,
    newFormalJobsCreated: data.newFormalJobsCreated,
    businessTrend: data.businessTrend,
    ...(data.assessmentPeriod && {
      assessmentPeriod: data.assessmentPeriod,
    }),
  };
}

function buildBehaviorSubject(
  data: BehaviorCredentialFormInput,
  entrepreneurId: string,
): Record<string, unknown> {
  const derived = computeBehaviorDerivedFields(data);
  return {
    id: `urn:give:entrepreneur:${entrepreneurId}`,
    creditSegmentStart: data.creditSegmentStart,
    creditSegmentEnd: data.creditSegmentEnd,
    activeCredit: data.activeCredit ?? null,
    averageSales: data.averageSales,
    costsAndExpenses: data.costsAndExpenses,
    assets: data.assets,
    liabilities: data.liabilities,
    estimatedOperatingMargin: derived.estimatedOperatingMargin,
    liabilitiesToAssetsRatio: derived.liabilitiesToAssetsRatio,
    monthlyIncomeStability: data.monthlyIncomeStability,
    registryValidation: data.registryValidation,
    newJobs: data.newJobs,
    estimatedOperationalCapacity: derived.estimatedOperationalCapacity,
    leverageLevel: derived.leverageLevel,
    commercialStability: data.commercialStability,
    financialTrend: data.financialTrend,
    paymentCapacitySignal: derived.paymentCapacitySignal,
  };
}

function buildProfileSubject(
  data: ProfileCredentialFormInput,
  entrepreneurId: string,
): Record<string, unknown> {
  return {
    id: `urn:give:entrepreneur:${entrepreneurId}`,
    identityValidated: data.identityValidated,
    educationLevel: data.educationLevel,
    municipality: data.municipality,
    zone: data.zone,
    mainHouseholdProvider: data.mainHouseholdProvider,
    householdIncome: data.householdIncome,
    formalizedBusiness: data.formalizedBusiness,
    ...(data.nit && { nit: data.nit }),
    yearsInOperation: data.yearsInOperation,
    ...(data.legalForm && { legalForm: data.legalForm }),
    companySize: data.companySize,
    internetAccess: data.internetAccess,
    ...(data.socialSecurityCoverage && {
      socialSecurityCoverage: data.socialSecurityCoverage,
    }),
    employmentFormalization: data.employmentFormalization,
    traceabilityLevel: data.traceabilityLevel,
    formalizationLevel: data.formalizationLevel,
    applicantStabilitySignal: data.applicantStabilitySignal,
  };
}

export function buildVCPayload(options: BuildVCOptions): VCPayload {
  const { credentialType, formData, entrepreneurId, issuerDid } = options;

  const vcType = CREDENTIAL_TYPE_TO_VC[credentialType];

  const subjectBuilders: Record<
    CredentialType,
    (data: never, eId: string) => Record<string, unknown>
  > = {
    impact: buildImpactSubject as never,
    behavior: buildBehaviorSubject as never,
    profile: buildProfileSubject as never,
  };

  const credentialSubject = subjectBuilders[credentialType](
    formData as never,
    entrepreneurId,
  );

  return {
    '@context': [
      'https://www.w3.org/ns/credentials/v2',
      'https://www.w3.org/ns/credentials/examples/v2',
    ],
    type: ['VerifiableCredential', vcType],
    issuer: issuerDid,
    validFrom: new Date().toISOString(),
    credentialSubject,
  };
}

export function generateVcId(
  credentialType: CredentialType,
  entrepreneurId: string,
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `vc:give:${credentialType}:${entrepreneurId}:${timestamp}-${random}`;
}
