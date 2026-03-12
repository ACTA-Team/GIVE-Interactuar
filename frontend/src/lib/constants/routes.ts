export const ROUTES = {
  dashboard: '/dashboard',
  entrepreneurs: {
    list: '/dashboard/entrepreneurs',
    detail: (id: string) => `/dashboard/entrepreneurs/${id}`,
  },
  credentials: {
    list: '/dashboard/credentials',
    new: '/dashboard/credentials/new',
    client: (entrepreneurId: string) =>
      `/dashboard/credentials/client/${entrepreneurId}`,
    detail: (id: string) => `/dashboard/credentials/${id}`,
  },
  verify: (credentialId: string) => `/verify/${credentialId}`,
} as const;
