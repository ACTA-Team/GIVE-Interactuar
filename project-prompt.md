# Prompt para Claude

---

```txt
Quiero que actúes como un Staff Fullstack Engineer y Software Architect especializado en:

- Next.js (App Router)
- TypeScript
- Supabase
- PostgreSQL
- Stellar / Soroban
- Clean Architecture
- Feature-based architecture
- DRY
- Modularización estricta
- Domain-driven design pragmático

Necesito que diseñes y scaffoldees la arquitectura base de un proyecto fullstack usando:

- Next.js (App Router)
- TypeScript
- Supabase (Postgres + Auth + Storage)
- TailwindCSS
- Zod
- React Hook Form
- TanStack Query
- Stellar Wallet Kit o integración equivalente para Stellar wallets
- Soroban contract integration layer
- Feature-based architecture

IMPORTANTE:
NO quiero la implementación completa.
NO quiero código final de negocio cerrado.
Quiero scaffolding real con TODOs bien pensados dentro del código,
dejando la base lista para que luego yo implemente.

Cada archivo debe tener:
- responsabilidad clara
- types/interfaces
- contratos de funciones
- comentarios TODO accionables
- separación limpia entre UI, dominio, aplicación e infraestructura cuando aplique

No inventes lógica innecesaria.
No agregues mocks si no hacen falta.
No mezcles UI con acceso a datos.
No mezcles lógica on-chain con componentes React.
No pongas fetch() dentro de componentes.
No dupliques tipos.

## Contexto del producto

Estamos construyendo una plataforma centrada completamente en Stellar para emitir
credenciales verificables sobre empresarios.

Flujo del negocio:

1. Una persona empresaria llena un formulario con datos personales y empresariales.
2. Los datos llegan desde Google Forms.
3. Un proceso programado (cron job) consulta periódicamente las respuestas nuevas o actualizadas.
4. Cada respuesta debe almacenarse como evidencia cruda.
5. Luego debe normalizarse y consolidarse en una entidad de empresario con snapshots históricos.
6. Desde un dashboard interno, un operador puede seleccionar a un empresario y emitir una credencial institucional.
7. El formulario de emisión debe autocompletar campos usando la última información disponible del empresario en base de datos.
8. Cada empresario también puede tener asociada una wallet de Stellar.
9. En la lógica on-chain, la organización principal emite una credencial principal.
10. Después, el emprendedor o una segunda entidad puede emitir una credencial relacionada
    como validación / endorsement / verificación vinculada a la credencial principal.
11. Ambas credenciales deben quedar mapeadas entre sí a nivel de base de datos
    y a nivel de referencias on-chain.
12. También debe existir soporte para sponsor vault / sponsor relationship /
    lectura de vault asociado dentro del flujo del contrato en Stellar.
13. El sistema debe poder rastrear exactamente qué snapshot y qué datos fueron
    usados al momento de emitir una credencial.

## Contexto blockchain específico — contrato vc-vault

Este proyecto es FULL STELLAR sobre el contrato Soroban `vc-vault`.

El contrato `vc-vault` tiene las siguientes características que DEBES modelar:

### Identidades on-chain

- Un **vault** está identificado por la Stellar address del owner (`owner: Address`)
- Una **VC** dentro del vault se identifica por el par `(owner_address, vc_id: String)`
- El struct `VerifiableCredential` contiene: `{id, data, issuance_contract, issuer_did}`
  - `id`: identificador de la VC (string)
  - `data`: ciphertext o referencia al payload
  - `issuance_contract`: contrato que puede verificar/revocar el estado de la VC;
    puede ser el mismo vault o un contrato externo
  - `issuer_did`: DID del emisor (metadata para wallets/UX)
- El status de una VC vive en `VCStatus(owner, vc_id)` con valores: `Valid | Invalid | Revoked(date)`

### Operaciones principales del contrato

- `create_vault(owner, did_uri)` — vault auto-creado por el owner
- `create_sponsored_vault(sponsor, owner, did_uri)` — vault creado por un sponsor
- `issue(owner, vc_id, vc_data, vault_contract, issuer_addr, issuer_did, fee_override)` → vc_id
- `revoke(owner, vc_id, date)` — revocar una VC específica
- `revoke_vault(owner)` — revocar el vault completo (bloquea todas las escrituras)
- `push(from_owner, to_owner, vc_id, issuer_addr)` — transferir una VC entre vaults
- `verify_vc(owner, vc_id)` → VCStatus
- `get_vc(owner, vc_id)` → Option<VerifiableCredential>

### Referencias on-chain a persistir en base de datos

Cada credencial emitida on-chain debe guardar:
- `onchain_vc_id` — el `vc_id` usado en el contrato (NO llamarlo token_id)
- `onchain_owner_address` — la Stellar address del vault owner (necesario para queries al contrato)
- `onchain_issuance_contract` — el `issuance_contract` del VC (puede diferir del vault_contract)
- `onchain_contract_id` — el vault contract address (el contrato vc-vault desplegado)
- `onchain_tx_hash` — hash de la transacción
- `onchain_ledger_sequence` — ledger sequence de la transacción
- `onchain_network` — identificador de red (testnet | mainnet | futurenet)

### Campos del issuer a persistir

- `issuer_stellar_address` — la Stellar address del issuer (usado para autorización en el contrato)
- `issuer_did` — el DID del issuer (metadata del VC, guardado en `VerifiableCredential.issuer_did`)

### Vault DID

- Cada vault tiene un `did_uri` asignado en su creación.
- Este DID debe persistirse en base de datos para poder mostrarlo en el dashboard
  y usar en el formulario de emisión.

### Operación push (transferencia de VC entre vaults)

- El contrato permite mover una VC de un vault a otro con `push()`.
- Cuando una VC es pusheada, desaparece del vault origen y aparece en el destino.
- El `onchain_owner_address` de la credencial en DB debe actualizarse.
- El historial de esta transferencia debe trazarse.

No quiero nada EVM, Starknet, multichain ni compatibilidad genérica por ahora.
Todo debe modelarse first-class para Stellar.

## Requerimientos funcionales base

- Ingesta de respuestas de Google Forms
- Persistencia de respuestas crudas
- Normalización hacia entidades del dominio
- Consolidación del último estado por empresario
- Dashboard interno para búsqueda y detalle de empresarios
- Formulario de emisión de credencial con autofill
- Registro de wallet Stellar por empresario
- Registro de sponsor vault o sponsor reference asociado al empresario
- Emisión de credencial principal via vc-vault
- Emisión o registro de credencial de endorsement relacionada
- Relación entre credenciales (endorses / verifies / references / supersedes)
- Historial de syncs por cron
- Trazabilidad de snapshots usados para cada credencial
- Trazabilidad de push() entre vaults
- Portal simple de verificación pública más adelante (dejar scaffold con TODOs)
- Soporte para integración futura con otros contratos Soroban

## Configuración de Supabase CLI para desarrollo local

El proyecto tendrá múltiples contribuyentes. Cada uno debe poder levantar el entorno
completo localmente sin depender de credenciales compartidas ni del proyecto remoto.

### Estructura de carpetas requerida

supabase/
├── config.toml                  ← configuración del proyecto Supabase CLI
├── seed.sql                     ← datos de desarrollo local (orgs, usuarios, etc.)
├── migrations/
│   └── 20240101000000_init.sql  ← migración inicial con el schema completo
└── functions/                   ← Edge Functions (cron job de sync, etc.)
    └── forms-sync/
        └── index.ts

### Reglas para el flujo de migraciones

- Cada cambio de schema debe ser una migración nueva generada con:
  `supabase migration new <nombre_descriptivo>`
- Nunca editar migraciones ya aplicadas; siempre crear una nueva
- El archivo `seed.sql` solo debe contener datos seguros para desarrollo:
  una organización de prueba, un usuario interno de prueba, sin PII real
- Los tipos TypeScript deben generarse desde el schema local con:
  `supabase gen types typescript --local > src/lib/supabase/database.types.ts`
- El archivo `database.types.ts` debe commitearse al repo para que todos
  tengan los tipos sin necesidad de conectarse al proyecto remoto

### Variables de entorno

Debe existir un archivo `.env.local.example` commiteado con todas las variables
necesarias y valores de ejemplo o placeholders. Nunca commitear `.env.local`.

Variables requeridas:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`         ← solo server-side, nunca exponer al cliente
- `SUPABASE_DB_PASSWORD`              ← para conexión directa si se necesita
- `GOOGLE_FORMS_API_KEY`
- `GOOGLE_FORMS_FORM_ID`
- `STELLAR_NETWORK`                   ← testnet | mainnet | futurenet
- `VC_VAULT_CONTRACT_ID`              ← contract address del vc-vault desplegado
- `ISSUER_STELLAR_SECRET`             ← solo server-side, para firmar transacciones
- `CRON_SECRET`                       ← para proteger el endpoint del cron job

