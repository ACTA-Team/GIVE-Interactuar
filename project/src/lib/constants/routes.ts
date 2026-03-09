export const ROUTES = {
  dashboard: '/dashboard',
  entrepreneurs: {
    list: '/dashboard/entrepreneurs',
    detail: (id: string) => `/dashboard/entrepreneurs/${id}`,
  },
  credentials: {
    list: '/dashboard/credentials',
    new: '/dashboard/credentials/new',
    detail: (id: string) => `/dashboard/credentials/${id}`,
  },
  wallets: '/dashboard/wallets',
  vaults: '/dashboard/vaults',
  verify: (credentialId: string) => `/verify/${credentialId}`,
} as const
