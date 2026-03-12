'use client';

import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import type { CredentialType } from '../../types';
import { CredentialTypeSelector } from './CredentialTypeSelector';
import { BehaviorCredentialForm } from './BehaviorCredentialForm';
import { ImpactCredentialForm } from './ImpactCredentialForm';
import { ProfileCredentialForm } from './ProfileCredentialForm';
import { CredentialIssuedSuccess } from './CredentialIssuedSuccess';
import type { BehaviorCredentialFormInput } from '../../schemas/behaviorCredentialSchema';
import type { ImpactCredentialFormInput } from '../../schemas/impactCredentialSchema';
import type { ProfileCredentialFormInput } from '../../schemas/profileCredentialSchema';

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

const STEPS = [
  { number: 1, label: 'Tipo' },
  { number: 2, label: 'Datos' },
  { number: 3, label: 'Emitida' },
] as const;

function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-3">
      {STEPS.map((step, i) => {
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

export function CredentialIssuanceModal({
  open,
  onOpenChange,
  entrepreneurId,
  entrepreneurName,
  businessName,
}: CredentialIssuanceModalProps) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<CredentialType | null>(null);
  const [, setFormData] = useState<FormData | null>(null);

  const resetState = useCallback(() => {
    setStep(1);
    setSelectedType(null);
    setFormData(null);
  }, []);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) resetState();
      onOpenChange(nextOpen);
    },
    [onOpenChange, resetState],
  );

  const handleTypeSelect = (type: CredentialType) => {
    setSelectedType(type);
  };

  const handleContinueToData = () => {
    if (selectedType) setStep(2);
  };

  const handleFormSubmit = (data: FormData) => {
    setFormData(data);

    // TODO: ACTA integration
    // 1. Build W3C VC 2.0 payload from form data
    // 2. Call useCredential().issue() with the payload
    // 3. Store the credential in the database
    // 4. On success, transition to step 3

    void entrepreneurId;
    setStep(3);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleClose = () => {
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-2xl p-0 gap-0 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-[var(--color-brand-blue,#0B1F3F)] px-6 py-4 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold">
                Emitir Credencial Verificable
              </h2>
              <p className="text-sm text-white/70">
                {entrepreneurName} &middot; {businessName}
              </p>
            </div>
            <DialogClose
              render={
                <button
                  type="button"
                  className="rounded-md p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
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
        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
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
                  Continuar &rarr;
                </Button>
              </div>
            </div>
          )}

          {step === 2 && selectedType === 'behavior' && (
            <BehaviorCredentialForm
              onSubmit={handleFormSubmit}
              onBack={handleBack}
            />
          )}

          {step === 2 && selectedType === 'impact' && (
            <ImpactCredentialForm
              onSubmit={handleFormSubmit}
              onBack={handleBack}
            />
          )}

          {step === 2 && selectedType === 'profile' && (
            <ProfileCredentialForm
              onSubmit={handleFormSubmit}
              onBack={handleBack}
            />
          )}

          {step === 3 && selectedType && (
            <CredentialIssuedSuccess
              credentialType={selectedType}
              entrepreneurName={entrepreneurName}
              businessName={businessName}
              onClose={handleClose}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
