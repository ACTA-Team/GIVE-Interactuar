export interface PaginationMeta {
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export function parsePagination(
  searchParams: URLSearchParams,
  defaults: { pageSize?: number; maxPageSize?: number } = {},
): PaginationParams {
  const { pageSize: defaultSize = 50, maxPageSize = 200 } = defaults;
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const pageSize = Math.min(
    maxPageSize,
    Math.max(1, parseInt(searchParams.get('page_size') ?? String(defaultSize), 10) || defaultSize),
  );
  return { page, pageSize };
}

export function buildMeta(total: number, params: PaginationParams): PaginationMeta {
  return {
    total,
    page: params.page,
    page_size: params.pageSize,
    has_next: params.page * params.pageSize < total,
  };
}

export function paginationRange(params: PaginationParams): { from: number; to: number } {
  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;
  return { from, to };
}
