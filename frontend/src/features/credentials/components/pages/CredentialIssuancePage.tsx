'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { IconCertificate, IconSearch } from '@tabler/icons-react';
import { Building2, GraduationCap } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { useDashboardEntrepreneurs } from '@/features/entrepreneurs/hooks/useDashboardEntrepreneurs';
import { createClient } from '@/lib/supabase/client';
import { CredentialIssuanceModal } from '../ui/CredentialIssuanceModal';

export function CredentialIssuancePage() {
  const t = useTranslations('credentials');
  const tc = useTranslations('common');
  const { data: entrepreneurs = [] } = useDashboardEntrepreneurs();
  const { data: mbaIssuedEntrepreneurs = [] } = useQuery<string[]>({
    queryKey: ['mba-issued-entrepreneurs'],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('credentials')
        .select('entrepreneur_id')
        .eq('credential_type', 'mba');

      if (error) throw error;

      return (data ?? []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (row: any) => row.entrepreneur_id as string,
      );
    },
  });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selectedEntrepreneur, setSelectedEntrepreneur] = useState<{
    id: string;
    name: string;
    businessName: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mbaIssuedSet = useMemo(
    () => new Set(mbaIssuedEntrepreneurs),
    [mbaIssuedEntrepreneurs],
  );

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
    <div className="space-y-6 max-md:space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground max-md:text-xl">
          {t('issuance.title')}
        </h1>
        <p className="text-muted-foreground mt-0.5 max-md:text-sm">{t('issuance.subtitle')}</p>
      </div>

      <Card className="shadow-sm">
        <CardContent>
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
            className="flex w-full min-w-0 cursor-pointer items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30 max-md:gap-2"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                {entrepreneur.name
                  .split(' ')
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join('')}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 gap-y-0.5">
                  <p className="text-sm font-medium text-foreground truncate min-w-0">
                    {entrepreneur.name}
                  </p>
                  {entrepreneur.mbaEligible &&
                    !mbaIssuedSet.has(entrepreneur.id) && (
                      <Badge variant="info" className="gap-1 text-[10px] shrink-0">
                        <GraduationCap className="h-3 w-3" />
                        {t('issuance.mbaPendingBadge')}
                      </Badge>
                    )}
                </div>
                <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5 truncate min-w-0">
                  <Building2 className="h-3 w-3 shrink-0" />
                  <span className="truncate">{entrepreneur.businessName}</span>
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="gap-1.5 shrink-0 max-md:px-2">
              <IconCertificate className="h-4 w-4 max-md:hidden" />
              {t('issuance.issue')}
            </Button>
          </div>
        ))}

        {filtered.length === 0 && (
          <Card className="shadow-sm">
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
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
          showingLabel={tc('showing', {
            count: pageItems.length,
            total: filtered.length,
          })}
        />
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
