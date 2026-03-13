import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'destructive'
  | 'outline';

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700 border-gray-200',
  secondary: 'bg-secondary text-secondary-foreground border-secondary',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-warning/10 text-warning-foreground border-warning/30',
  danger: 'bg-destructive/10 text-destructive border-destructive/30',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  destructive: 'bg-destructive/10 text-destructive border-destructive/30',
  outline: 'bg-transparent border-border text-foreground',
};

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
