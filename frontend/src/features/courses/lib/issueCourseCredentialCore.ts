import type { ActaClient, Signer, useCredential } from '@acta-team/credentials';
import { buildVCPayload, generateVcId } from '@/lib/acta/vcPayloadBuilder';
import {
  ACTA_ISSUANCE_SIMULATED,
  simulateIssuerIdentity,
  simulateIssueTx,
} from '@/lib/acta/simulateIssuance';
import { CREDENTIAL_TYPE_LABELS } from '@/features/credentials/types';
import {
  computeStudentSubjectId,
  studentHasDocument,
} from './studentSubjectId';
import type { AttendanceRecord } from '@/lib/attendance-parser';

export interface IssueCourseCredentialInput {
  student: AttendanceRecord;
  courseName: string;
  classesAttended: number;
  classesTotal: number;
  attendancePercent: number;
  attendanceThreshold: number;
  // Storage key for the uploaded blank PDF template (upload-based flow
  // only) — the constancia route falls back to the SharePoint template
  // lookup when this is absent, so the older course-detail flow keeps
  // working unchanged.
  templatePath?: string;
}

export interface IssueCourseCredentialContext {
  issuerAddress: string;
  actaClient: ActaClient;
  issue: ReturnType<typeof useCredential>['issue'];
  signTransaction: Signer;
}

export interface IssueCourseCredentialOutcome {
  vcId: string;
  txId: string;
  issuerAddress: string;
  issuerDid: string;
  publicId: string | null;
  simulated: boolean;
}

/**
 * Shared by the single-student and batch issuance hooks so both stay in
 * sync on the simulated-vs-real ACTA branch (see simulateIssuance.ts).
 */
export async function issueCourseCredentialCore(
  params: IssueCourseCredentialInput,
  ctx: IssueCourseCredentialContext,
): Promise<IssueCourseCredentialOutcome> {
  const { issuerAddress, actaClient, issue, signTransaction } = ctx;

  if (!studentHasDocument(params.student)) {
    throw new Error(
      'El estudiante no tiene número de documento cargado — no se puede emitir la credencial.',
    );
  }

  const subjectId = computeStudentSubjectId(params.student);
  const vcId = generateVcId('course_completion', subjectId);

  // issuerAddress is a classic (G...) account now, not a contract — no
  // sourcePublicKey required (that check only applies to C... controllers).
  const identity = ACTA_ISSUANCE_SIMULATED
    ? simulateIssuerIdentity(issuerAddress)
    : await actaClient.getOrCreateIssuerIdentity({
        controller: issuerAddress,
        signTransaction,
      });
  const issuerDid = identity.did;

  const vcPayload = buildVCPayload({
    credentialType: 'course_completion',
    formData: {
      studentName: params.student.nombre,
      studentDocument: params.student.cedula,
      courseName: params.courseName,
      classesAttended: params.classesAttended,
      classesTotal: params.classesTotal,
      attendancePercent: params.attendancePercent,
      attendanceThreshold: params.attendanceThreshold,
      completedAt: new Date().toISOString(),
    },
    entrepreneurId: subjectId,
    entrepreneurName: params.student.nombre,
    businessName: params.courseName,
    issuerDid,
  });

  const { txId } = ACTA_ISSUANCE_SIMULATED
    ? simulateIssueTx()
    : await issue({
        owner: issuerAddress,
        vcId,
        vcData: JSON.stringify(vcPayload),
        issuer: issuerAddress,
        issuerDid,
        signTransaction,
      });

  const title = `${CREDENTIAL_TYPE_LABELS.course_completion} — ${params.student.nombre}`;

  const metadata: Record<string, unknown> = {};
  if (ACTA_ISSUANCE_SIMULATED) {
    metadata.simulated = true;
    metadata.simTxId = txId;
  }
  if (params.templatePath) {
    metadata.templatePath = params.templatePath;
  }

  // Absolute URL required — this runs server-side (API route), where a
  // relative fetch() URL can't be resolved against a current-page origin.
  const storeUrl = new URL(
    '/api/credentials/store',
    process.env.NEXT_PUBLIC_APP_URL,
  );

  const storeResponse = await fetch(storeUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      entrepreneurId: subjectId,
      credentialType: 'course_completion',
      title,
      description: `Emitido para ${params.student.nombre} — Curso: ${params.courseName}`,
      actaVcId: vcId,
      issuerDid,
      publicClaims: vcPayload.credentialSubject,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    }),
  })
    .then((res) => (res.ok ? res.json() : null))
    .catch(() => null);

  return {
    vcId,
    txId,
    issuerAddress,
    issuerDid,
    publicId: storeResponse?.data?.public_id ?? null,
    simulated: ACTA_ISSUANCE_SIMULATED,
  };
}
