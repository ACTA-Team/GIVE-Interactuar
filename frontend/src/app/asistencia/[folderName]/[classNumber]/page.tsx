import type { Metadata } from 'next';

interface Props {
  params: Promise<{ folderName: string; classNumber: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { classNumber } = await params;
  return {
    title: `Confirmar asistencia · Clase ${classNumber}`,
  };
}

// Public page — no auth required. Placeholder only: attendance confirmation
// is out of scope for this pass, this just reserves the route students'
// links will point to.
export default async function Page() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background p-6 text-center">
      <p className="text-muted-foreground">
        Esta página estará disponible próximamente.
      </p>
    </main>
  );
}
