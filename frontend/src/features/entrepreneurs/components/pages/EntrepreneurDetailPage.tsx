'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
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
  Clock,
  Mail,
  Phone,
  Building2,
  Banknote,
  AlertTriangle,
} from 'lucide-react';
import { STAGES } from '../../types/stages';
import { MOCK_ENTREPRENEURS } from '../../data/mock-entrepreneurs';
import { CredentialIssuanceModal } from '@/features/credentials/components/ui/CredentialIssuanceModal';
import { IconCertificate } from '@tabler/icons-react';

interface EntrepreneurDetailPageProps {
  entrepreneurId: string;
}

export function EntrepreneurDetailPage({
  entrepreneurId,
}: EntrepreneurDetailPageProps) {
  const router = useRouter();
  const [certifyDialogOpen, setCertifyDialogOpen] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);
  const [isCredentialModalOpen, setIsCredentialModalOpen] = useState(false);

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

          {/* Main CTAs */}
          <div className="flex items-center gap-2">
            <Button
              size="lg"
              variant="outline"
              className="gap-2"
              onClick={() => setIsCredentialModalOpen(true)}
            >
              <IconCertificate className="h-5 w-5" />
              Emitir Credencial
            </Button>
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
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
        {/* Stages Timeline */}
        <div className="bg-card rounded-xl border p-5 overflow-auto">
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
                      className={`relative z-10 shrink-0 h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all ${
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
                        className={`w-0.5 flex-1 min-h-12 ${
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

      </div>

      <CredentialIssuanceModal
        open={isCredentialModalOpen}
        onOpenChange={setIsCredentialModalOpen}
        entrepreneurId={entrepreneur.id}
        entrepreneurName={entrepreneur.name}
        businessName={entrepreneur.businessName}
      />
    </div>
  );
}
