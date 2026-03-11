'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatsCard } from '../ui/StatsCard';

interface DashboardStats {
  totalEntrepreneurs: number;
  activeLoans: number;
  totalCredentialsIssued: number;
  avgIncomeGrowthPct: number | null;
}

interface DashboardPageProps {
  stats: DashboardStats;
}

const MOCK_ENTREPRENEURS = [
  {
    initials: 'AM',
    name: 'Ana Martínez Sánchez',
    email: 'ana.martinez@email.com',
    business: 'Boutique Ana Fashion',
    category: 'Confecciones',
    stage: 'Financiado',
    stageNumber: 5,
    status: 'moroso' as const,
    morosoDays: 45,
    funding: 8_000_000,
  },
  {
    initials: 'JL',
    name: 'José López Ramírez',
    email: 'jose.lopez@email.com',
    business: 'Transporte JL Express',
    category: 'Transporte',
    stage: 'Financiado',
    stageNumber: 5,
    status: 'moroso' as const,
    morosoDays: 12,
    funding: 15_000_000,
  },
  {
    initials: 'MG',
    name: 'María García López',
    email: 'maria.garcia@email.com',
    business: 'Dulcería María',
    category: 'Alimentos',
    stage: 'Financiado',
    stageNumber: 5,
    status: 'al_dia' as const,
    funding: 5_000_000,
  },
  {
    initials: 'RG',
    name: 'Roberto Gómez Castro',
    email: 'roberto.gomez@email.com',
    business: 'Taller Roberto',
    category: 'Servicios',
    stage: 'Financiado',
    stageNumber: 5,
    status: 'al_dia' as const,
    funding: 12_000_000,
  },
  {
    initials: 'CR',
    name: 'Carlos Rodríguez Mejía',
    email: 'carlos.rodriguez@email.com',
    business: 'Tech Carlos',
    category: 'Tecnología',
    stage: 'Apto para Financiamiento',
    stageNumber: 4,
    status: 'sin_financiar' as const,
    funding: null,
  },
  {
    initials: 'PH',
    name: 'Pedro Hernández Villa',
    email: 'pedro.hernandez@email.com',
    business: 'Panadería Pedro',
    category: 'Alimentos',
    stage: 'Plan de Negocio',
    stageNumber: 2,
    status: 'sin_financiar' as const,
    funding: null,
  },
  {
    initials: 'LV',
    name: 'Lucía Vargas Ospina',
    email: 'lucia.vargas@email.com',
    business: 'Artesanías Lucía',
    category: 'Artesanías',
    stage: 'Formación Básica',
    stageNumber: 1,
    status: 'sin_financiar' as const,
    funding: null,
  },
  {
    initials: 'CR',
    name: 'Carmen Ruiz Pérez',
    email: 'carmen.ruiz@email.com',
    business: 'Boutique Carmen',
    category: 'Confecciones',
    stage: 'Registro',
    stageNumber: 0,
    status: 'sin_financiar' as const,
    funding: null,
  },
];

function formatCurrency(n: number) {
  return `$ ${n.toLocaleString('es-CO')}`;
}

const STAGE_OPTIONS = [
  { value: 'all', label: 'Todas' },
  ...Array.from(
    new Map(
      MOCK_ENTREPRENEURS.map((e) => [
        e.stageNumber,
        { value: String(e.stageNumber), label: `${e.stageNumber}: ${e.stage}` },
      ]),
    ).values(),
  ).sort((a, b) => Number(a.value) - Number(b.value)),
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'al_dia', label: 'Al día' },
  { value: 'moroso', label: 'Moroso' },
  { value: 'sin_financiar', label: 'Sin financiar' },
];

export function DashboardPage({ stats }: DashboardPageProps) {
  const [filterStage, setFilterStage] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered = useMemo(
    () =>
      MOCK_ENTREPRENEURS.filter(
        (e) =>
          (filterStage === 'all' || String(e.stageNumber) === filterStage) &&
          (filterStatus === 'all' || e.status === filterStatus),
      ),
    [filterStage, filterStatus],
  );

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total clientes"
          value={stats.totalEntrepreneurs}
          description="Registrados en la organización"
        />
        <StatsCard
          label="Créditos vigentes"
          value={stats.activeLoans}
          description="Préstamos activos"
        />
        <StatsCard
          label="Credenciales emitidas"
          value={stats.totalCredentialsIssued}
          description="Via ACTA SDK"
        />
        <StatsCard
          label="Crecimiento ingresos"
          value={
            stats.avgIncomeGrowthPct !== null
              ? `${stats.avgIncomeGrowthPct}%`
              : '—'
          }
          description="Promedio antes/después"
        />
      </div>

      <div className="mt-8 rounded-lg border bg-card p-6">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Empresarios</h2>
            <p className="text-sm text-muted-foreground">
              Selecciona empresarios para verificar etapas en lote
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="filter-etapa"
                className="text-xs font-medium text-muted-foreground"
              >
                Etapa
              </label>
              <select
                id="filter-etapa"
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
                className="rounded-md border px-3 py-1.5 text-sm min-w-[180px]"
              >
                {STAGE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="filter-estado"
                className="text-xs font-medium text-muted-foreground"
              >
                Estado
              </label>
              <select
                id="filter-estado"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-md border px-3 py-1.5 text-sm min-w-[140px]"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Empresario</TableHead>
              <TableHead>Negocio</TableHead>
              <TableHead>Etapa</TableHead>
              <TableHead className="cursor-pointer">
                Estado <span className="ml-1">▼</span>
              </TableHead>
              <TableHead>Financiamiento</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((e) => (
              <TableRow key={e.email}>
                <TableCell>
                  <input type="checkbox" className="h-4 w-4 rounded" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {e.initials}
                    </div>
                    <div>
                      <div className="font-medium">{e.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {e.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{e.business}</div>
                    <div className="text-sm text-muted-foreground">
                      {e.category}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-sm">
                    {e.stageNumber}: {e.stage}
                  </span>
                </TableCell>
                <TableCell>
                  {e.status === 'al_dia' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                      ✓ Al día
                    </span>
                  )}
                  {e.status === 'moroso' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                      ▲ Moroso ({e.morosoDays}d)
                    </span>
                  )}
                  {e.status === 'sin_financiar' && (
                    <span className="text-sm text-muted-foreground">
                      Sin financiar
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-between gap-2">
                    {e.funding !== null ? formatCurrency(e.funding) : '—'}
                    <span className="text-muted-foreground">›</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {filtered.length} de {MOCK_ENTREPRENEURS.length}{' '}
            empresarios
          </p>
          <Link
            href="/dashboard/entrepreneurs"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Ver todos
            <span>↗</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
