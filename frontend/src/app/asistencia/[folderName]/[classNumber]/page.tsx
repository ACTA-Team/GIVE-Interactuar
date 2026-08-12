import type { Metadata } from 'next';
import { AttendanceRegistrationPage } from '@/features/attendance-registration/components/pages/AttendanceRegistrationPage';

interface Props {
  params: Promise<{ folderName: string; classNumber: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { classNumber } = await params;
  return {
    title: `Confirmar asistencia · Clase ${classNumber}`,
  };
}

// Public page — no auth required.
export default async function Page({ params }: Props) {
  const { folderName, classNumber } = await params;
  return (
    <AttendanceRegistrationPage
      folderName={decodeURIComponent(folderName)}
      classNumber={classNumber}
    />
  );
}
