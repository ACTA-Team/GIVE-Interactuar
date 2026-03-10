import type { CreditLevel, Entrepreneur } from '../../types';

interface EntrepreneurCardProps {
  entrepreneur: Entrepreneur;
  onClick?: (id: string) => void;
}

const CREDIT_LEVEL_STYLES: Record<CreditLevel, string> = {
  bajo: 'bg-red-100 text-red-700',
  medio: 'bg-yellow-100 text-yellow-700',
  alto: 'bg-blue-100 text-blue-700',
  excelente: 'bg-green-100 text-green-700',
};

// TODO: add Link wrapper to ROUTES.entrepreneurs.detail(entrepreneur.id)
export function EntrepreneurCard({
  entrepreneur,
  onClick,
}: EntrepreneurCardProps) {
  const creditLevel = entrepreneur.financialProfile?.creditLevel;

  return (
    <div
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
      onClick={() => onClick?.(entrepreneur.id)}
      role={onClick ? 'button' : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-gray-900">{entrepreneur.fullName}</p>
        {creditLevel && (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${CREDIT_LEVEL_STYLES[creditLevel]}`}
          >
            {creditLevel}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-gray-500">
        {entrepreneur.documentType} {entrepreneur.documentNumber}
      </p>
      {entrepreneur.municipality && (
        <p className="mt-1 text-xs text-gray-400">
          {entrepreneur.municipality}
          {entrepreneur.department ? `, ${entrepreneur.department}` : ''}
        </p>
      )}
      {/* TODO: render business sector from businessProfile if present */}
    </div>
  );
}
