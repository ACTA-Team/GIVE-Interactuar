import {
  isTxPrepareResponse,
  isTxSubmitResponse,
  type ActaClient,
  type Signer,
} from '@acta-team/credentials';

export interface ServerIssueArgs {
  owner: string;
  vcId: string;
  vcData: string | Record<string, unknown>;
  issuer: string;
  issuerDid?: string;
  signTransaction: Signer;
}

/**
 * Server-side equivalent of useCredential().issue — that hook can't be
 * called outside a React tree (useActaClient() uses useContext internally),
 * so this rebuilds the same prepare → sign → submit flow using only
 * ActaClient's public vcIssue method.
 */
export async function serverIssueCredential(
  client: ActaClient,
  args: ServerIssueArgs,
): Promise<{ txId: string }> {
  const vcData =
    typeof args.vcData === 'string' ? args.vcData : JSON.stringify(args.vcData);

  const prepareResult = await client.vcIssue({
    owner: args.owner,
    vcId: args.vcId,
    vcData,
    issuer: args.issuer,
    issuerDid: args.issuerDid,
  });

  if (!isTxPrepareResponse(prepareResult)) {
    throw new Error('Failed to prepare issue credential transaction');
  }

  const signedXdr = await args.signTransaction(prepareResult.xdr, {
    networkPassphrase: prepareResult.network,
  });

  const submitResult = await client.vcIssue({ signedXdr });

  if (!isTxSubmitResponse(submitResult)) {
    throw new Error('Failed to submit issue credential transaction');
  }

  return { txId: submitResult.tx_id };
}
