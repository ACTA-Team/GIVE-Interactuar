'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { IconCertificate, IconSearch } from '@tabler/icons-react';
import { Building2 } from 'lucide-react';
import { MOCK_ENTREPRENEURS } from '@/features/entrepreneurs/data/mock-entrepreneurs';
import { CredentialIssuanceModal } from '../ui/CredentialIssuanceModal';

interface CredentialIssuancePageProps {
  organizationId: string;
  userId: string;
}

export function CredentialIssuancePage({}: CredentialIssuancePageProps) {
  const [search, setSearch] = useState('');
  const [selectedEntrepreneur, setSelectedEntrepreneur] = useState<{
    id: string;
    name: string;
    businessName: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filtered = MOCK_ENTREPRENEURS.filter((e) => {
    const term = search.toLowerCase();
    return (
      e.name.toLowerCase().includes(term) ||
      e.businessName.toLowerCase().includes(term)
    );
  });

  const handleSelect = (entrepreneur: (typeof MOCK_ENTREPRENEURS)[number]) => {
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
          Emitir Credencial
        </h1>
        <p className="text-muted-foreground mt-0.5">
          Selecciona un empresario para emitir una credencial verificable.
        </p>
      </div>

      <Card>
        <CardContent className="py-4">
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o negocio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {filtered.map((entrepreneur) => (
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
              Emitir
            </Button>
          </div>
        ))}

        {filtered.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <IconSearch className="h-8 w-8 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">
                No se encontraron empresarios con ese criterio.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

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
