import type { Entrepreneur } from '../../types';
import { EntrepreneurCard } from '../ui/EntrepreneurCard';

interface EntrepreneursListPageProps {
  entrepreneurs: Entrepreneur[];
}

// Data is fetched server-side in app/(dashboard)/dashboard/entrepreneurs/page.tsx
// TODO: add EntrepreneurSearchBar with URL-param-driven filters
// TODO: add empty state when list is empty
// TODO: add pagination controls
export function EntrepreneursListPage({
  entrepreneurs,
}: EntrepreneursListPageProps) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Emprendedores</h1>
        {/* TODO: add "Nuevo emprendedor" button */}
      </div>

      {/* TODO: add EntrepreneurSearchBar here */}

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {entrepreneurs.map((e) => (
          <EntrepreneurCard key={e.id} entrepreneur={e} />
        ))}
      </div>
    </div>
  );
}
