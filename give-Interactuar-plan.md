# GIVE-Interactuar Platform

> Stellar-first verifiable credentials platform for entrepreneurs.
> Arquitectura feature-based sobre Next.js 16 + Supabase + Soroban.

---

## Constraints generales

- `supabase/` va dentro de `project/`
- Solo se actualiza `package.json` (sin npm install por ahora)
- Sin lógica de negocio — solo scaffold tipado con TODOs
- Sin EVM/multichain — Stellar es first-class
- Separación estricta: no `fetch` en componentes, no lógica on-chain en formularios
- TypeScript strict mode en todo el proyecto

---

## Progress overview

- [x] Phase 0 — Dependencies
- [x] Phase 1 — Lib layer
- [ ] Phase 2 — Feature modules
- [ ] Phase 3 — Shared components
- [ ] Phase 4 — App Router pages
- [ ] Phase 5 — Supabase CLI setup
- [ ] Phase 6 — Project config & providers

---

## Phase 0 — Dependencies

> Actualizar `project/package.json` con los paquetes necesarios. No correr install todavía.

- [x] Agregar `@supabase/supabase-js`
- [x] Agregar `@supabase/ssr`
- [x] Agregar `zod`
- [x] Agregar `react-hook-form`
- [x] Agregar `@hookform/resolvers`
- [x] Agregar `@tanstack/react-query`
- [ ] Agregar `@stellar/stellar-sdk` _(pendiente — Stellar aún no necesario)_
- [ ] Agregar `@creit-tech/stellar-wallets-kit` _(pendiente — Stellar aún no necesario)_

---

## Phase 1 — Lib layer (`project/src/lib/`)

### Supabase clients
- [x] `lib/supabase/client.ts` — browser client (anon key)
- [x] `lib/supabase/server.ts` — server client (service role)
- [x] `lib/supabase/middleware.ts` — middleware client
- [x] `lib/supabase/database.types.ts` — placeholder generado por CLI

### Constants
- [x] `lib/constants/stellar.ts` — network constants, contract IDs
- [x] `lib/constants/routes.ts` — app route constants

### Helpers
- [x] `lib/helpers/date.ts` — helpers de fecha (format, parse, etc.)

### Services
- [x] `lib/services/googleFormsClient.ts` — Google Forms API client (no fetch en componentes)

### Orchestrator
- [x] `lib/orchestrator/issuanceOrchestrator.ts` — coordina el flujo de emisión de credenciales

---

## Phase 2 — Feature modules (`project/src/features/`)

### `entrepreneurs/`
- [ ] `types/index.ts`
- [ ] `schemas/index.ts` (Zod)
- [ ] `mappers/entrepreneurMapper.ts`
- [ ] `repositories/entrepreneurRepository.ts`
- [ ] `services/entrepreneurService.ts`
- [ ] `hooks/useEntrepreneurs.ts`
- [ ] `hooks/useEntrepreneurDetail.ts`
- [ ] `components/pages/EntrepreneursListPage.tsx`
- [ ] `components/pages/EntrepreneurDetailPage.tsx`
- [ ] `components/ui/EntrepreneurCard.tsx`
- [ ] `components/ui/EntrepreneurSearchBar.tsx`

### `forms-sync/`
- [ ] `types/index.ts`
- [ ] `schemas/index.ts`
- [ ] `mappers/formsResponseMapper.ts`
- [ ] `repositories/formsSyncRepository.ts`
- [ ] `services/formsSyncService.ts`

### `credentials/`
- [ ] `types/index.ts`
- [ ] `schemas/index.ts`
- [ ] `mappers/credentialMapper.ts`
- [ ] `repositories/credentialRepository.ts`
- [ ] `services/credentialService.ts`
- [ ] `hooks/useCredentials.ts`
- [ ] `hooks/useIssuanceDraft.ts`
- [ ] `components/pages/CredentialsListPage.tsx`
- [ ] `components/pages/CredentialDetailPage.tsx`
- [ ] `components/pages/CredentialIssuancePage.tsx`
- [ ] `components/ui/CredentialCard.tsx`
- [ ] `components/ui/IssuanceForm.tsx`

