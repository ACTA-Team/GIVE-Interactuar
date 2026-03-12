'use client';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle, ExternalLink, Copy, Check } from 'lucide-react';
import {
  IconTrendingUp,
  IconShieldCheck,
  IconIdBadge2,
} from '@tabler/icons-react';
import { useState } from 'react';
import type { CredentialType } from '../../types';
import { CREDENTIAL_TYPE_LABELS } from '../../types';

const TYPE_ICONS: Record<CredentialType, React.ReactNode> = {
  impact: <IconTrendingUp className="h-6 w-6 text-orange-500" />,
  behavior: <IconShieldCheck className="h-6 w-6 text-teal-600" />,
  profile: <IconIdBadge2 className="h-6 w-6 text-blue-600" />,
};

interface CredentialIssuedSuccessProps {
  credentialType: CredentialType;
  entrepreneurName: string;
  businessName: string;
  vcId: string | null;
  txId: string | null;
  issuerAddress: string | null;
  onClose: () => void;
}

export function CredentialIssuedSuccess({
  credentialType,
  entrepreneurName,
  businessName,
  vcId,
  txId,
  issuerAddress,
  onClose,
}: CredentialIssuedSuccessProps) {
  const [copied, setCopied] = useState(false);
  const isOnChain = !!vcId;

  const handleCopyVcId = async () => {
    if (!vcId) return;
    await navigator.clipboard.writeText(vcId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const network = process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? 'testnet';
  const explorerUrl = txId
    ? `https://stellar.expert/explorer/${network}/tx/${txId}`
    : issuerAddress
      ? `https://stellar.expert/explorer/${network}/account/${issuerAddress}`
      : null;

  return (
    <div className="flex flex-col items-center gap-6 py-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
        <CheckCircle className="h-8 w-8 text-emerald-500" />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          {isOnChain
            ? 'Credencial emitida en blockchain'
            : 'Credencial lista para emitir'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {isOnChain
            ? 'La credencial ha sido registrada de forma verificable en Stellar.'
            : 'Los datos han sido validados y la credencial está preparada.'}
        </p>
      </div>

      <div className="w-full max-w-sm space-y-3 rounded-xl border border-border bg-muted/30 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Tipo</span>
          <div className="flex items-center gap-2">
            {TYPE_ICONS[credentialType]}
            <span className="text-sm font-medium">
              {CREDENTIAL_TYPE_LABELS[credentialType]}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Empresario</span>
          <span className="text-sm font-medium">{entrepreneurName}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Negocio</span>
          <span className="text-sm font-medium">{businessName}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Estado</span>
          <Badge variant="success" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            {isOnChain ? 'Emitida on-chain' : 'Validada'}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Red</span>
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Stellar {network}
          </span>
        </div>

        {vcId && (
          <div className="space-y-1.5">
            <span className="text-sm text-muted-foreground">VC ID</span>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded bg-muted px-2 py-1 text-xs text-foreground">
                {vcId}
              </code>
              <button
                type="button"
                onClick={handleCopyVcId}
                className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {isOnChain && (
        <div className="w-full max-w-sm rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-xs text-emerald-700">
            Esta credencial es verificable por cualquier persona con el VC ID.
            Fue registrada de forma inmutable en la blockchain de Stellar
            mediante ACTA.
          </p>
        </div>
      )}

      <div className="flex w-full max-w-sm gap-3">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          disabled={!explorerUrl}
          onClick={() => explorerUrl && window.open(explorerUrl, '_blank')}
        >
          <ExternalLink className="h-4 w-4" />
          Ver en blockchain
        </Button>
        <Button
          className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
          onClick={onClose}
        >
          Cerrar
        </Button>
      </div>
    </div>
  );
}
