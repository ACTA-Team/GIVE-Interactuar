export const ROUTES = {
  dashboard: '/dashboard',
  cursos: {
    list: '/dashboard/cursos',
    detail: (folderName: string) =>
      `/dashboard/cursos/${encodeURIComponent(folderName)}`,
  },
  entrepreneurs: {
    list: '/dashboard/entrepreneurs',
    detail: (id: string) => `/dashboard/entrepreneurs/${id}`,
    storage: '/dashboard/entrepreneurs/credentials',
  },
  credentials: {
    list: '/dashboard/credentials',
    new: '/dashboard/credentials/new',
    client: (entrepreneurId: string) =>
      `/dashboard/credentials/client/${entrepreneurId}`,
    detail: (id: string) => `/dashboard/credentials/${id}`,
  },
  verify: (credentialId: string) => `/verify/${credentialId}`,
  asistencia: (folderName: string, classNumber: number) =>
    `/asistencia/${encodeURIComponent(folderName)}/${classNumber}`,
} as const;
