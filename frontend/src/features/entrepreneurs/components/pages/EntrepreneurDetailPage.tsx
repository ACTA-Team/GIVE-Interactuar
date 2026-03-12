'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
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
import { ArrowLeft, Shield, Mail, Phone, Building2, Banknote, AlertTriangle } from 'lucide-react';
import { STAGES } from '../../types/stages';
import { useDashboardEntrepreneur } from '../../hooks/useDashboardEntrepreneurs';
import { CredentialIssuanceModal } from '@/features/credentials/components/ui/CredentialIssuanceModal';
import { IconCertificate } from '@tabler/icons-react';

interface EntrepreneurDetailPageProps {
  entrepreneurId: string;
}

export function EntrepreneurDetailPage({
  entrepreneurId,
}: EntrepreneurDetailPageProps) {
  const router = useRouter();
  const t = useTranslations('entrepreneurs');
  const tc = useTranslations('common');
  const [certifyDialogOpen, setCertifyDialogOpen] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);
  const [isCredentialModalOpen, setIsCredentialModalOpen] = useState(false);

  const { data: entrepreneur } = useDashboardEntrepreneur(entrepreneurId);

  if (!entrepreneur) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-muted-foreground">{t('notFound')}</p>
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/entrepreneurs')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('backToList')}
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
      <div className="shrink-0 pb-4 border-b mb-4">
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
                    {t('table.delinquent', {
                      days: entrepreneur.delinquentDays ?? 0,
                    })}
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
              {t('detail.issueCredential')}
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
                      ? t('detail.approveStage', { id: nextStageToCertify.id })
                      : t('detail.allStagesCertified')}
                  </Button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t('detail.certifyStageApproveTitle', {
                      id: selectedStageId ?? 0,
                    })}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('detail.certifyStageDesc', {
                      name: entrepreneur.name,
                      stageName:
                        STAGES.find((s) => s.id === selectedStageId)?.name ??
                        '',
                    })}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{tc('buttons.cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      selectedStageId && handleCertifyStage(selectedStageId)
                    }
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    {t('detail.issueCredential')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
