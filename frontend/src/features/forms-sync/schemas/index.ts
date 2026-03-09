import { z } from 'zod'

export const FormSourceSchema = z.object({
  externalFormId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  provider: z.string().default('google_forms'),
})

export type FormSourceInput = z.infer<typeof FormSourceSchema>
