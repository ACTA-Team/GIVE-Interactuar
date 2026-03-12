'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { X, Loader2, AlertTriangle } from 'lucide-react';
import type { CredentialType } from '../../types';
import { CredentialTypeSelector } from './CredentialTypeSelector';
import { BehaviorCredentialForm } from './BehaviorCredentialForm';
import { ImpactCredentialForm } from './ImpactCredentialForm';
import { ProfileCredentialForm } from './ProfileCredentialForm';
import { CredentialIssuedSuccess } from './CredentialIssuedSuccess';
import { useIssueCredential } from '../../hooks/useIssueCredential';
import type { IssuanceStatus } from '../../hooks/useIssueCredential';
import type { BehaviorCredentialFormInput } from '../../schemas/behaviorCredentialSchema';
import type { ImpactCredentialFormInput } from '../../schemas/impactCredentialSchema';
import type { ProfileCredentialFormInput } from '../../schemas/profileCredentialSchema';
import { useEmpresarioPrefill } from '../../hooks/useEmpresarioPrefill';

type FormData =
  | BehaviorCredentialFormInput
  | ImpactCredentialFormInput
  | ProfileCredentialFormInput;

interface CredentialIssuanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entrepreneurId: string;
  entrepreneurName: string;
  businessName: string;
}

