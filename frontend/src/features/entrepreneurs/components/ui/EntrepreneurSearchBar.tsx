'use client';

// TODO: wire to URL search params (useSearchParams + router.replace) for shareable filters
interface EntrepreneurSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function EntrepreneurSearchBar({
  onSearch,
  placeholder = 'Buscar por nombre, documento...',
}: EntrepreneurSearchBarProps) {
  return (
    <input
      type="search"
      placeholder={placeholder}
      className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      onChange={(e) => onSearch(e.target.value)}
    />
  );
}
