import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Plus, ShieldCheck, FileWarning } from 'lucide-react';
import type { Credential, CredentialType } from '../../types';
import {
  CREDENTIAL_TYPE_LABELS,
  CREDENTIAL_TYPE_DESCRIPTIONS,
} from '../../types';
import { CredentialCard } from '../ui/CredentialCard';

interface ClientInfo {
  id: string;
  name: string;
  businessName: string;
  businessType: string;
  email: string;
  phone: string;
}

interface ClientCredentialsPageProps {
  client: ClientInfo;
  credentials: Credential[];
}

const CREDENTIAL_TYPES: CredentialType[] = ['impact', 'behavior', 'profile'];

export function ClientCredentialsPage({
  client,
  credentials,
}: ClientCredentialsPageProps) {
  const groupedCredentials = CREDENTIAL_TYPES.map((type) => ({
    type,
    label: CREDENTIAL_TYPE_LABELS[type],
    description: CREDENTIAL_TYPE_DESCRIPTIONS[type],
    items: credentials.filter((c) => c.credentialType === type),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href={ROUTES.credentials.list}>
            <button className="mt-1 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {client.name}
            </h1>
            <p className="text-muted-foreground mt-0.5">
              Credenciales verificables del cliente
            </p>
          </div>
        </div>
        <Link href={ROUTES.credentials.new}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Emitir Credencial
          </Button>
        </Link>
      </div>

      {/* Client info */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Negocio
              </p>
              <p className="mt-1 text-sm font-medium">{client.businessName}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Sector
              </p>
              <p className="mt-1 text-sm font-medium">{client.businessType}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Email
              </p>
              <p className="mt-1 text-sm font-medium">{client.email}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Total credenciales
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  {credentials.length}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credential sections by type */}
      {groupedCredentials.map(({ type, label, description, items }) => (
        <section key={type} className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {label}
              </h2>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            {items.length > 0 && (
              <Badge variant="success" className="gap-1">
                <ShieldCheck className="h-3 w-3" />
                {items.length}
              </Badge>
            )}
          </div>

          {items.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((credential) => (
                <CredentialCard key={credential.id} credential={credential} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <FileWarning className="h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Sin credenciales de este tipo
                </p>
              </CardContent>
            </Card>
          )}
        </section>
      ))}
    </div>
  );
}