function Stepper({ currentStep }: { currentStep: number }) {
  const t = useTranslations('credentials');
  const steps = [
    { number: 1, label: t('issuance.steps.type') },
    { number: 2, label: t('issuance.steps.data') },
    { number: 3, label: t('issuance.steps.issued') },
  ];

  return (
    <div className="flex items-center gap-3">
      {steps.map((step, i) => {
        const isActive = step.number <= currentStep;
        const isCurrent = step.number === currentStep;
        return (
          <div key={step.number} className="flex items-center gap-2">
            {i > 0 && (
              <div
                className={cn(
                  'h-0.5 w-6 transition-colors',
                  step.number <= currentStep ? 'bg-white' : 'bg-white/30',
                )}
              />
            )}
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors',
                  isCurrent
                    ? 'bg-accent text-accent-foreground'
                    : isActive
                      ? 'bg-white/90 text-primary'
                      : 'bg-white/20 text-white/60',
                )}
              >
                {step.number}
              </span>
              <span
                className={cn(
                  'text-sm font-medium',
                  isActive ? 'text-white' : 'text-white/50',
                )}
              >
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function IssuingOverlay({ status }: { status: IssuanceStatus }) {
  const t = useTranslations('credentials');
  const tc = useTranslations('common');
  const labels: Record<IssuanceStatus, string> = {
    idle: '',
    connecting_wallet: t('issuance.statusLabels.connectingWallet'),
    building_payload: t('issuance.statusLabels.buildingPayload'),
    issuing: t('issuance.statusLabels.issuing'),
    success: '',
    error: '',
  };
  const label = labels[status];
  if (!label) return null;

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {tc('wallet.approveTransaction')}
        </p>
      </div>
    </div>
  );
}

export function CredentialIssuanceModal({
  open,
  onOpenChange,
  entrepreneurId,
  entrepreneurName,
  businessName,
}: CredentialIssuanceModalProps) {
  const t = useTranslations('credentials');
  const tc = useTranslations('common');
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<CredentialType | null>(null);
  const { data: empresarioPrefill } = useEmpresarioPrefill(entrepreneurId);

  const {
    issueCredential,
    status,
    error,
    result,
    reset: resetIssuance,
  } = useIssueCredential();

  const isIssuing =
    status === 'connecting_wallet' ||
    status === 'building_payload' ||
    status === 'issuing';

  const resetState = useCallback(() => {
    setStep(1);
    setSelectedType(null);
    resetIssuance();
  }, [resetIssuance]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && !isIssuing) {
        resetState();
      }
      if (!isIssuing) {
        onOpenChange(nextOpen);
      }
    },
    [onOpenChange, resetState, isIssuing],
  );

  const handleTypeSelect = (type: CredentialType) => {
    setSelectedType(type);
  };

  const handleContinueToData = () => {
    if (selectedType) setStep(2);
  };

  const handleFormSubmit = async (data: FormData) => {
    if (!selectedType) return;

    const issuanceResult = await issueCredential({
      credentialType: selectedType,
      formData: data,
      entrepreneurId,
      entrepreneurName,
      businessName,
    });

    if (issuanceResult) {
      setStep(3);
    }
  };

  const handleBack = () => {
    resetIssuance();
    setStep(1);
  };

  const handleClose = () => {
    handleOpenChange(false);
  };

  const handleRetry = () => {
    resetIssuance();
  };

  const impactDefaults = useMemo<
    Partial<ImpactCredentialFormInput> | undefined
  >(() => {
    if (!empresarioPrefill) return undefined;

    const sectorText = empresarioPrefill.sector ?? '';
    const normalizedSector = sectorText.toLowerCase();

    let mappedSector = '';
    if (normalizedSector.includes('alimento'))
      mappedSector = 'Alimentos y bebidas';
    else if (normalizedSector.includes('comercio')) mappedSector = 'Comercio';
    else if (normalizedSector.includes('manufactura'))
      mappedSector = 'Manufactura';
    else if (normalizedSector.includes('servicio')) mappedSector = 'Servicios';
    else if (normalizedSector.includes('tecno')) mappedSector = 'Tecnología';
    else if (normalizedSector.includes('agro')) mappedSector = 'Agropecuario';
    else if (normalizedSector.includes('textil'))
      mappedSector = 'Textil y confecciones';
    else if (normalizedSector.includes('turismo')) mappedSector = 'Turismo';
    else mappedSector = '';

    return {
      companyName: empresarioPrefill.company ?? '',
      sector: mappedSector,
      salesPreviousYear: empresarioPrefill.salesPrevYearCop ?? 0,
      salesCurrentYear: empresarioPrefill.salesCop ?? 0,
      newJobsCreated: empresarioPrefill.newJobs ?? 0,
    };
  }, [empresarioPrefill]);

  const behaviorDefaults = useMemo<
    Partial<BehaviorCredentialFormInput> | undefined
  >(() => {
    if (!empresarioPrefill) return undefined;

    const activeCreditValue = (
      empresarioPrefill.activeCredit ?? ''
    ).toLowerCase();
    const hasActiveCredit =
      activeCreditValue === 'si' ||
      activeCreditValue === 'sí' ||
      activeCreditValue === 'yes';

    return {
      activeCredit: {
        exists: hasActiveCredit,
      },
      averageSales: empresarioPrefill.salesCop ?? 0,
      newJobs: empresarioPrefill.newJobs ?? 0,
    };
  }, [empresarioPrefill]);

  const profileDefaults = useMemo<
    Partial<ProfileCredentialFormInput> | undefined
  >(() => {
    if (!empresarioPrefill) return undefined;

    const zoneText = (empresarioPrefill.residenceZone ?? '').toLowerCase();
    let zone: ProfileCredentialFormInput['zone'] = 'urban';
    if (zoneText.includes('rural')) zone = 'rural';
    else if (zoneText.includes('peri')) zone = 'periurban';

    const educationText = (empresarioPrefill.education ?? '').toLowerCase();
    let educationLevel: ProfileCredentialFormInput['educationLevel'] = 'other';
    if (educationText.includes('primaria')) educationLevel = 'primary';
    else if (
      educationText.includes('secundaria') ||
      educationText.includes('bachiller')
    )
      educationLevel = 'secondary';
    else if (
      educationText.includes('técnica') ||
      educationText.includes('tecnica') ||
      educationText.includes('tecnológica') ||
      educationText.includes('tecnologica')
    )
      educationLevel = 'technical';
    else if (educationText.includes('profesional'))
      educationLevel = 'undergraduate';
    else if (
      educationText.includes('maestr') ||
      educationText.includes('doctor') ||
      educationText.includes('especializ')
    )
      educationLevel = 'postgraduate';

    const sizeText = (empresarioPrefill.companySize ?? '').toLowerCase();
    let companySize: ProfileCredentialFormInput['companySize'] = 'micro';
    if (sizeText.includes('micro')) companySize = 'micro';
    else if (sizeText.includes('peque')) companySize = 'small';
    else if (sizeText.includes('mediana')) companySize = 'medium';
    else if (sizeText.includes('gran')) companySize = 'large';

    const hasLegalEntity = !!empresarioPrefill.legalEntity;

    return {
      municipality: empresarioPrefill.municipality ?? '',
      zone,
      educationLevel,
      formalizedBusiness: hasLegalEntity,
      companySize,
    };
  }, [empresarioPrefill]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-2xl p-0 gap-0 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-(--color-brand-blue,#0B1F3F) px-6 py-4 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold">{t('issuance.modalTitle')}</h2>
              <p className="text-sm text-white/70">
                {entrepreneurName} &middot; {businessName}
              </p>
            </div>
            <DialogClose
              render={
                <button
                  type="button"
                  disabled={isIssuing}
                  className="rounded-md p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              }
            />
          </div>
          <div className="mt-4">
            <Stepper currentStep={step} />
          </div>
        </div>

        {/* Content */}
        <div className="relative max-h-[60vh] overflow-y-auto px-6 py-5">
          {isIssuing && <IssuingOverlay status={status} />}

          {step === 1 && (
            <div className="space-y-6">
              <CredentialTypeSelector
                selected={selectedType}
                onSelect={handleTypeSelect}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleContinueToData}
                  disabled={!selectedType}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  {tc('buttons.continue')} &rarr;
                </Button>
              </div>
            </div>
          )}

          {step === 2 && selectedType === 'behavior' && (
            <BehaviorCredentialForm
              onSubmit={handleFormSubmit}
              onBack={handleBack}
              defaultValues={behaviorDefaults}
            />
          )}

          {step === 2 && selectedType === 'impact' && (
            <ImpactCredentialForm
              onSubmit={handleFormSubmit}
              onBack={handleBack}
              defaultValues={impactDefaults}
            />
          )}

          {step === 2 && selectedType === 'profile' && (
            <ProfileCredentialForm
              onSubmit={handleFormSubmit}
              onBack={handleBack}
              defaultValues={profileDefaults}
            />
          )}

          {step === 2 && status === 'error' && error && (
            <div className="mt-4 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">
                  {t('issuance.errorTitle')}
                </p>
                <p className="mt-1 text-xs text-destructive/80">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="mt-3"
                >
                  {tc('buttons.retry')}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && selectedType && (
            <CredentialIssuedSuccess
              credentialType={selectedType}
              entrepreneurName={entrepreneurName}
              businessName={businessName}
              vcId={result?.vcId ?? null}
              txId={result?.txId ?? null}
              issuerAddress={result?.issuerAddress ?? null}
              onClose={handleClose}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