### Comandos del workflow local

Documenta estos comandos en el README:

```bash
# Iniciar Supabase local (Docker)
supabase start

# Aplicar migraciones
supabase db reset          # borra y recrea con todas las migraciones + seed
supabase migration up      # aplicar migraciones pendientes sin borrar datos

# Regenerar tipos TypeScript tras cambios de schema
supabase gen types typescript --local > src/lib/supabase/database.types.ts

# Abrir Supabase Studio local
# http://localhost:54323

# Detener
supabase stop
```

### Clientes Supabase

Debe existir una capa de clientes separados:
- `src/lib/supabase/client.ts` — cliente browser (anon key, para componentes client)
- `src/lib/supabase/server.ts` — cliente server (service role key, para route handlers y server actions)
- `src/lib/supabase/middleware.ts` — cliente para middleware de Next.js (refresh de sesión)

Nunca usar el service role key en el cliente browser.
Nunca usar el cliente browser en route handlers o server actions.

### RLS (Row Level Security)

Deja los scaffolds de RLS listos con TODOs pero aplica estas políticas base:
- `internal_users`: solo el propio usuario puede leer su fila
- `organizations`: solo usuarios de la misma organización pueden leer
- `entrepreneurs`: solo usuarios de la misma organización pueden leer/escribir
- `credentials`: lectura pública solo de `public_id` y `public_claims` para el portal de verificación
- Todas las demás tablas: solo service role (operaciones internas)

