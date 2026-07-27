import type { useCredential, useActaClient } from '@acta-team/credentials';
import { buildSignTransaction } from '@/lib/acta/signTransaction';
import { buildVCPayload, generateVcId } from '@/lib/acta/vcPayloadBuilder';
import {
  ACTA_ISSUANCE_SIMULATED,
  simulateIssuerIdentity,
  simulateIssueTx,
} from '@/lib/acta/simulateIssuance';
import { CREDENTIAL_TYPE_LABELS } from '@/features/credentials/types';
import type { AttendanceRecord } from '@/lib/attendance-parser';

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export interface IssueCourseCredentialInput {
  student: AttendanceRecord;
  courseName: string;
  classesAttended: number;
  classesTotal: number;
  attendancePercent: number;
  attendanceThreshold: number;
}

export interface IssueCourseCredentialContext {
  contractId: string;
  actaClient: ReturnType<typeof useActaClient>;
  issue: ReturnType<typeof useCredential>['issue'];
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
  const { contractId, actaClient, issue } = ctx;

  const subjectId =
    params.student.cedula.trim() || normalize(params.student.correo);
  const vcId = generateVcId('course_completion', subjectId);
  const signTransaction = buildSignTransaction();

  const identity = ACTA_ISSUANCE_SIMULATED
    ? simulateIssuerIdentity(contractId)
    : await actaClient.getOrCreateIssuerIdentity({
        controller: contractId,
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
        owner: contractId,
        vcId,
        vcData: JSON.stringify(vcPayload),
        issuer: contractId,
        issuerDid,
        signTransaction,
      });

  const title = `${CREDENTIAL_TYPE_LABELS.course_completion} — ${params.student.nombre}`;

  const storeResponse = await fetch('/api/credentials/store', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      credentialType: 'course_completion',
      title,
      description: `Emitido para ${params.student.nombre} — Curso: ${params.courseName}`,
      actaVcId: vcId,
      issuerDid,
      publicClaims: vcPayload.credentialSubject,
      metadata: ACTA_ISSUANCE_SIMULATED
        ? { simulated: true, simTxId: txId }
        : undefined,
    }),
  })
    .then((res) => (res.ok ? res.json() : null))
    .catch(() => null);

  return {
    vcId,
    txId,
    issuerAddress: contractId,
    issuerDid,
    publicId: storeResponse?.data?.public_id ?? null,
    simulated: ACTA_ISSUANCE_SIMULATED,
  };
}
