'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  showingLabel: string;
  rightSlot?: React.ReactNode;
  /** When set, uses Link navigation (server-side) instead of onPageChange */
  useServerNavigation?: boolean;
}

const buttonBase =
  'flex h-8 w-8 items-center justify-center rounded-md border text-sm font-medium transition-colors';
const buttonActive =
  'border-primary bg-primary text-primary-foreground';
const buttonInactive = 'border-border hover:bg-muted';
const buttonDisabled =
  'disabled:pointer-events-none disabled:opacity-40';

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showingLabel,
  rightSlot,
  useServerNavigation = false,
}: PaginationProps) {
  const pathname = usePathname();

  const pair: number[] =
    currentPage < totalPages
      ? [currentPage, currentPage + 1]
      : totalPages > 1
        ? [currentPage - 1, currentPage]
        : [currentPage];

  const showEllipsis =
    totalPages > 1 && pair[pair.length - 1] < totalPages;

  const buildHref = (page: number) =>
    `${pathname}?page=${page}`;

  const prevPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(totalPages, currentPage + 1);

  const PrevButton = useServerNavigation ? (
    currentPage === 1 ? (
      <span
        className={`${buttonBase} border-border ${buttonDisabled} opacity-40`}
        aria-hidden
      >
        <ChevronLeft className="h-4 w-4" />
      </span>
    ) : (
      <Link
        href={buildHref(prevPage)}
        className={`${buttonBase} ${buttonInactive}`}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>
    )
  ) : (
    <button
      onClick={() => onPageChange?.(prevPage)}
      disabled={currentPage === 1}
      className={`${buttonBase} border-border ${buttonInactive} ${buttonDisabled}`}
      aria-label="Previous page"
    >
      <ChevronLeft className="h-4 w-4" />
    </button>
  );

  const NextButton = useServerNavigation ? (
    currentPage === totalPages ? (
      <span
        className={`${buttonBase} border-border ${buttonDisabled} opacity-40`}
        aria-hidden
      >
        <ChevronRight className="h-4 w-4" />
      </span>
    ) : (
      <Link
        href={buildHref(nextPage)}
        className={`${buttonBase} ${buttonInactive}`}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    )
  ) : (
    <button
      onClick={() => onPageChange?.(nextPage)}
      disabled={currentPage === totalPages}
      className={`${buttonBase} border-border ${buttonInactive} ${buttonDisabled}`}
      aria-label="Next page"
    >
      <ChevronRight className="h-4 w-4" />
    </button>
  );

  const PageButton = ({ page }: { page: number }) => {
    const isActive = currentPage === page;
    if (useServerNavigation) {
      return (
        <Link
          href={buildHref(page)}
          className={`${buttonBase} ${isActive ? buttonActive : buttonInactive}`}
          aria-label={`Page ${page}`}
        >
          {page}
        </Link>
      );
    }
    return (
      <button
        onClick={() => onPageChange?.(page)}
        className={`${buttonBase} ${isActive ? buttonActive : buttonInactive}`}
        aria-label={`Page ${page}`}
      >
        {page}
      </button>
    );
  };

  const LastPageButton = useServerNavigation ? (
    <Link
      href={buildHref(totalPages)}
      className={`${buttonBase} ${buttonInactive}`}
      aria-label={`Page ${totalPages}`}
    >
      {totalPages}
    </Link>
  ) : (
    <button
      onClick={() => onPageChange?.(totalPages)}
      className={`${buttonBase} ${buttonInactive}`}
      aria-label={`Page ${totalPages}`}
    >
      {totalPages}
    </button>
  );

  return (
    <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
      <p>{showingLabel}</p>

      <div className="flex items-center gap-1">
        {PrevButton}

        {pair.map((page) => (
          <PageButton key={page} page={page} />
        ))}
        {showEllipsis && (
          <>
            <span className="flex h-8 items-center justify-center px-1 text-muted-foreground">
              …
            </span>
            {LastPageButton}
          </>
        )}

        {NextButton}
      </div>

      <div className="min-w-[120px] flex justify-end">{rightSlot}</div>
    </div>
  );
}
