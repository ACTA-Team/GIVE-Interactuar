'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  CheckCircle,
  Shield,
  Award,
  Clock,
  Mail,
  Phone,
  Building2,
  Banknote,
  AlertTriangle,
  Plus,
  X,
  Lock,
} from 'lucide-react';
import { STAGES, AVAILABLE_BADGES } from '../../types/stages';
import { MOCK_ENTREPRENEURS } from '../../data/mock-entrepreneurs';
import { BadgeDetailDialog } from '../ui/BadgeDetailDialog';
import {
  BADGE_ICONS,
  BADGE_ICONS_LARGE,
  getBadgeColors,
} from '../../constants/badge-ui';

interface EntrepreneurDetailPageProps {
  entrepreneurId: string;
}

export function EntrepreneurDetailPage({
  entrepreneurId,
}: EntrepreneurDetailPageProps) {
  const router = useRouter();
  const [isBadgeDialogOpen, setIsBadgeDialogOpen] = useState(false);
  const [certifyDialogOpen, setCertifyDialogOpen] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);

  const entrepreneur = MOCK_ENTREPRENEURS.find((e) => e.id === entrepreneurId);

  if (!entrepreneur) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-muted-foreground">Empresario no encontrado</p>
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/entrepreneurs')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a la lista
        </Button>
      </div>
    );
  }

  const completedStages = new Set(entrepreneur.stages.map((s) => s.stageId));
  const earnedBadgeIds = new Set(entrepreneur.badges.map((b) => b.id));
  const availableBadgesToAward = AVAILABLE_BADGES.filter(
    (b) => !earnedBadgeIds.has(b.id),
  );
  const nextStageToCertify = STAGES.find((s) => !completedStages.has(s.id));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCertifyStage = (stageId: number) => {
    // TODO: wire to certify service
    console.log('Certify stage', stageId, 'for', entrepreneur.id);
    setCertifyDialogOpen(false);
    setSelectedStageId(null);
  };

  const handleAwardBadge = (badgeId: string) => {
    // TODO: wire to badge service
    console.log('Award badge', badgeId, 'to', entrepreneur.id);
    setIsBadgeDialogOpen(false);
  };

  const handleRemoveBadge = (badgeId: string) => {
    // TODO: wire to badge service
    console.log('Remove badge', badgeId, 'from', entrepreneur.id);
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 pb-4 border-b mb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/dashboard/entrepreneurs')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">
                  {entrepreneur.name}
                </h1>
                {entrepreneur.isDelinquent && (
                  <Badge variant="danger" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Moroso {entrepreneur.delinquentDays}d
                  </Badge>
                )}
                {entrepreneur.hasFunding && !entrepreneur.isDelinquent && (
                  <Badge variant="success" className="gap-1">
                    <Banknote className="h-3 w-3" />
                    {formatCurrency(entrepreneur.fundingAmount || 0)}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {entrepreneur.businessName}
                </span>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {entrepreneur.businessType}
                </span>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {entrepreneur.email}
                </span>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {entrepreneur.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Main CTA */}
          <AlertDialog
            open={certifyDialogOpen}
            onOpenChange={setCertifyDialogOpen}
          >
            <AlertDialogTrigger
              render={
                <Button
                  size="lg"
                  className="gap-2 shadow-lg bg-accent hover:bg-accent/90 text-accent-foreground"
                  disabled={!nextStageToCertify}
                  onClick={() =>
                    nextStageToCertify &&
                    setSelectedStageId(nextStageToCertify.id)
                  }
                >
                  <Shield className="h-5 w-5" />
                  {nextStageToCertify
                    ? `Aprobar Etapa ${nextStageToCertify.id}`
                    : 'Todas las etapas certificadas'}
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Aprobar Certificación - Etapa {selectedStageId}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción emitirá una credencial verificable en blockchain
                  certificando que {entrepreneur.name} ha completado la etapa
                  &quot;
                  {STAGES.find((s) => s.id === selectedStageId)?.name}&quot;.
                  Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    selectedStageId && handleCertifyStage(selectedStageId)
                  }
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Emitir Credencial
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-5 gap-6 min-h-0">
        {/* Left: Stages Timeline */}
        <div className="col-span-2 bg-card rounded-xl border p-5 overflow-auto">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Ruta de Apoyo
            </h2>
            <span className="text-sm text-muted-foreground">
              {entrepreneur.stages.length}/{STAGES.length}
            </span>
          </div>

          <div className="relative">
            {STAGES.map((stage, index) => {
              const isCompleted = completedStages.has(stage.id);
              const stageData = entrepreneur.stages.find(
                (s) => s.stageId === stage.id,
              );
              const isCurrent =
                stage.id === entrepreneur.currentStage && !isCompleted;
              const isLast = index === STAGES.length - 1;

              return (
                <div key={stage.id} className="relative flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`relative z-10 flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all ${
                        isCompleted
                          ? 'bg-[#10B981] border-[#10B981]'
                          : isCurrent
                            ? 'bg-[#F15A24] border-[#F15A24]'
                            : 'bg-background border-muted-foreground/30'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4 text-white" />
                      ) : isCurrent ? (
                        <Clock className="h-4 w-4 text-white" />
                      ) : (
                        <span className="h-3 w-3 rounded-full bg-muted-foreground/20" />
                      )}
                    </div>
                    {!isLast && (
                      <div
                        className={`w-0.5 flex-1 min-h-[3rem] ${
                          isCompleted
                            ? 'bg-[#10B981]'
                            : 'bg-muted-foreground/20'
                        }`}
                      />
                    )}
                  </div>

                  <div className={`flex-1 pb-6 ${isLast ? 'pb-0' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p
                          className={`font-medium text-sm ${
                            isCompleted || isCurrent
                              ? 'text-foreground'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {stage.id}. {stage.name}
                        </p>
                        {isCompleted && stageData ? (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(stageData.completedAt).toLocaleDateString(
                              'es-CO',
                            )}{' '}
                            - <span className="text-[#10B981]">Completado</span>
                          </p>
                        ) : isCurrent ? (
                          <p className="text-xs text-[#F15A24] mt-0.5">
                            En progreso
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Pendiente
                          </p>
                        )}
                      </div>
                      {!isCompleted && (
                        <AlertDialog>
                          <AlertDialogTrigger
                            render={
                              <Button
                                variant={isCurrent ? 'default' : 'ghost'}
                                size="sm"
                                className={`h-7 text-xs gap-1 ${isCurrent ? 'bg-accent hover:bg-accent/90 text-accent-foreground' : 'text-accent hover:text-accent'}`}
                              >
                                <Shield className="h-3 w-3" />
                                Certificar
                              </Button>
                            }
                          />
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Certificar Etapa {stage.id}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción emitirá una credencial verificable
                                certificando que {entrepreneur.name} ha
                                completado &quot;{stage.name}&quot;.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleCertifyStage(stage.id)}
                              >
                                Emitir Credencial
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Reputation Badges */}
        <div className="col-span-3 bg-card rounded-xl border p-5 overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Award className="h-4 w-4 text-[#F15A24]" />
              Insignias de Reputación
            </h2>
            <Dialog
              open={isBadgeDialogOpen}
              onOpenChange={setIsBadgeDialogOpen}
            >
              <DialogTrigger
                render={
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={availableBadgesToAward.length === 0}
                    className="gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Otorgar
                  </Button>
                }
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Otorgar Insignia</DialogTitle>
                  <DialogDescription>
                    Selecciona una insignia para {entrepreneur.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-2 py-4">
                  {availableBadgesToAward.map((badge) => (
                    <button
                      key={badge.id}
                      onClick={() => handleAwardBadge(badge.id)}
                      className="flex items-center gap-3 p-3 rounded-xl border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-all text-left"
                    >
                      <div
                        className={`h-10 w-10 rounded-xl bg-gradient-to-br ${getBadgeColors(badge.id).bg} flex items-center justify-center`}
                      >
                        {BADGE_ICONS[badge.id]}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{badge.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {badge.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
            {/* Earned Badges */}
            {entrepreneur.badges.map((badge) => {
              const colors = getBadgeColors(badge.id);
              return (
                <BadgeDetailDialog
                  key={badge.id}
                  badge={badge}
                  entrepreneurName={entrepreneur.name}
                >
                  <div
                    className={`group relative p-4 rounded-2xl bg-gradient-to-br ${colors.bg} border-2 ${colors.border} hover:shadow-xl ${colors.glow} transition-all duration-300 hover:scale-[1.03] text-center cursor-pointer`}
                  >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center shadow-lg">
                      <CheckCircle className="h-3 w-3 text-primary-foreground" />
                    </div>

                    <div
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveBadge(badge.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.stopPropagation();
                          handleRemoveBadge(badge.id);
                        }
                      }}
                      className="absolute top-1 left-1 p-1 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <X className="h-3 w-3" />
                    </div>

                    <div
                      className={`mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br ${colors.bg} border ${colors.border} flex items-center justify-center shadow-inner mb-2`}
                    >
                      {BADGE_ICONS_LARGE[badge.id]}
                    </div>
                    <p className="font-semibold text-sm">{badge.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Verificado
                    </p>
                  </div>
                </BadgeDetailDialog>
              );
            })}

            {/* Locked Badges */}
            {availableBadgesToAward.map((badge) => (
              <div
                key={badge.id}
                className="relative p-4 rounded-2xl bg-muted/30 border-2 border-dashed border-muted-foreground/20 text-center opacity-50"
              >
                <div className="absolute top-2 right-2">
                  <Lock className="h-3 w-3 text-muted-foreground" />
                </div>
                <div className="mx-auto h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-2">
                  {BADGE_ICONS_LARGE[badge.id]}
                </div>
                <p className="font-medium text-sm text-muted-foreground">
                  {badge.name}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Por desbloquear
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
