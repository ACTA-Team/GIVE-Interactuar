// Best-effort, reverse-engineered from a real ACTA dapp share link — not
// a documented/stable API. Decoded shape of
// https://dapp.acta.build/credential/{vc_id}?share={base64}:
//   { revealedFields: { issuerDid, issuer, subject, type, issuedAt,
//       status, provider, courseName, issueDate }, vc_id, type }
// Only meaningful once real (non-simulated) issuance is active — with
// ACTA_ISSUANCE_SIMULATED, issuerDid/vcId are fake and this link resolves
// to nothing on dapp.acta.build.
export interface ActaShareLinkParams {
  vcId: string;
  issuerDid: string;
  courseName: string;
  issuedAt: string;
}

export function buildActaShareLink(params: ActaShareLinkParams): string {
  const dateOnly = params.issuedAt.slice(0, 10);

  const payload = {
    revealedFields: {
      issuerDid: params.issuerDid,
      issuer: params.issuerDid,
      subject: params.issuerDid,
      type: 'CourseCertificateCredential',
      issuedAt: dateOnly,
      status: 'valid',
      provider: 'me',
      courseName: params.courseName,
      issueDate: dateOnly,
    },
    vc_id: params.vcId,
    type: 'CourseCertificateCredential',
  };

  const share = base64EncodeUtf8(JSON.stringify(payload));
  return `https://dapp.acta.build/credential/${params.vcId}?share=${share}`;
}

// Runs client-side (students-list step) as well as server-side, so this
// avoids the Node-only Buffer global in favor of something that works in
// both — btoa() only accepts Latin1, hence the UTF-8 byte escape first.
function base64EncodeUtf8(value: string): string {
  const bytes = encodeURIComponent(value).replace(
    /%([0-9A-F]{2})/g,
    (_, hex: string) => String.fromCharCode(parseInt(hex, 16)),
  );
  return btoa(bytes);
}
