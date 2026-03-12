# API GIVE Interactuar — Documentación

## Tabla de contenido

1. [Endpoints REST (Swagger)](#1-endpoints-rest-swagger)
   - [Organizaciones y Usuarios](#11-organizaciones-y-usuarios)
   - [Emprendedores](#12-emprendedores)
   - [Credenciales](#13-credenciales)
   - [Formularios y Sincronización](#14-formularios-y-sincronización)
   - [Verificación](#15-verificación)
   - [Analytics](#16-analytics)
2. [Endpoints legacy (disponibles)](#2-endpoints-legacy-disponibles)
   - [Impact Credential](#21-impact-credential--credencial-de-impacto)
   - [Behavior Credential](#22-behavior-credential--credencial-de-comportamiento)
   - [Profile Credential](#23-profile-credential--credencial-de-perfil-y-formalización)
3. [Consulta directa de datos (Supabase PostgREST)](#3-consulta-directa-de-datos-supabase-postgrest)
4. [Sugerencias de datos derivados](#4-sugerencias-de-datos-derivados)

---

## 1. Endpoints REST (Swagger)

Endpoints alineados con la especificación OpenAPI 3.0 documentada en
[Swagger UI](https://give-interactuar-docs-swagger.vercel.app/).

**URL base:** `http://localhost:3003` (desarrollo)

### Convenciones generales

- Todos los campos de respuesta usan **snake_case**.
- Las listas retornan un objeto con `data` (array) y `meta` (paginación).
- Los endpoints individuales (`/:id`) retornan `{ "data": { ... } }`.
- Paginación por query params: `page` (default 1) y `page_size` (default 50, max 200).

**Modelo de paginación (`meta`):**

```json
{
  "total": 1000,
  "page": 1,
  "page_size": 50,
  "has_next": true
}
```

**Modelo de error (`ErrorBody`):**

```json
{
  "error": "INVALID_PARAM",
  "message": "id must be a valid UUID",
  "details": null
}
```

**Códigos de respuesta:**

| Código | Significado                                          |
|--------|------------------------------------------------------|
| `200`  | Solicitud exitosa                                    |
| `400`  | Parámetro inválido (UUID mal formado, página < 1)    |
| `404`  | Recurso no encontrado (solo en rutas `/:id`)         |
| `500`  | Error interno del servidor                           |

---

### 1.1 Organizaciones y Usuarios

#### `GET /api/organizations`

Lista de organizaciones.

| Parámetro   | Tipo    | Requerido | Descripción            |
|-------------|---------|-----------|------------------------|
| `active`    | boolean | No        | Filtrar por estado     |
| `page`      | integer | No        | Página (default 1)     |
| `page_size` | integer | No        | Tamaño (default 50)    |

```bash
GET /api/organizations
GET /api/organizations?active=true&page_size=10
```

**Respuesta:**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "GIVE Interactuar",
      "legal_name": "Fundación GIVE Interactuar",
      "document_type": null,
      "document_number": null,
      "email": "admin@giveinteractuar.org",
      "phone": null,
      "metadata": {},
      "active": true,
      "created_at": "2026-03-11T19:48:46.533Z",
      "updated_at": "2026-03-11T19:48:46.533Z"
    }
  ],
  "meta": { "total": 1, "page": 1, "page_size": 50, "has_next": false }
}
```

#### `GET /api/organizations/:id`

Organización individual.

```bash
GET /api/organizations/00000000-0000-0000-0000-000000000001
```

#### `GET /api/internal-users`

Lista de usuarios internos.

| Parámetro         | Tipo    | Requerido | Descripción                          |
|-------------------|---------|-----------|--------------------------------------|
| `organization_id` | uuid    | No        | Filtrar por organización             |
| `active`          | boolean | No        | Filtrar por estado                   |
| `role`            | string  | No        | Filtrar por rol (admin/operator/viewer) |
| `page`            | integer | No        | Página                               |
| `page_size`       | integer | No        | Tamaño de página                     |

**Campos del modelo `InternalUser`:**

```
id, auth_user_id, organization_id, full_name, email, role, active, created_at, updated_at
```

#### `GET /api/internal-users/:id`

Usuario interno individual.

---

### 1.2 Emprendedores

#### `GET /api/entrepreneurs`

Lista de emprendedores con búsqueda por nombre.

| Parámetro      | Tipo    | Requerido | Descripción                       |
|----------------|---------|-----------|-----------------------------------|
| `query`        | string  | No        | Búsqueda por nombre (substring)   |
| `municipality` | string  | No        | Filtrar por municipio             |
| `department`   | string  | No        | Filtrar por departamento          |
| `active`       | boolean | No        | Filtrar por estado                |
| `page`         | integer | No        | Página                            |
| `page_size`    | integer | No        | Tamaño de página                  |

```bash
GET /api/entrepreneurs?query=Gustavo&page_size=5
GET /api/entrepreneurs?municipality=Medellín&active=true
```

**Campos del modelo `Entrepreneur`:**

```
id, organization_id, first_name, last_name, full_name, document_type, document_number,
email, phone, municipality, department, country, active, metadata, created_at, updated_at
```

#### `GET /api/entrepreneurs/:id`

Emprendedor individual con enrichments opcionales (`business_profile`, `latest_snapshot`, `financial_profile`).

#### `GET /api/business-profiles`

Perfiles de negocio.

| Parámetro         | Tipo | Requerido | Descripción            |
|-------------------|------|-----------|------------------------|
| `entrepreneur_id` | uuid | No        | Filtrar por emprendedor |

**Campos del modelo `BusinessProfile`:**

```
id, entrepreneur_id, business_name, business_sector, business_activity,
monthly_sales, monthly_costs, employee_count, formalized, metadata, created_at, updated_at
```

#### `GET /api/business-profiles/:id`

Perfil de negocio individual.

#### `GET /api/entrepreneur-snapshots`

Snapshots de perfil.

| Parámetro         | Tipo    | Requerido | Descripción                     |
|-------------------|---------|-----------|----------------------------------|
| `entrepreneur_id` | uuid    | No        | Filtrar por emprendedor          |
| `is_latest`       | boolean | No        | Solo el snapshot más reciente    |

**Campos del modelo `EntrepreneurProfileSnapshot`:**

```
id, entrepreneur_id, source_submission_id, source_sync_run_id,
snapshot_version, is_latest, snapshot_date, data, created_at
```

#### `GET /api/entrepreneur-snapshots/:id`

Snapshot individual.

#### `GET /api/financial-profiles`

Perfiles financieros.

| Parámetro         | Tipo   | Requerido | Descripción                                     |
|-------------------|--------|-----------|--------------------------------------------------|
| `entrepreneur_id` | uuid   | No        | Filtrar por emprendedor                          |
| `credit_level`    | string | No        | Filtrar por nivel (bajo/medio/alto/excelente)    |

**Campos del modelo `FinancialProfile`:**

```
id, entrepreneur_id, credit_level, loan_status, raw_data, imported_at, source_file
```

#### `GET /api/financial-profiles/:id`

Perfil financiero individual.

---

### 1.3 Credenciales

#### `GET /api/credentials`

Lista de credenciales verificables emitidas.

| Parámetro         | Tipo   | Requerido | Descripción                                                  |
|-------------------|--------|-----------|--------------------------------------------------------------|
| `entrepreneur_id` | uuid   | No        | Filtrar por emprendedor                                      |
| `status`          | string | No        | draft / issued / revoked / expired / pending_endorsement     |
| `credential_type` | string | No        | impact / verification / endorsement                          |

**Campos del modelo `Credential`:**

```
id, organization_id, entrepreneur_id, template_id, source_draft_id, source_snapshot_id,
credential_type, status, title, description, public_id, issued_at, expires_at, revoked_at,
issuer_did, acta_vc_id, metadata, public_claims, created_by, created_at, updated_at
```

#### `GET /api/credentials/:id`

Credencial individual por UUID.

#### `GET /api/credentials/public/:publicId`

Credencial por identificador público (human-readable, para portal de verificación).

#### `GET /api/issuance-drafts`

Borradores de emisión.

| Parámetro         | Tipo   | Requerido | Descripción                  |
|-------------------|--------|-----------|------------------------------|
| `entrepreneur_id` | uuid   | No        | Filtrar por emprendedor      |
| `status`          | string | No        | draft / ready / archived     |

**Campos del modelo `IssuanceDraft`:**

```
id, organization_id, entrepreneur_id, template_id, latest_snapshot_id,
prepared_payload, status, created_by, created_at, updated_at
```

#### `GET /api/issuance-drafts/:id`

Borrador individual.

#### `GET /api/credential-templates`

Plantillas de credenciales.

| Parámetro         | Tipo    | Requerido | Descripción                         |
|-------------------|---------|-----------|-------------------------------------|
| `organization_id` | uuid    | No        | Filtrar por organización            |
| `credential_type` | string  | No        | impact / verification / endorsement |
| `active`          | boolean | No        | Filtrar por estado                  |

**Campos del modelo `CredentialTemplate`:**

```
id, organization_id, name, credential_type, schema_version,
template_definition, active, created_at, updated_at
```

#### `GET /api/credential-templates/:id`

Plantilla individual.

---

### 1.4 Formularios y Sincronización

#### `GET /api/form-sources`

Fuentes de formularios (Google Forms, etc.).

| Parámetro         | Tipo    | Requerido | Descripción              |
|-------------------|---------|-----------|--------------------------|
| `organization_id` | uuid    | No        | Filtrar por organización |
| `provider`        | string  | No        | Filtrar por proveedor    |
| `active`          | boolean | No        | Filtrar por estado       |

**Campos del modelo `FormSource`:**

```
id, organization_id, provider, external_form_id, name, description,
active, metadata, created_at, updated_at
```

#### `GET /api/form-sources/:id`

Fuente individual.

#### `GET /api/form-submissions`

Respuestas crudas de formularios.

| Parámetro        | Tipo | Requerido | Descripción                |
|------------------|------|-----------|----------------------------|
| `form_source_id` | uuid | No        | Filtrar por fuente de form |

**Campos del modelo `FormSubmissionRaw`:**

```
id, form_source_id, external_response_id, submitted_at, responder_email,
raw_payload, raw_answers, checksum, synced_at, created_at
```

#### `GET /api/form-submissions/:id`

Respuesta individual.

#### `GET /api/form-sync-runs`

Ejecuciones de sincronización.

| Parámetro        | Tipo   | Requerido | Descripción                                        |
|------------------|--------|-----------|----------------------------------------------------|
| `form_source_id` | uuid   | No        | Filtrar por fuente                                 |
| `status`         | string | No        | running / success / partial_success / failed       |

**Campos del modelo `FormSyncRun`:**

```
id, form_source_id, status, started_at, finished_at, total_fetched,
total_inserted, total_updated, total_failed, error_log, metadata, created_at
```

#### `GET /api/form-sync-runs/:id`

Ejecución individual.

---

### 1.5 Verificación

#### `GET /api/verification-records`

Registros de verificación de credenciales.

| Parámetro             | Tipo   | Requerido | Descripción                   |
|-----------------------|--------|-----------|-------------------------------|
| `credential_id`       | uuid   | No        | Filtrar por credencial        |
| `verification_result` | string | No        | success / failed              |

**Campos del modelo `VerificationRecord`:**

```
id, credential_id, verifier_type, verifier_identifier,
verification_result, checked_at, metadata
```

#### `GET /api/verification-records/:id`

Registro individual.

---

### 1.6 Analytics

#### `GET /api/analytics/dashboard`

Dashboard consolidado con métricas agregadas del programa MicroMBA.

Sin parámetros.

**Respuesta:**

```json
{
  "metadata": {
    "programa": "MicroMBA GIVE Colombia",
    "periodo": "Medición de Impacto",
    "nota": "Datos agregados de im_measurements y tablas relacionadas",
    "fuente": "Medición de Impacto MicroMBA"
  },
  "resumen": {
    "total_participantes": 1000,
    "activos": 830,
    "tasa_retencion_pct": 83.0,
    "mujeres": 467,
    "hombres": 533,
    "pct_mujeres": 46.7,
    "ventas_total_n1_cop": 0,
    "ventas_total_n_cop": 0,
    "ventas_promedio_n1_cop": 0,
    "ventas_promedio_n_cop": 0,
    "variacion_promedio_pct": 0,
    "empleos_tc_n1": 0,
    "empleos_tc_n": 0,
    "nuevos_empleos": 0,
    "empleos_formalizados": 0
  },
  "por_programa": [
    { "programa": "MBA Empresarial", "participantes": 624, "ventas_promedio_n1_cop": 0, "ventas_promedio_n_cop": 0, "variacion_promedio_pct": 0, "nuevos_empleos": 0 }
  ],
  "por_genero": [
    { "genero": "Mujer", "participantes": 467, "ventas_promedio_n1_cop": 0, "ventas_promedio_n_cop": 0, "variacion_promedio_pct": 0 }
  ],
  "por_aliado": [
    { "aliado": "Actec", "participantes": 200, "nuevos_empleos": 0 }
  ],
  "por_edad": [
    { "rango": "25-34", "participantes": 150 }
  ],
  "ventas_mensuales": [
    { "mes": "Ene", "promedio_cop": 58267857, "n": 92 }
  ],
  "cartera": {
    "total_con_credito": 700,
    "al_dia": 113,
    "en_mora": 587,
    "pct_mora": 83.86,
    "saldo_mora_total_cop": 5000000,
    "por_clasificacion": [
      { "clasificacion": "A", "label": "Normal (A)", "casos": 400, "saldo_mora_cop": 3000000 }
    ]
  }
}
```

#### `GET /api/analytics/empresarios`

Lista denormalizada de empresarios con campos en español (matching data exports).

| Parámetro          | Tipo    | Requerido | Descripción                                  |
|--------------------|---------|-----------|----------------------------------------------|
| `programa`         | string  | No        | "MBA Empresarial" / "MBA Agroempresarial"    |
| `genero`           | string  | No        | "Mujer" / "Hombre"                           |
| `solicito_credito` | string  | No        | "Sí" / "No"                                  |
| `en_mora`          | string  | No        | "Sí" / "No"                                  |
| `page`             | integer | No        | Página (default 1)                           |
| `page_size`        | integer | No        | Tamaño (default 100, max 500)                |

```bash
GET /api/analytics/empresarios?genero=Mujer&page_size=10
GET /api/analytics/empresarios?programa=MBA%20Empresarial&en_mora=Sí
```

**Campos del modelo `EmpresarioRecord`:**

```
nombre, empresa, programa, aliado, estado, genero, municipio, sector,
ventas_n1_cop, ventas_n_cop, variacion_pct, nuevos_empleos, nivel, grupo,
anio_cohorte, credito_vigente, escolaridad, estrato, zona_residencia,
figura_legal, tamanio_empresa, edad, rango_edad, solicito_credito, en_mora
```

---

### 1.7 Credentials (Impact Measurement)

Credenciales que generan indicadores derivados a partir de los datos de medición de impacto.

**Convención general:**
- Parámetro: `entrepreneur_id` (snake_case)
- Respuestas: **snake_case** en todas las claves
- Status codes: `200` (éxito), `400` (param inválido), `404` (not found), `500` (error)

#### 1.7.1 Impact Credential — Credencial de Impacto

> ¿El negocio crece, se sostiene o se deteriora?

| Qué muestra | Qué responde | Condición mínima |
|---|---|---|
| Empresa, sector, años de existencia, ventas año n-1, ventas año n, variación de ventas, empleos actuales, nuevos empleos generados y formalizados | ¿El negocio crece, se sostiene o se deteriora? | Debe existir información de empresa, ventas y empleo. |

**Endpoint:** `GET /api/credentials/impact`

**Parámetros:**

| Parámetro        | Tipo   | Requerido | Descripción                                      |
|------------------|--------|-----------|--------------------------------------------------|
| `entrepreneur_id` | uuid   | No        | ID del emprendedor. Si se omite, retorna todos (con paginación).  |
| `year`           | number | No        | Año de medición. Si se omite, usa el más reciente.|
| `verdict`        | string | No        | Filtrar por: `growing` \| `sustaining` \| `deteriorating` \| `insufficient_data` |
| `has_business`   | bool   | No        | `true` = solo con empresa, `false` = solo sin empresa |
| `has_sales`      | bool   | No        | `true` = solo con ventas, `false` = solo sin ventas |
| `has_employees`  | bool   | No        | `true` = solo con empleados, `false` = solo sin empleados |
| `page`           | number | No        | Número de página (default 1) |
| `page_size`      | number | No        | Registros por página (default 50, max 200) |

**Status codes:**

| Código | Descripción |
|--------|---|
| `200` | Solicitud exitosa (individual o lista) |
| `400` | `entrepreneur_id` no es UUID válido o parámetro inválido |
| `404` | Emprendedor o medición no encontrada |
| `500` | Error interno del servidor |

**Ejemplos:**

```bash
# Individual
GET /api/credentials/impact?entrepreneur_id=0012fb99-2591-426a-a708-5a3e8952582e

# Lista sin filtros
GET /api/credentials/impact?page_size=10

# Filtro por verdict
GET /api/credentials/impact?verdict=growing&page_size=5

# Múltiples filtros
GET /api/credentials/impact?verdict=growing&has_sales=true&has_employees=true
```

**Respuesta (individual):**

```json
{
  "data": {
    "entrepreneur_id": "0012fb99-...",
    "full_name": "Nombre Completo",
    "document_number": "123456789",
    "business_name": "Mi Empresa S.A.S",
    "economic_sector": "Servicios",
    "years_in_operation": 5,
    "total_sales_prev_year": 50000000,
    "total_sales_current_year": 60000000,
    "sales_variation_pct": 20.0,
    "current_full_time_employees": 4,
    "new_jobs_generated": 2,
    "new_jobs_formalized": 1,
    "verdict": "growing"
  }
}
```

**Respuesta (lista):**

```json
{
  "data": [
    { "entrepreneur_id": "...", "full_name": "...", ... },
    { "entrepreneur_id": "...", "full_name": "...", ... }
  ]
}
```

**Campos derivados:**

| Campo                | Cálculo                                                        |
|----------------------|----------------------------------------------------------------|
| `sales_variation_pct`  | `((ventas_actuales - ventas_previas) / ventas_previas) × 100`    |
| `new_jobs_generated`   | `empleados_actuales - empleados_previos`                       |
| `new_jobs_formalized`  | `seguridad_social_actual - seguridad_social_previa`            |
| `verdict`            | `>5%` → `growing`, `-5% a 5%` → `sustaining`, `<-5%` → `deteriorating` |

---

#### 1.7.2 Behavior Credential — Credencial de Comportamiento

> ¿La empresaria muestra señales de estabilidad financiera y capacidad de pago?

| Qué muestra | Qué responde | Condición mínima |
|---|---|---|
| Segmento crédito inicio y final, crédito vigente, ventas promedio, costos y gastos, activos y pasivos, margen operativo, relación pasivos/activos, estabilidad de ingresos, validación del registro y nuevos empleos | ¿La empresaria muestra señales de estabilidad financiera y capacidad de pago? | Deben existir datos financieros suficientes para derivar indicadores. |

**Endpoint:** `GET /api/credentials/behavior`

**Parámetros:**

| Parámetro             | Tipo   | Requerido | Descripción                                      |
|----------------------|--------|-----------|--------------------------------------------------|
| `entrepreneur_id`    | uuid   | No        | ID del emprendedor. Si se omite, retorna todos (con paginación). |
| `year`              | number | No        | Año de medición. Si se omite, usa el más reciente.|
| `financial_trend`   | string | No        | Filtrar por: `positive` \| `neutral` \| `negative` \| `insufficient_data` |
| `operating_capacity`| string | No        | Filtrar por: `high` \| `medium` \| `low` \| `insufficient_data` |
| `leverage_level`    | string | No        | Filtrar por: `healthy` \| `moderate` \| `high` \| `insufficient_data` |
| `credit_active`     | bool   | No        | `true` = con crédito activo, `false` = sin crédito |
| `has_financial_data`| bool   | No        | `true` = solo con datos financieros completos |
| `page`              | number | No        | Número de página (default 1) |
| `page_size`         | number | No        | Registros por página (default 50, max 200) |

**Status codes:** (200/400/404/500 - idénticos a Impact Credential)

**Ejemplos:**

```bash
# Individual
GET /api/credentials/behavior?entrepreneur_id=0012fb99-...

# Lista con filtro por tendencia financiera
GET /api/credentials/behavior?financial_trend=positive&page_size=10

# Con datos financieros completos
GET /api/credentials/behavior?has_financial_data=true

# Múltiples filtros
GET /api/credentials/behavior?financial_trend=positive&operating_capacity=high&credit_active=true
```

**Respuesta (individual):**

```json
{
  "data": {
    "entrepreneur_id": "0012fb99-...",
    "full_name": "Nombre Completo",
    "document_number": "123456789",
    "credit_segment_start": "en_crecimiento",
    "credit_segment_end": "consolidacion",
    "credit_active_12m": true,
    "avg_monthly_sales": 5000000,
    "avg_monthly_costs": 3000000,
    "total_assets": 80000000,
    "total_liabilities": 20000000,
    "estimated_operating_margin": 40.0,
    "leverage_ratio": 0.25,
    "monthly_income_stability": 0.85,
    "record_validity": "valido",
    "estimated_operating_capacity": "high",
    "leverage_level": "healthy",
    "commercial_stability": "moderate",
    "financial_trend": "positive"
  }
}
```

**Campos derivados:**

| Campo                         | Cálculo                                                                 |
|-------------------------------|-------------------------------------------------------------------------|
| `estimated_operating_margin`    | `((ventas - costos) / ventas) × 100`                                   |
| `leverage_ratio`               | `pasivos / activos`                                                     |
| `monthly_income_stability`      | `1 - coeficiente_de_variación(ventas_mensuales)` (más cercano a 1 = más estable) |
| `estimated_operating_capacity`  | Margen ≥20% → `high`, ≥10% → `medium`, <10% → `low`                   |
| `leverage_level`               | Ratio ≤0.4 → `healthy`, ≤0.7 → `moderate`, >0.7 → `high`             |
| `commercial_stability`         | CV ≤0.15 → `stable`, ≤0.35 → `moderate`, >0.35 → `volatile`          |
| `financial_trend`              | Combina margen operativo y apalancamiento (ver tabla abajo)            |

**Lógica de `financial_trend`:**

| Condición                              | Resultado    |
|----------------------------------------|--------------|
| Margen ≥15% **y** Apalancamiento ≤0.5 | `positive`   |
| Margen ≥5% **y** Apalancamiento ≤0.8  | `neutral`    |
| Cualquier otro caso                    | `negative`   |

---

#### 1.7.3 Profile Credential — Credencial de Perfil y Formalización

> ¿Cuál es el nivel de formalización y contexto socioeconómico del empresario?

| Qué muestra | Qué responde | Condición mínima |
|---|---|---|
| Identidad validada, escolaridad, municipio y zona, proveedor del hogar, ingresos del hogar, empresa formalizada, NIT, años de existencia, figura legal, tamaño de empresa, acceso a internet, seguridad social y formalización de empleos | ¿Cuál es el nivel de formalización y contexto socioeconómico del empresario? | Deben existir datos de identidad y formalización. |

**Endpoint:** `GET /api/credentials/profile`

**Parámetros:**

| Parámetro            | Tipo | Requerido | Descripción                                      |
|---------------------|------|-----------|--------------------------------------------------|
| `entrepreneur_id`   | uuid | No        | ID del emprendedor. Si se omite, retorna todos (con paginación). |
| `is_formalized`     | bool | No        | `true` = solo empresas formalizadas, `false` = solo sin formalizar |
| `identity_validated`| bool | No        | `true` = solo con identidad validada, `false` = sin validar |
| `has_internet`      | bool | No        | `true` = solo con internet, `false` = sin internet |
| `contributes_pension`| bool | No        | `true` = solo que contribuyen a pensión, `false` = no contribuyen |
| `page`              | number | No        | Número de página (default 1) |
| `page_size`         | number | No        | Registros por página (default 50, max 200) |

**Status codes:** (200/400/404/500 - idénticos a Impact Credential)

**Ejemplos:**

```bash
# Individual
GET /api/credentials/profile?entrepreneur_id=0012fb99-...

# Lista: solo empresas formalizadas
GET /api/credentials/profile?is_formalized=true&page_size=10

# Formalizadas Y con identidad validada
GET /api/credentials/profile?is_formalized=true&identity_validated=true

# Con internet Y contribuyen a pensión
GET /api/credentials/profile?has_internet=true&contributes_pension=true&page_size=20
```

**Respuesta (individual):**

```json
{
  "data": {
    "entrepreneur_id": "0012fb99-...",
    "full_name": "Nombre Completo",
    "document_number": "123456789",
    "document_type": "CC",
    "identity_validated": true,
    "education_level": "Tecnológica",
    "municipality": "Medellín",
    "residence_zone": "cabecera_urbana",
    "is_primary_provider": true,
    "avg_household_income": 3000000,
    "business_formalized": true,
    "nit": "123456789-1",
    "years_in_operation": 5,
    "legal_figure": "Persona natural responsable de IVA",
    "business_size": "microempresa",
    "has_internet": true,
    "health_regime": "Contributivo",
    "contributes_pension": true,
    "compensation_fund": "Caja de compensación familiar"
  }
}
```

**Respuesta (lista):**

```json
{
  "data": [
    { "entrepreneur_id": "...", "full_name": "...", ... },
    { "entrepreneur_id": "...", "full_name": "...", ... }
  ]
}
```

---

## 2. Credenciales de Impacto (actualizadas a Swagger)

➜ **Ver** [**Sección 1.7: Credentials (Impact Measurement)**](#17-credentials-impact-measurement)

Las credenciales de impacto (`/api/credentials/impact`, `/api/credentials/behavior`, `/api/credentials/profile`) han sido movidas a la sección 1 (Endpoints REST Swagger) con actualización a:
- Parámetros en **snake_case** (`entrepreneur_id` en lugar de `entrepreneurId`)
- Respuestas en **snake_case**
- Status codes estándar (200, 400, 404, 500)
- Documentación MVP con tablas "Qué muestra / Qué responde / Condición mínima"

---

## 3. Consulta directa de datos (Supabase PostgREST)

Para consultar datos crudos de las tablas directamente, se usa la API REST autogenerada
por Supabase (PostgREST).

### Configuración

**URL base:** `http://localhost:54321/rest/v1/`

**Headers requeridos:**

```
apikey: <NEXT_PUBLIC_SUPABASE_ANON_KEY>
Authorization: Bearer <NEXT_PUBLIC_SUPABASE_ANON_KEY>
Content-Type: application/json
```

> Para bypass de RLS usar `SUPABASE_SERVICE_ROLE_KEY` en lugar de `ANON_KEY`.

---

### Tablas de referencia

Datos de catálogos y listas maestras.

| Endpoint                           | Descripción                | Registros |
|------------------------------------|----------------------------|-----------|
| `/rest/v1/im_allies`               | Aliados del programa       | 10        |
| `/rest/v1/im_consultants`          | Consultores asignados      | 34        |
| `/rest/v1/im_levels`               | Niveles del programa       | 4         |
| `/rest/v1/im_economic_sectors`     | Sectores económicos        | 7         |
| `/rest/v1/im_economic_activities`  | Actividades económicas     | 141       |
| `/rest/v1/im_legal_figures`        | Figuras legales            | 5         |
| `/rest/v1/im_education_levels`     | Niveles de escolaridad     | 9         |
| `/rest/v1/im_marital_statuses`     | Estados civiles            | 6         |
| `/rest/v1/im_compensation_funds`   | Cajas de compensación      | 7         |

**Ejemplo — listar todos los sectores económicos:**

```bash
curl "http://localhost:54321/rest/v1/im_economic_sectors?select=id,name" \
  -H "apikey: <TU_APIKEY>"
```

---

### Tablas de entidades

Datos de emprendedores, cohortes y negocios.

| Endpoint                                    | Descripción                      | Registros |
|---------------------------------------------|----------------------------------|-----------|
| `/rest/v1/im_cohorts`                       | Cohortes/grupos                  | 101       |
| `/rest/v1/im_entrepreneur_demographics`     | Demografía del emprendedor       | 1,403     |
| `/rest/v1/im_entrepreneur_self_identifications` | Autoidentificación étnica    | 56        |
| `/rest/v1/im_businesses`                    | Datos del negocio                | 1,403     |

**Ejemplo — emprendedores con su demografía (join):**

```bash
curl "http://localhost:54321/rest/v1/im_entrepreneur_demographics?select=*,entrepreneurs(full_name,document_number)" \
  -H "apikey: <TU_APIKEY>"
```

**Ejemplo — negocios de un municipio con actividad económica:**

```bash
curl "http://localhost:54321/rest/v1/im_businesses?select=business_name,nit,municipality,im_economic_activities(name,im_economic_sectors(name))&municipality=eq.Medellín" \
  -H "apikey: <TU_APIKEY>"
```

**Ejemplo — cohortes de un aliado específico:**

```bash
curl "http://localhost:54321/rest/v1/im_cohorts?select=name,cohort_year,program,im_allies(name)&ally_id=eq.<UUID_ALIADO>" \
  -H "apikey: <TU_APIKEY>"
```

---

### Tablas de medición

Datos del proceso de medición de impacto.

| Endpoint                           | Descripción                    | Registros |
|------------------------------------|--------------------------------|-----------|
| `/rest/v1/im_measurements`         | Mediciones (tabla hecho)       | 1,460     |
| `/rest/v1/im_monthly_sales`        | Ventas mensuales               | 15,232    |
| `/rest/v1/im_monthly_costs`        | Costos mensuales               | 14,903    |
| `/rest/v1/im_quarterly_balances`   | Balances trimestrales          | 3,658     |
| `/rest/v1/im_employment_snapshots` | Empleo (prev_year / current)   | 2,232     |

**Ejemplo — mediciones del año 2024 con cohorte y consultor:**

```bash
curl "http://localhost:54321/rest/v1/im_measurements?measurement_year=eq.2024&select=*,im_cohorts(name,program),im_consultants(full_name)" \
  -H "apikey: <TU_APIKEY>"
```

**Ejemplo — ventas mensuales de una medición:**

```bash
curl "http://localhost:54321/rest/v1/im_monthly_sales?measurement_id=eq.<UUID_MEDICION>&order=month.asc&select=month,amount" \
  -H "apikey: <TU_APIKEY>"
```

**Ejemplo — snapshots de empleo del período actual:**

```bash
curl "http://localhost:54321/rest/v1/im_employment_snapshots?period=eq.current_year&select=*,im_measurements(entrepreneur_id,measurement_year)" \
  -H "apikey: <TU_APIKEY>"
```

---

### Tablas de cartera y recolección

Datos de créditos vencidos y seguimiento de recolección.

| Endpoint                                  | Descripción                    | Registros |
|-------------------------------------------|--------------------------------|-----------|
| `/rest/v1/im_overdue_credits`             | Cartera vencida                | 587       |
| `/rest/v1/im_collection_responses`        | Respuestas de recolección      | 1,474     |
| `/rest/v1/im_collection_monthly_figures`  | Ventas/costos de recolección   | 2,427     |
| `/rest/v1/im_collection_balances`         | Balances de recolección        | 463       |

**Ejemplo — créditos vencidos con datos del emprendedor:**

```bash
curl "http://localhost:54321/rest/v1/im_overdue_credits?select=*,entrepreneurs(full_name,document_number)&order=overdue_balance.desc" \
  -H "apikey: <TU_APIKEY>"
```

**Ejemplo — respuestas de recolección de un período:**

```bash
curl "http://localhost:54321/rest/v1/im_collection_responses?collection_period=eq.ene_mar&collection_year=eq.2026&select=*,entrepreneurs(full_name)" \
  -H "apikey: <TU_APIKEY>"
```

---

### Operadores PostgREST útiles

| Operador  | Uso                          | Ejemplo                                      |
|-----------|------------------------------|----------------------------------------------|
| `eq`      | Igual a                      | `?field=eq.valor`                            |
| `neq`     | Distinto de                  | `?field=neq.valor`                           |
| `gt`/`lt` | Mayor/menor que              | `?amount=gt.1000000`                         |
| `gte`/`lte`| Mayor/menor o igual         | `?measurement_year=gte.2023`                 |
| `like`    | Coincidencia parcial         | `?full_name=like.*Restrepo*`                 |
| `ilike`   | Coincidencia sin mayúsculas  | `?municipality=ilike.*medellin*`             |
| `in`      | Está en lista                | `?classification=in.(A,B)`                   |
| `is`      | Es null / not null           | `?nit=not.is.null`                           |
| `order`   | Ordenar resultados           | `?order=amount.desc`                         |
| `limit`   | Limitar resultados           | `?limit=10`                                  |
| `offset`  | Paginar desde                | `?offset=20&limit=10`                        |

---

## 4. Sugerencias de datos derivados

Los datos cargados permiten generar indicadores adicionales que podrían ser útiles
para análisis o futuros endpoints.

### 4.1 Indicadores por cohorte / aliado

| Indicador                          | Fuente                                    | Descripción                                                       |
|------------------------------------|-------------------------------------------|-------------------------------------------------------------------|
| Tasa de crecimiento por cohorte    | `im_measurements` + `im_monthly_sales`    | % promedio de variación de ventas agrupado por cohorte            |
| Generación de empleo por aliado    | `im_employment_snapshots` + `im_cohorts`  | Total de nuevos empleos generados, agrupado por aliado            |
| Tasa de formalización por cohorte  | `im_businesses`                           | % de negocios con NIT y figura legal formal por cohorte           |
| Morosidad por aliado               | `im_overdue_credits`                      | Saldo total vencido y cantidad de créditos por aliado             |

### 4.2 Indicadores longitudinales (entre años)

| Indicador                      | Fuente                                     | Descripción                                                        |
|--------------------------------|--------------------------------------------|--------------------------------------------------------------------|
| Evolución de ventas            | `im_monthly_sales` de distintos años       | Comparar curvas mensuales año vs. año para un emprendedor          |
| Evolución del empleo           | `im_employment_snapshots`                  | Tendencia de empleados formales vs. informales a lo largo del tiempo|
| Transición de segmento         | `im_measurements.credit_segment_start/end` | Cuántos emprendedores migraron de segmento (ej: cuenta propia → crecimiento) |
| Progresión de apalancamiento   | `im_quarterly_balances`                    | Cómo evoluciona la relación deuda/activos en el tiempo             |

### 4.3 Indicadores de perfil demográfico

| Indicador                       | Fuente                                  | Descripción                                                           |
|---------------------------------|-----------------------------------------|-----------------------------------------------------------------------|
| Distribución por género         | `im_entrepreneur_demographics`          | % hombres vs. mujeres en el programa                                 |
| Ingreso per cápita vs. línea de pobreza | `im_entrepreneur_demographics`  | Cuántos emprendedores están por debajo de la línea de pobreza        |
| Cobertura de seguridad social   | `im_entrepreneur_demographics`          | % con pensión, salud contributiva, caja de compensación              |
| Mapa de municipios              | `im_entrepreneur_demographics`          | Distribución geográfica de los emprendedores atendidos               |
| Nivel educativo vs. impacto     | Cruce `demographics` + `measurements`   | Correlación entre nivel de estudio e indicadores de crecimiento       |

### 4.4 Indicadores de cartera

| Indicador                           | Fuente                | Descripción                                                       |
|-------------------------------------|-----------------------|-------------------------------------------------------------------|
| Concentración de riesgo             | `im_overdue_credits`  | % del saldo vencido total concentrado en top 10 deudores          |
| Distribución por clasificación      | `im_overdue_credits`  | Cantidad y monto por clasificación (A, B, E)                      |
| Días promedio de mora por aliado    | `im_overdue_credits`  | Promedio de `days_overdue` agrupado por aliado                    |
| Relación mora vs. ventas            | Cruce `overdue` + `monthly_sales` | Si los morosos tienen ventas más bajas que el promedio    |

### 4.5 Indicadores de recolección

| Indicador                          | Fuente                               | Descripción                                                      |
|------------------------------------|--------------------------------------|------------------------------------------------------------------|
| Tasa de adopción de prácticas      | `im_collection_responses`            | % que implementó prácticas enseñadas en el programa              |
| Necesidad de crédito               | `im_collection_responses`            | % que manifiesta necesidad de crédito y monto promedio solicitado|
| Destino de inversión               | `im_collection_responses`            | Distribución de destinos (capital de trabajo, maquinaria, etc.)  |
| Seguimiento contable               | `im_collection_responses`            | % con contador y método de registro financiero                   |

---

### Nota sobre GraphQL

Supabase también expone un endpoint GraphQL en `http://localhost:54321/graphql/v1`
con el mismo esquema de tablas, útil para consultas más complejas con múltiples joins
anidados.
