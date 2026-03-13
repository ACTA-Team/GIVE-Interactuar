import React from 'react';
import { BarChart3, GraduationCap, Activity, UserCheck } from 'lucide-react';

export type CredentialTypeId = 'impact' | 'mba' | 'behavior' | 'profile';

export type CredentialTypeConfig = {
  id: CredentialTypeId;
  /** Translation key under credentials.vault (e.g. 'impact', 'behavior', 'profile'). Use 'mba' for MBA. */
  labelKey: string;
  icon: React.ReactNode;
  /** Base (unselected) insignia: soft background, colored border, dark text */
  colorClasses: string;
  /** Selected state: filled background, stronger border, white text, shadow */
  activeClasses: string;
};

const iconClassName = 'h-4.5 w-4.5';

export const CREDENTIAL_TYPE_CONFIG: Record<
  CredentialTypeId,
  CredentialTypeConfig
> = {
  impact: {
    id: 'impact',
    labelKey: 'impact',
    icon: <BarChart3 className={iconClassName} />,
    colorClasses:
      'bg-transparent text-blue-700 dark:text-blue-300 border-2 border-blue-200 dark:border-blue-600',
    activeClasses:
      'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 border-2 border-blue-200 dark:border-blue-500 shadow-sm',
  },
  mba: {
    id: 'mba',
    labelKey: 'mba',
    icon: <GraduationCap className={iconClassName} />,
    colorClasses:
      'bg-transparent text-emerald-700 dark:text-emerald-300 border-2 border-emerald-200 dark:border-emerald-600',
    activeClasses:
      'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-200 border-2 border-emerald-200 dark:border-emerald-500 shadow-sm',
  },
  behavior: {
    id: 'behavior',
    labelKey: 'behavior',
    icon: <Activity className={iconClassName} />,
    colorClasses:
      'bg-transparent text-amber-700 dark:text-amber-300 border-2 border-amber-200 dark:border-amber-600',
    activeClasses:
      'bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-200 border-2 border-amber-200 dark:border-amber-500 shadow-sm',
  },
  profile: {
    id: 'profile',
    labelKey: 'profile',
    icon: <UserCheck className={iconClassName} />,
    colorClasses:
      'bg-transparent text-violet-700 dark:text-violet-300 border-2 border-violet-200 dark:border-violet-600',
    activeClasses:
      'bg-violet-50 dark:bg-violet-900/40 text-violet-700 dark:text-violet-200 border-2 border-violet-200 dark:border-violet-500 shadow-sm',
  },
};

export const CREDENTIAL_TYPE_IDS: CredentialTypeId[] = [
  'impact',
  'mba',
  'behavior',
  'profile',
];
