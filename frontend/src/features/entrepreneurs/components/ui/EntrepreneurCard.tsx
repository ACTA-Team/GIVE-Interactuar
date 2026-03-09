import type { Entrepreneur } from '../../types';

interface EntrepreneurCardProps {
  entrepreneur: Entrepreneur;
  onClick?: (id: string) => void;
}

// TODO: add Link wrapper to ROUTES.entrepreneurs.detail(entrepreneur.id)
export function EntrepreneurCard({
  entrepreneur,
  onClick,
}: EntrepreneurCardProps) {
  return (
    <div
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
      onClick={() => onClick?.(entrepreneur.id)}
      role={onClick ? 'button' : undefined}
    >
      <p className="font-semibold text-gray-900">{entrepreneur.fullName}</p>
      <p className="mt-1 text-sm text-gray-500">
        {entrepreneur.documentType} {entrepreneur.documentNumber}
      </p>
      {entrepreneur.municipality && (
        <p className="mt-1 text-xs text-gray-400">
          {entrepreneur.municipality}
          {entrepreneur.department ? `, ${entrepreneur.department}` : ''}
        </p>
      )}
      {/* TODO: render Badge for active status */}
      {/* TODO: render business sector from businessProfile if present */}
    </div>
  );
}