### `stellar/`
- [ ] `types/index.ts`
- [ ] `schemas/index.ts`
- [ ] `utils/sorobanHelpers.ts`
- [ ] `services/stellarService.ts`
- [ ] `services/vcVaultService.ts`

### `wallets/`
- [ ] `types/index.ts`
- [ ] `schemas/index.ts`
- [ ] `repositories/walletRepository.ts`
- [ ] `services/walletService.ts`
- [ ] `hooks/useWallets.ts`
- [ ] `components/pages/WalletsPage.tsx`
- [ ] `components/ui/WalletCard.tsx`

### `vaults/`
- [ ] `types/index.ts`
- [ ] `schemas/index.ts`
- [ ] `repositories/vaultRepository.ts`
- [ ] `services/vaultService.ts`
- [ ] `hooks/useVaults.ts`
- [ ] `components/pages/VaultsPage.tsx`
- [ ] `components/ui/VaultCard.tsx`

### `organizations/`
- [ ] `types/index.ts`
- [ ] `repositories/organizationRepository.ts`
- [ ] `services/organizationService.ts`

### `verification/`
- [ ] `types/index.ts`
- [ ] `services/verificationService.ts`
- [ ] `hooks/useVerification.ts`
- [ ] `components/pages/VerificationPage.tsx`
- [ ] `components/ui/VerificationResult.tsx`

### `dashboard/`
- [ ] `components/pages/DashboardPage.tsx`
- [ ] `components/ui/StatsCard.tsx`

---

## Phase 3 — Shared components (`project/src/components/`)

- [ ] `ui/Button.tsx`
- [ ] `ui/Badge.tsx`
- [ ] `layout/DashboardLayout.tsx`
- [ ] `layout/Sidebar.tsx`

---

## Phase 4 — App Router pages (`project/src/app/`)

- [ ] `(dashboard)/layout.tsx`
- [ ] `(dashboard)/dashboard/page.tsx`
- [ ] `(dashboard)/dashboard/entrepreneurs/page.tsx`
- [ ] `(dashboard)/dashboard/entrepreneurs/[id]/page.tsx`
- [ ] `(dashboard)/dashboard/credentials/page.tsx`
- [ ] `(dashboard)/dashboard/credentials/new/page.tsx`
- [ ] `(dashboard)/dashboard/credentials/[id]/page.tsx`
- [ ] `(dashboard)/dashboard/wallets/page.tsx`
- [ ] `(dashboard)/dashboard/vaults/page.tsx`
- [ ] `verify/[credentialId]/page.tsx`
- [ ] `api/cron/forms-sync/route.ts`
- [ ] Actualizar `app/layout.tsx` con `QueryClientProvider`

---

## Phase 5 — Supabase CLI setup (`project/supabase/`)

- [ ] `config.toml`
- [ ] `seed.sql`
- [ ] `migrations/20240101000000_init.sql` — copiar contenido de `supabase-schema.sql`
- [ ] `functions/forms-sync/index.ts` — edge function scaffold

---

## Phase 6 — Project config & providers

- [ ] `project/.env.local.example` — variables de entorno documentadas
- [ ] Actualizar `project/src/app/layout.tsx` con TanStack Query provider

---

## Verification checklist

Luego de completar todas las fases:

- [ ] `cd project && npx tsc --noEmit` pasa sin errores (tras instalar deps)
- [ ] Todos los imports usan alias `@/` (configurado en `tsconfig.json`)
- [ ] Ningún componente importa `fetch()` directamente
- [ ] Ningún componente importa el cliente de Supabase directamente
- [ ] Edge function scaffold existe en `project/supabase/functions/forms-sync/index.ts`

---

## Notes

- Los `repositories` encapsulan queries de Supabase — única capa que toca el cliente.
- Los `services` orquestan lógica entre repositorios y clientes externos — sin side effects de UI.
- Los `hooks` usan TanStack Query para data fetching — única fuente de estado del servidor en el cliente.
- Los page components (`pages/`) solo componen feature components — sin lógica directa.
- `issuanceOrchestrator` es el único punto que coordina Supabase + Stellar en el flujo de emisión.