### Edge Functions para cron job

El sync de Google Forms debe correr como Supabase Edge Function invocada por
un cron externo (Vercel Cron, GitHub Actions, o pg_cron).
Deja el scaffold en `supabase/functions/forms-sync/index.ts` con TODOs.

## Restricciones importantes

- No quiero componentes enormes
- No quiero hooks con lógica de negocio pesada
- No quiero acceso a Supabase directo desde componentes
- No quiero lógica on-chain mezclada con formularios React
- Sí quiero services
- Sí quiero mappers
- Sí quiero schemas con Zod
- Sí quiero types estrictos
- Sí quiero boundary claro entre client y server
- Sí quiero una capa dedicada para Stellar/Soroban
- Sí quiero separación estricta entre cliente browser y server de Supabase
- Sí quiero el workflow de migraciones documentado y reproducible para contribuyentes

## Arquitectura obligatoria

Usa esta estructura base y adáptala:

src/
├── features/
│   ├── entrepreneurs/
│   │   ├── components/
│   │   │   ├── pages/
│   │   │   └── ui/
│   │   ├── hooks/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── schemas/
│   │   └── mappers/
│   ├── forms-sync/
│   ├── credentials/
│   ├── organizations/
│   ├── stellar/
│   ├── wallets/
│   ├── vaults/
│   ├── dashboard/
│   └── verification/
├── components/
├── lib/
│   ├── constants/
│   ├── helpers/
│   ├── services/
│   └── orchestrator/

