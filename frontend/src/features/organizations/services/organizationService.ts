import type { OrganizationRepository } from '../repositories/organizationRepository'
import type { Organization, InternalUser } from '../types'

export function createOrganizationService(repo: OrganizationRepository) {
  return {
    async getById(id: string): Promise<Organization | null> {
      return repo.findById(id)
    },

    async resolveCurrentUser(authUserId: string): Promise<InternalUser | null> {
      // TODO: cache this per request to avoid repeated DB hits
      return repo.findUserByAuthId(authUserId)
    },
  }
}

export type OrganizationService = ReturnType<typeof createOrganizationService>
