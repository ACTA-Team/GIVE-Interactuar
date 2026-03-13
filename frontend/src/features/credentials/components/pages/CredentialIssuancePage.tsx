'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { IconCertificate, IconSearch } from '@tabler/icons-react';
import { Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDashboardEntrepreneurs } from '@/features/entrepreneurs/hooks/useDashboardEntrepreneurs';
import { CredentialIssuanceModal } from '../ui/CredentialIssuanceModal';

interface CredentialIssuancePageProps {
  organizationId: string;
  userId: string;
}

export function CredentialIssuancePage({}: CredentialIssuancePageProps) {
  const t = useTranslations('credentials');
  const { data: entrepreneurs = [] } = useDashboardEntrepreneurs();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selectedEntrepreneur, setSelectedEntrepreneur] = useState<{
    id: string;
    name: string;
    businessName: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    const base = term
      ? entrepreneurs.filter((e) => {
          return (
            e.name.toLowerCase().includes(term) ||
            e.businessName.toLowerCase().includes(term)
          );
        })
      : entrepreneurs;

    return base;
  }, [entrepreneurs, search]);

  const totalPages = filtered.length
    ? Math.ceil(filtered.length / pageSize)
    : 1;

  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageItems = filtered.slice(startIndex, endIndex);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleSelect = (entrepreneur: (typeof entrepreneurs)[number]) => {
    setSelectedEntrepreneur({
      id: entrepreneur.id,
      name: entrepreneur.name,
      businessName: entrepreneur.businessName,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t('issuance.title')}
        </h1>
        <p className="text-muted-foreground mt-0.5">{t('issuance.subtitle')}</p>
      </div>

      <Card>
        <CardContent className="py-4">
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('issuance.searchPlaceholder')}
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {pageItems.map((entrepreneur) => (
          <div
            key={entrepreneur.id}
            role="button"
            tabIndex={0}
            onClick={() => handleSelect(entrepreneur)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSelect(entrepreneur);
              }
            }}
            className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                {entrepreneur.name
                  .split(' ')
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join('')}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {entrepreneur.name}
                </p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Building2 className="h-3 w-3" />
                  {entrepreneur.businessName}
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="gap-1.5 shrink-0">
              <IconCertificate className="h-4 w-4" />
              {t('issuance.issue')}
            </Button>
          </div>
        ))}

        {filtered.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <IconSearch className="h-8 w-8 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">
                {t('issuance.noEntrepreneursFound')}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {filtered.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Mostrando {pageItems.length} de {filtered.length} emprendedores
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {(() => {
              const pair: number[] =
                currentPage < totalPages
                  ? [currentPage, currentPage + 1]
                  : totalPages > 1
                    ? [currentPage - 1, currentPage]
                    : [currentPage];

              const showEllipsis =
                totalPages > 1 && pair[pair.length - 1] < totalPages;

              return (
                <>
                  {pair.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`flex h-8 w-8 items-center justify-center rounded-md border text-sm font-medium transition-colors ${
                        currentPage === p
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  {showEllipsis && (
                    <>
                      <span className="flex h-8 items-center justify-center px-1 text-muted-foreground">
                        …
                      </span>
                      <button
                        onClick={() => setPage(totalPages)}
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-sm font-medium transition-colors hover:bg-muted"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </>
              );
            })()}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {selectedEntrepreneur && (
        <CredentialIssuanceModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          entrepreneurId={selectedEntrepreneur.id}
          entrepreneurName={selectedEntrepreneur.name}
          businessName={selectedEntrepreneur.businessName}
        />
      )}
    </div>
  );
}