Módulos requeridos:
- entrepreneurs
- forms-sync
- credentials
- stellar
- wallets
- vaults
- dashboard
- verification

## Entidades mínimas del dominio

Define al menos estas entidades:

- Organization
- InternalUser
- Entrepreneur
- EntrepreneurBusinessProfile
- EntrepreneurProfileSnapshot
- FormSource
- FormSubmissionRaw
- FormSyncRun
- StellarWallet
- Vault                         ← vault on-chain con did_uri, vault_contract_id, revoked state
- SponsorVault                  ← relación sponsor→vault, incluye sponsor_address
- CredentialTemplate
- IssuanceDraft
- Credential
- CredentialRelationship
- CredentialEvidenceSnapshot
- CredentialPush               ← historial de push() entre vaults
- VerificationRecord
- OnChainCredentialReference   ← con onchain_vc_id, onchain_owner_address, onchain_issuance_contract
- OnChainEndorsementReference

## Reglas del dominio importantes

- Un empresario pertenece a una organización
- Un empresario puede tener una wallet Stellar principal
- Un empresario puede tener cero o más sponsor vault references
- Un vault tiene un did_uri, un vault_contract_id, y puede estar revocado
- Una credencial principal pertenece a una organización y a un empresario
- Una credencial de endorsement debe poder relacionarse con una credencial principal
- Cada credencial debe guardar referencias off-chain y on-chain completas
  (incluyendo issuance_contract, owner_address, issuer_did)
- Debe poder saberse cuál snapshot fue usado para emitir cada credencial
- Debe existir estado de credencial:
  - draft
  - issued
  - revoked
  - expired
  - pending_endorsement
- Cuando una VC es pusheada entre vaults, el onchain_owner_address debe actualizarse
  y el historial de push debe quedar registrado

## Lo que necesito que generes

1. Resumen de arquitectura
2. Árbol completo de carpetas (incluyendo supabase/)
3. Explicación breve por módulo
4. Lista de archivos iniciales a crear
5. Contenido scaffold de cada archivo con TODOs reales
6. Convenciones del proyecto
7. Estrategia de integración con Supabase
8. Configuración de Supabase CLI (config.toml, seed.sql, estructura de migraciones,
   clientes separados browser/server, RLS base, Edge Function del cron, .env.local.example)
9. Estrategia de integración con Stellar/Soroban (vc-vault específicamente)
10. Riesgos técnicos
11. Próximos pasos

## Requisitos del código scaffold

- TypeScript estricto
- Componentes pequeños
- Servicios enfocados
- Repositories separados por feature
- Mappers explícitos
- Zod para validación
- TanStack Query solo para fetch/cache en client
- Server-side para operaciones sensibles
- TODOs accionables, no genéricos
- Nada de archivos vacíos

## Rutas base sugeridas

- /dashboard
- /dashboard/entrepreneurs
- /dashboard/entrepreneurs/[id]
- /dashboard/credentials
- /dashboard/credentials/new
- /dashboard/credentials/[id]
- /dashboard/wallets
- /dashboard/vaults
- /verify/[credentialId]

## Flujo técnico que debes documentar

Google Forms → sync job → raw submissions → normalization → snapshots
→ entrepreneur consolidated profile → dashboard autofill
→ draft issuance → credential issuance
→ Soroban vc-vault issue() → onchain reference persistence
→ endorsement linkage → verification portal

## Formato obligatorio de respuesta

Responde en este orden exacto:

1. Resumen de arquitectura
2. Árbol de carpetas
3. Explicación por módulo
4. Lista de archivos a crear
5. Código scaffold por archivo
6. Convenciones
7. Integración Supabase
8. Configuración Supabase CLI (config.toml, seed.sql, migración inicial,
   clientes browser/server, RLS base, Edge Function cron, .env.local.example)
9. Integración Stellar/Soroban (vc-vault)
10. Riesgos técnicos
11. Próximos pasos
```
