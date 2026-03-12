'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/Badge';
import {
  Search,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  DollarSign,
  Activity,
  UserCheck,
  BarChart3,
  Link2,
} from 'lucide-react';

export interface VaultClientSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: string;
  currentStage: number;
  hasFunding: boolean;
  fundingAmount?: number;
  isDelinquent: boolean;
  delinquentDays?: number;
  totalCredentials: number;
  issuedCredentials: number;
  impactCount: number;
  behaviorCount: number;
  profileCount: number;
  hasOnChain: boolean;
}

interface CredentialsListPageProps {
  clients: VaultClientSummary[];
}

export function CredentialsListPage({ clients }: CredentialsListPageProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return clients;
    const q = search.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.businessName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q),
    );
  }, [clients, search]);

  const totalImpact = clients.reduce((acc, c) => acc + c.impactCount, 0);
  const totalBehavior = clients.reduce((acc, c) => acc + c.behaviorCount, 0);
  const totalProfile = clients.reduce((acc, c) => acc + c.profileCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Vault de Credenciales
        </h1>
        <p className="text-muted-foreground mt-0.5">
          Registro de credenciales verificables por cliente
        </p>
      </div>

      {/* Stats by type */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
              <BarChart3 className="h-4.5 w-4.5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{totalImpact}</p>
              <p className="text-xs text-muted-foreground">Impacto</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
              <Activity className="h-4.5 w-4.5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{totalBehavior}</p>
              <p className="text-xs text-muted-foreground">Comportamiento</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10">
              <UserCheck className="h-4.5 w-4.5 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{totalProfile}</p>
              <p className="text-xs text-muted-foreground">Perfil</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, negocio o email..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Client cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">
                  {search.trim()
                    ? 'No se encontraron clientes'
                    : 'No hay clientes registrados'}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filtered.map((client) => (
            <Link
              key={client.id}
              href={ROUTES.credentials.client(client.id)}
              className="group"
            >
              <Card className="h-full transition-all hover:shadow-md hover:border-primary/20">
                <CardContent className="pt-5 pb-4 space-y-4">
                  {/* Client identity */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {client.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {client.name}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {client.businessName}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-0.5">
                        {client.businessType}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0 mt-1" />
                  </div>

                  {/* Divider */}
                  <div className="border-t" />

                  {/* Credential summary */}
                  <div className="space-y-2.5">
                    {client.totalCredentials > 0 ? (
                      <>
                        {/* Total credentials */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Credenciales
                          </span>
                          <Badge variant="success" className="gap-1">
                            <ShieldCheck className="h-3 w-3" />
                            {client.totalCredentials}
                          </Badge>
                        </div>

                        {/* By type */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {client.impactCount > 0 && (
                            <Badge variant="info" className="gap-1 text-[10px]">
                              <BarChart3 className="h-3 w-3" />
                              {client.impactCount} impacto
                            </Badge>
                          )}
                          {client.behaviorCount > 0 && (
                            <Badge
                              variant="warning"
                              className="gap-1 text-[10px]"
                            >
                              <Activity className="h-3 w-3" />
                              {client.behaviorCount} comportamiento
                            </Badge>
                          )}
                          {client.profileCount > 0 && (
                            <Badge
                              variant="secondary"
                              className="gap-1 text-[10px]"
                            >
                              <UserCheck className="h-3 w-3" />
                              {client.profileCount} perfil
                            </Badge>
                          )}
                        </div>

                        {/* On-chain indicator */}
                        {client.hasOnChain && (
                          <div className="flex items-center gap-1 text-xs text-emerald-600">
                            <Link2 className="h-3 w-3" />
                            Credenciales on-chain
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        Sin credenciales emitidas
                      </p>
                    )}

                    {/* Flags */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {client.hasFunding && (
                        <Badge variant="info" className="gap-1 text-[10px]">
                          <DollarSign className="h-3 w-3" />
                          Financiado
                        </Badge>
                      )}
                      {client.isDelinquent && (
                        <Badge variant="danger" className="gap-1 text-[10px]">
                          <AlertTriangle className="h-3 w-3" />
                          Mora
                          {client.delinquentDays
                            ? ` ${client.delinquentDays}d`
                            : ''}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>

      {/* Footer count */}
      <p className="text-sm text-muted-foreground">
        Mostrando {filtered.length} de {clients.length} clientes
      </p>
    </div>
  );
}
