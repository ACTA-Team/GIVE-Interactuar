'use client';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle, ExternalLink } from 'lucide-react';
import {
  IconTrendingUp,
  IconShieldCheck,
  IconIdBadge2,
} from '@tabler/icons-react';
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
  onClose: () => void;
}

export function CredentialIssuedSuccess({
  credentialType,
  entrepreneurName,
  businessName,
  onClose,
}: CredentialIssuedSuccessProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
        <CheckCircle className="h-8 w-8 text-emerald-500" />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          Credencial lista para emitir
        </h3>
        <p className="text-sm text-muted-foreground">
          Los datos han sido validados y la credencial está preparada.
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
            Validada
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Blockchain</span>
          {/* TODO: ACTA integration - show actual tx hash */}
          <span className="text-xs text-muted-foreground italic">
            Pendiente de emisión on-chain
          </span>
        </div>
      </div>

      <div className="w-full max-w-sm rounded-lg border border-dashed border-amber-300 bg-amber-50 p-3">
        <p className="text-xs text-amber-700">
          La emisión on-chain con ACTA será habilitada próximamente. Los datos
          del formulario quedarán almacenados como borrador hasta entonces.
        </p>
      </div>

      <div className="flex w-full max-w-sm gap-3">
        {/* TODO: ACTA integration - enable this button to view on explorer */}
        <Button variant="outline" className="flex-1 gap-2" disabled>
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
