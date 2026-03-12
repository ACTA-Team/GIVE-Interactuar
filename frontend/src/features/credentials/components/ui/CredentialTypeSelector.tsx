'use client';

import { cn } from '@/lib/utils';
import {
  IconTrendingUp,
  IconShieldCheck,
  IconIdBadge2,
} from '@tabler/icons-react';
import type { CredentialType } from '../../types';
import {
  CREDENTIAL_TYPE_LABELS,
  CREDENTIAL_TYPE_DESCRIPTIONS,
} from '../../types';

const TYPE_CONFIG: Record<
  CredentialType,
  { icon: React.ReactNode; iconBg: string; iconColor: string }
> = {
  impact: {
    icon: <IconTrendingUp className="h-6 w-6" />,
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-500',
  },
  behavior: {
    icon: <IconShieldCheck className="h-6 w-6" />,
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
  },
  profile: {
    icon: <IconIdBadge2 className="h-6 w-6" />,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
};

const TYPES: CredentialType[] = ['impact', 'behavior', 'profile'];

interface CredentialTypeSelectorProps {
  selected: CredentialType | null;
  onSelect: (type: CredentialType) => void;
}

export function CredentialTypeSelector({
  selected,
  onSelect,
}: CredentialTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-muted-foreground">
        Selecciona el tipo de credencial a emitir:
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {TYPES.map((type) => {
          const config = TYPE_CONFIG[type];
          const isSelected = selected === type;

          return (
            <button
              key={type}
              type="button"
              onClick={() => onSelect(type)}
              className={cn(
                'flex flex-col items-start gap-3 rounded-xl border-2 p-4 text-left transition-all hover:shadow-md',
                isSelected
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border bg-card hover:border-muted-foreground/30',
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg',
                  config.iconBg,
                  config.iconColor,
                )}
              >
                {config.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {CREDENTIAL_TYPE_LABELS[type]}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {CREDENTIAL_TYPE_DESCRIPTIONS[type]}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
