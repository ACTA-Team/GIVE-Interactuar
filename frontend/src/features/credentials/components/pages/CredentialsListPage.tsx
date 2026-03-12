'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/Badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, ChevronRight, ShieldCheck } from 'lucide-react';
import type { Entrepreneur } from '@/features/entrepreneurs/types';

interface EntrepreneurWithCredentialCount extends Entrepreneur {
  credentialCount: number;
}

interface CredentialsListPageProps {
  entrepreneurs: EntrepreneurWithCredentialCount[];
}

export function CredentialsListPage({
  entrepreneurs,
}: CredentialsListPageProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return entrepreneurs;
    const q = search.toLowerCase();
    return entrepreneurs.filter(
      (e) =>
        e.fullName.toLowerCase().includes(q) ||
        e.businessProfile?.businessName?.toLowerCase().includes(q) ||
        e.documentNumber.includes(q),
    );
  }, [entrepreneurs, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Registro de Credenciales
        </h1>
        <p className="text-muted-foreground mt-1">
          Selecciona un cliente para ver y gestionar sus credenciales
          verificables
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, negocio o documento..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Cliente</TableHead>
                  <TableHead>Negocio</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead className="text-center">Credenciales</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <p className="text-muted-foreground">
                        {search.trim()
                          ? 'No se encontraron clientes'
                          : 'No hay clientes registrados'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((entrepreneur) => (
                    <TableRow key={entrepreneur.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-sm">
                            {entrepreneur.fullName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">
                              {entrepreneur.fullName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {entrepreneur.documentType}{' '}
                              {entrepreneur.documentNumber}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">
                          {entrepreneur.businessProfile?.businessName ?? '—'}
                        </p>
                        {entrepreneur.businessProfile?.businessSector && (
                          <p className="text-sm text-muted-foreground">
                            {entrepreneur.businessProfile.businessSector}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">
                          {[
                            entrepreneur.municipality,
                            entrepreneur.department,
                          ]
                            .filter(Boolean)
                            .join(', ') || '—'}
                        </p>
                      </TableCell>
                      <TableCell className="text-center">
                        {entrepreneur.credentialCount > 0 ? (
                          <Badge variant="success" className="gap-1">
                            <ShieldCheck className="h-3 w-3" />
                            {entrepreneur.credentialCount}
                          </Badge>
                        ) : (
                          <Badge variant="default">0</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={ROUTES.credentials.client(entrepreneur.id)}
                        >
                          <button className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Mostrando {filtered.length} de {entrepreneurs.length} clientes
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
