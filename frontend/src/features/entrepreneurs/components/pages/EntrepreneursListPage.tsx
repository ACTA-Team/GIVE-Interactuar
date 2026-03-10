'use client';

import { useState } from 'react';
import type {
  CreditLevel,
  Entrepreneur,
  EntrepreneurFilters,
} from '../../types';
import { EntrepreneurCard } from '../ui/EntrepreneurCard';

interface EntrepreneursListPageProps {
  entrepreneurs: Entrepreneur[];
}

const CREDIT_LEVELS: CreditLevel[] = ['bajo', 'medio', 'alto', 'excelente'];

// Data is fetched server-side in app/(dashboard)/dashboard/entrepreneurs/page.tsx
// TODO: add empty state when list is empty
// TODO: add pagination controls
export function EntrepreneursListPage({
  entrepreneurs,
}: EntrepreneursListPageProps) {
  const [filters, setFilters] = useState<EntrepreneurFilters>({});

  const filtered = entrepreneurs.filter((e) => {
    if (filters.query) {
      const q = filters.query.toLowerCase();
      if (
        !e.fullName.toLowerCase().includes(q) &&
        !e.documentNumber.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (filters.municipality && e.municipality !== filters.municipality) {
      return false;
    }
    if (
      filters.creditLevel &&
      e.financialProfile?.creditLevel !== filters.creditLevel
    ) {
      return false;
    }
    return true;
  });

  const municipalities = Array.from(
    new Set(entrepreneurs.map((e) => e.municipality).filter(Boolean)),
  ) as string[];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Emprendedores</h1>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar por nombre o documento..."
          value={filters.query ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm w-64"
        />
        <select
          value={filters.creditLevel ?? ''}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              creditLevel: (e.target.value as CreditLevel) || undefined,
            }))
          }
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">Todos los niveles</option>
          {CREDIT_LEVELS.map((level) => (
            <option key={level} value={level} className="capitalize">
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </option>
          ))}
        </select>
        {municipalities.length > 0 && (
          <select
            value={filters.municipality ?? ''}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                municipality: e.target.value || undefined,
              }))
            }
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="">Todos los municipios</option>
            {municipalities.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((e) => (
          <EntrepreneurCard key={e.id} entrepreneur={e} />
        ))}
      </div>
    </div>
  );
}
