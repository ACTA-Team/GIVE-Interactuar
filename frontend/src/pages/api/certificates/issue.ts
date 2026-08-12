import type { NextApiRequest, NextApiResponse } from 'next';
import { Keypair } from '@stellar/stellar-sdk';
import { ActaApiError } from '@acta-team/credentials';
import { z } from 'zod';
import { getServerActaClient } from '@/lib/acta/serverActaClient';
import { serverIssueCredential } from '@/lib/acta/serverIssue';
import { buildClassicSignTransaction } from '@/lib/acta/classicSignTransaction';
import {
  issueCourseCredentialCore,
  type IssueCourseCredentialOutcome,
  type IssueCourseCredentialInput,
} from '@/features/courses/lib/issueCourseCredentialCore';

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 4000;

function isRetryable(err: unknown): boolean {
  if (!(err instanceof ActaApiError)) return false;
  // Transient: client-side timeout, network blip, ACTA 5xx, or the DID
  // resolving too soon after registration (confirmed empirically
  // 2026-08-11 — ACTA's testnet is slow/flaky enough to hit real "timeout
  // of 30000ms exceeded" and 500s on some students in a batch but not
  // others, plus a real indexing lag right after a fresh DID registers).
  return (
    err.isTimeout ||
    err.isNetworkError ||
    err.status >= 500 ||
    err.code === 'issuerDid_unresolvable'
  );
}

async function issueWithRetry(
  params: IssueCourseCredentialInput,
  ctx: Parameters<typeof issueCourseCredentialCore>[1],
): Promise<IssueCourseCredentialOutcome> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await issueCourseCredentialCore(params, ctx);
    } catch (err) {
      if (attempt === MAX_ATTEMPTS || !isRetryable(err)) throw err;
      console.warn(
        `[certificates/issue] attempt ${attempt} failed (${(err as ActaApiError).code}), retrying...`,
      );
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    }
  }
  // Unreachable — loop always returns or throws.
  throw new Error('unreachable');
}

const AttendanceRecordSchema = z.object({
  nombre: z.string(),
  correo: z.string(),
  empresa: z.string(),
  telefono: z.string(),
  cedula: z.string(),
  asistencia: z.array(z.object({ clase: z.string(), asistio: z.boolean() })),
});

const IssueRequestSchema = z.object({
  student: AttendanceRecordSchema,
  courseName: z.string().min(1),
  classesAttended: z.number(),
  classesTotal: z.number(),
  attendancePercent: z.number(),
  attendanceThreshold: z.number(),
  templatePath: z.string().optional(),
});

/**
 * POST /api/certificates/issue
 *
 * Issues one course_completion credential, signed and paid for by
 * COURSE_ISSUER_SECRET_KEY (a classic Stellar account — no passkey). Called
 * once per student by both the single and batch issuance hooks.
 *
 * Lives under pages/api (not app/api) deliberately: @acta-team/credentials
 * calls React.createContext at module scope for its client-only provider.
 * Route Handlers under app/ inherit React's "react-server" module
 * resolution condition (where createContext is a throwing stub) for
 * everything reachable from them — marking the package external via
 * serverExternalPackages avoids that crash but instead makes it resolve a
 * second, mismatched React copy during SSR of client pages elsewhere in
 * the app (surfaced as "Invalid hook call" on /dashboard/certificados).
 * Pages Router API routes were never part of the RSC module graph, so
 * they don't carry that condition — importing the package here is safe.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const secretKey = process.env.COURSE_ISSUER_SECRET_KEY;
    if (!secretKey) {
      res
        .status(500)
        .json({ error: 'COURSE_ISSUER_SECRET_KEY no está configurado' });
      return;
    }

    const parsed = IssueRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: 'Datos inválidos', details: parsed.error.flatten() });
      return;
    }

    const issuerAddress = Keypair.fromSecret(secretKey).publicKey();
    const actaClient = await getServerActaClient();
    const signTransaction = buildClassicSignTransaction(secretKey);

    const outcome = await issueWithRetry(
      parsed.data as IssueCourseCredentialInput,
      {
        issuerAddress,
        actaClient,
        issue: (args) => serverIssueCredential(actaClient, args),
        signTransaction,
      },
    );

    res.status(200).json(outcome);
  } catch (err) {
    console.error('[certificates/issue] Error:', err);
    const message = err instanceof Error ? err.message : 'Error desconocido';
    res.status(500).json({ error: message });
  }
}
