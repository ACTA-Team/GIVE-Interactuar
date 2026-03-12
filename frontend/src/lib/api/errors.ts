import { NextResponse } from 'next/server';

export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, unknown> | null;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export function badRequest(message: string, details?: Record<string, unknown>) {
  return NextResponse.json(
    {
      error: 'INVALID_PARAM',
      message,
      details: details ?? null,
    } satisfies ApiError,
    { status: 400 },
  );
}

export function notFound(message: string) {
  return NextResponse.json(
    { error: 'NOT_FOUND', message, details: null } satisfies ApiError,
    { status: 404 },
  );
}

export function serverError(message = 'Internal server error') {
  return NextResponse.json(
    { error: 'SERVER_ERROR', message, details: null } satisfies ApiError,
    { status: 500 },
  );
}

export function validatePaginationParams(
  searchParams: URLSearchParams,
): string | null {
  const page = searchParams.get('page');
  if (page !== null) {
    const n = parseInt(page, 10);
    if (isNaN(n) || n < 1) return 'page must be a positive integer';
  }
  const pageSize = searchParams.get('page_size');
  if (pageSize !== null) {
    const n = parseInt(pageSize, 10);
    if (isNaN(n) || n < 1) return 'page_size must be a positive integer';
  }
  return null;
}

export function validateUuidParam(
  searchParams: URLSearchParams,
  paramName: string,
): string | null {
  const value = searchParams.get(paramName);
  if (value !== null && !isValidUuid(value)) {
    return `${paramName} must be a valid UUID`;
  }
  return null;
}
