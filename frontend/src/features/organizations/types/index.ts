export interface Organization {
  id: string
  name: string
  legalName: string | null
  documentType: string | null
  documentNumber: string | null
  email: string | null
  phone: string | null
  metadata: Record<string, unknown>
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface InternalUser {
  id: string
  authUserId: string | null
  organizationId: string
  fullName: string
  email: string
  role: 'admin' | 'operator' | 'viewer'
  active: boolean
  createdAt: string
  updatedAt: string
}
