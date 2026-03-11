'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Banknote,
  Shield,
  ArrowUpDown,
} from 'lucide-react';
import {
  STAGES,
} from '../../types/stages';
import { MOCK_ENTREPRENEURS } from '../../data/mock-entrepreneurs';
import { NewEntrepreneurDialog } from '../ui/NewEntrepreneurDialog';
import {
  BADGE_ICONS_SMALL,
  BADGE_LIST_CLASSES,
} from '../../constants/badge-ui';

type SortField = 'name' | 'stage' | 'delinquent' | 'funding' | 'badges';
type SortDirection = 'asc' | 'desc';

export function EntrepreneursListPage() {
  const entrepreneurs = MOCK_ENTREPRENEURS;
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const handleFilterStage = (value: string | null) =>
    setFilterStage(value ?? 'all');
  const handleFilterStatus = (value: string | null) =>
    setFilterStatus(value ?? 'all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const filteredAndSortedEntrepreneurs = useMemo(() => {
    const filtered = entrepreneurs.filter((e) => {
      const matchesSearch =
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.businessName.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase());

      const matchesStage =
        filterStage === 'all' || e.currentStage === parseInt(filterStage);

      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'delinquent' && e.isDelinquent) ||
        (filterStatus === 'funded' && e.hasFunding) ||
        (filterStatus === 'not-funded' && !e.hasFunding);

      return matchesSearch && matchesStage && matchesStatus;
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'stage':
          comparison = a.currentStage - b.currentStage;
          break;
        case 'delinquent':
          comparison = (a.isDelinquent ? 1 : 0) - (b.isDelinquent ? 1 : 0);
          if (comparison === 0) {
            comparison = (a.delinquentDays || 0) - (b.delinquentDays || 0);
          }
          break;
        case 'funding':
          comparison = (a.fundingAmount || 0) - (b.fundingAmount || 0);
          break;
        case 'badges':
          comparison = a.badges.length - b.badges.length;
          break;
      }
      return sortDirection === 'desc' ? -comparison : comparison;
    });
  }, [
    entrepreneurs,
    search,
    filterStage,
    filterStatus,
    sortField,
    sortDirection,
  ]);

  const handleSelectAll = () => {
    if (selectedIds.size === filteredAndSortedEntrepreneurs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSortedEntrepreneurs.map((e) => e.id)));
    }
  };

  const handleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkCertify = (stageId: number) => {
    // TODO: wire to certify service
    console.log('Bulk certify', Array.from(selectedIds), 'stage', stageId);
    setSelectedIds(new Set());
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Empresarios</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los empresarios y su progreso en el programa
          </p>
        </div>
        <NewEntrepreneurDialog />
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, negocio o email..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Select value={filterStage} onValueChange={handleFilterStage}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filtrar por etapa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las etapas</SelectItem>
                  {STAGES.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id.toString()}>
                      Etapa {stage.id}: {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={handleFilterStatus}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="funded">Financiados</SelectItem>
                  <SelectItem value="not-funded">Sin financiar</SelectItem>
                  <SelectItem value="delinquent">Morosos</SelectItem>
                </SelectContent>
              </Select>

              {selectedIds.size > 0 && (
                <div className="flex items-center gap-2 pl-2 border-l">
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {selectedIds.size} seleccionados
                  </Badge>
                  <Select
                    onValueChange={(value: string | null) =>
                      value && handleBulkCertify(parseInt(value))
                    }
                  >
                    <SelectTrigger className="w-[200px]">
                      <Shield className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Certificar etapa..." />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGES.map((stage) => (
                        <SelectItem key={stage.id} value={stage.id.toString()}>
                          Etapa {stage.id}: {stage.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={
                        selectedIds.size ===
                          filteredAndSortedEntrepreneurs.length &&
                        filteredAndSortedEntrepreneurs.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => toggleSort('name')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors font-medium"
                    >
                      Empresario
                      <ArrowUpDown
                        className={`h-3 w-3 ${sortField === 'name' ? 'text-primary' : 'text-muted-foreground'}`}
                      />
                    </button>
                  </TableHead>
                  <TableHead>Negocio</TableHead>
                  <TableHead>
                    <button
                      onClick={() => toggleSort('stage')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors font-medium"
                    >
                      Etapa
                      <ArrowUpDown
                        className={`h-3 w-3 ${sortField === 'stage' ? 'text-primary' : 'text-muted-foreground'}`}
                      />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => toggleSort('delinquent')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors font-medium"
                    >
                      Estado
                      <ArrowUpDown
                        className={`h-3 w-3 ${sortField === 'delinquent' ? 'text-primary' : 'text-muted-foreground'}`}
                      />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => toggleSort('badges')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors font-medium"
                    >
                      Insignias
                      <ArrowUpDown
                        className={`h-3 w-3 ${sortField === 'badges' ? 'text-primary' : 'text-muted-foreground'}`}
                      />
                    </button>
                  </TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedEntrepreneurs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <p className="text-muted-foreground">
                        No se encontraron empresarios
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedEntrepreneurs.map((entrepreneur) => {
                    const currentStage = STAGES.find(
                      (s) => s.id === entrepreneur.currentStage,
                    );

                    return (
                      <TableRow
                        key={entrepreneur.id}
                        className={
                          selectedIds.has(entrepreneur.id) ? 'bg-primary/5' : ''
                        }
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(entrepreneur.id)}
                            onCheckedChange={() =>
                              handleSelect(entrepreneur.id)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-sm">
                              {entrepreneur.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium">{entrepreneur.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {entrepreneur.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">
                            {entrepreneur.businessName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {entrepreneur.businessType}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-normal">
                            {entrepreneur.currentStage}: {currentStage?.name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {entrepreneur.isDelinquent ? (
                              <Badge variant="danger" className="gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Moroso ({entrepreneur.delinquentDays}d)
                              </Badge>
                            ) : entrepreneur.hasFunding ? (
                              <Badge variant="success" className="gap-1">
                                <Banknote className="h-3 w-3" />
                                {formatCurrency(
                                  entrepreneur.fundingAmount || 0,
                                )}
                              </Badge>
                            ) : (
                              <Badge
                                variant="default"
                                className="text-muted-foreground gap-1"
                              >
                                <CheckCircle className="h-3 w-3" />
                                Al día
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {entrepreneur.badges.length > 0 ? (
                            <div className="flex items-center gap-1">
                              {entrepreneur.badges.slice(0, 3).map((badge) => (
                                <div
                                  key={badge.id}
                                  className={`h-7 w-7 rounded-lg ${BADGE_LIST_CLASSES[badge.id] ?? 'bg-muted border'} border flex items-center justify-center`}
                                  title={badge.name}
                                >
                                  {BADGE_ICONS_SMALL[badge.id]}
                                </div>
                              ))}
                              {entrepreneur.badges.length > 3 && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs h-7 px-2"
                                >
                                  +{entrepreneur.badges.length - 3}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              -
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/dashboard/entrepreneurs/${entrepreneur.id}`}
                          >
                            <Button variant="ghost" size="icon">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <p>
              Mostrando {filteredAndSortedEntrepreneurs.length} de{' '}
              {entrepreneurs.length} empresarios
            </p>
            {selectedIds.size > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds(new Set())}
              >
                Limpiar selección
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
