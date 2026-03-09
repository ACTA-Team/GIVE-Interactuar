import type { EntrepreneurRepository } from '../repositories/entrepreneurRepository'
import type { Entrepreneur, EntrepreneurFilters } from '../types'

export function createEntrepreneurService(repo: EntrepreneurRepository) {
  return {
    async list(filters?: EntrepreneurFilters): Promise<Entrepreneur[]> {
      // TODO: add pagination (offset/limit or cursor-based)
      // TODO: add caching strategy if needed
      return repo.findAll(filters)
    },

    async getById(id: string): Promise<Entrepreneur | null> {
      // TODO: throw NotFoundError if null, once error types are defined
      return repo.findById(id)
    },
  }
}

export type EntrepreneurService = ReturnType<typeof createEntrepreneurService>
