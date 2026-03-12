# API GIVE Interactuar — Documentation

## Table of Contents

1. [REST Endpoints (Swagger)](#1-rest-endpoints-swagger)
   - [Organizations & Users](#11-organizations--users)
   - [Entrepreneurs](#12-entrepreneurs)
   - [Credentials](#13-credentials)
   - [Forms & Sync](#14-forms--sync)
   - [Verification](#15-verification)
   - [Analytics](#16-analytics)
   - [Credentials (Impact Measurement)](#17-credentials-impact-measurement)
2. [Direct Data Queries (Supabase PostgREST)](#2-direct-data-queries-supabase-postgrest)
3. [Suggested Derived Indicators](#3-suggested-derived-indicators)

---

## 1. REST Endpoints (Swagger)

Endpoints aligned with the OpenAPI 3.0 specification documented in
[Swagger UI](https://give-interactuar-docs-swagger.vercel.app/).

**Base URL:** `http://localhost:3003` (development)

### General Conventions

- All response fields use **snake_case**.
- List endpoints return an object with `data` (array) and `meta` (pagination).
- Individual endpoints (`/:id`) return `{ "data": { ... } }`.
- Pagination via query params: `page` (default 1) and `page_size` (default 50, max 200).

**Pagination model (`meta`):**

```json
{
  "total": 1000,
  "page": 1,
  "page_size": 50,
  "has_next": true
}
```

**Error model (`ErrorBody`):**

```json
{
  "error": "INVALID_PARAM",
  "message": "id must be a valid UUID",
  "details": null
}
```

**Response codes:**

| Code  | Meaning                                      |
| ----- | -------------------------------------------- |
| `200` | Successful request                           |
| `400` | Invalid parameter (malformed UUID, page < 1) |
| `404` | Resource not found (only on `/:id` routes)   |
| `500` | Internal server error                        |

---

### 1.1 Organizations & Users

#### `GET /api/organizations`

List of organizations.

| Parameter   | Type    | Required | Description            |
| ----------- | ------- | -------- | ---------------------- |
| `active`    | boolean | No       | Filter by status       |
| `page`      | integer | No       | Page (default 1)       |
| `page_size` | integer | No       | Page size (default 50) |

```bash
GET /api/organizations
GET /api/organizations?active=true&page_size=10
```

**Response:**

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

Individual organization.

```bash
GET /api/organizations/00000000-0000-0000-0000-000000000001
```

#### `GET /api/internal-users`

List of internal users.

| Parameter         | Type    | Required | Description                            |
| ----------------- | ------- | -------- | -------------------------------------- |
| `organization_id` | uuid    | No       | Filter by organization                 |
| `active`          | boolean | No       | Filter by status                       |
| `role`            | string  | No       | Filter by role (admin/operator/viewer) |
| `page`            | integer | No       | Page                                   |
| `page_size`       | integer | No       | Page size                              |

**Model fields (`InternalUser`):**

```
id, auth_user_id, organization_id, full_name, email, role, active, created_at, updated_at
```

#### `GET /api/internal-users/:id`

Individual internal user.

---

### 1.2 Entrepreneurs

#### `GET /api/entrepreneurs`

List of entrepreneurs with name search.

| Parameter      | Type    | Required | Description                |
| -------------- | ------- | -------- | -------------------------- |
| `query`        | string  | No       | Search by name (substring) |
| `municipality` | string  | No       | Filter by municipality     |
| `department`   | string  | No       | Filter by department       |
| `active`       | boolean | No       | Filter by status           |
| `page`         | integer | No       | Page                       |
| `page_size`    | integer | No       | Page size                  |

```bash
GET /api/entrepreneurs?query=Gustavo&page_size=5
GET /api/entrepreneurs?municipality=Medellín&active=true
```

**Model fields (`Entrepreneur`):**

```
id, organization_id, first_name, last_name, full_name, document_type, document_number,
email, phone, municipality, department, country, active, metadata, created_at, updated_at
```

#### `GET /api/entrepreneurs/:id`

Individual entrepreneur with optional enrichments (`business_profile`, `latest_snapshot`, `financial_profile`).

#### `GET /api/business-profiles`

Business profiles.

| Parameter         | Type | Required | Description            |
| ----------------- | ---- | -------- | ---------------------- |
| `entrepreneur_id` | uuid | No       | Filter by entrepreneur |

**Model fields (`BusinessProfile`):**

```
id, entrepreneur_id, business_name, business_sector, business_activity,
monthly_sales, monthly_costs, employee_count, formalized, metadata, created_at, updated_at
```

#### `GET /api/business-profiles/:id`

Individual business profile.

#### `GET /api/entrepreneur-snapshots`

Profile snapshots.

| Parameter         | Type    | Required | Description              |
| ----------------- | ------- | -------- | ------------------------ |
| `entrepreneur_id` | uuid    | No       | Filter by entrepreneur   |
| `is_latest`       | boolean | No       | Only the latest snapshot |

**Model fields (`EntrepreneurProfileSnapshot`):**

```
id, entrepreneur_id, source_submission_id, source_sync_run_id,
snapshot_version, is_latest, snapshot_date, data, created_at
```

#### `GET /api/entrepreneur-snapshots/:id`

Individual snapshot.

#### `GET /api/financial-profiles`

Financial profiles.

| Parameter         | Type   | Required | Description                                 |
| ----------------- | ------ | -------- | ------------------------------------------- |
| `entrepreneur_id` | uuid   | No       | Filter by entrepreneur                      |
| `credit_level`    | string | No       | Filter by level (bajo/medio/alto/excelente) |

**Model fields (`FinancialProfile`):**

```
id, entrepreneur_id, credit_level, loan_status, raw_data, imported_at, source_file
```

#### `GET /api/financial-profiles/:id`

Individual financial profile.

---

### 1.3 Credentials

#### `GET /api/credentials`

List of issued verifiable credentials.

| Parameter         | Type   | Required | Description                                              |
| ----------------- | ------ | -------- | -------------------------------------------------------- |
| `entrepreneur_id` | uuid   | No       | Filter by entrepreneur                                   |
| `status`          | string | No       | draft / issued / revoked / expired / pending_endorsement |
| `credential_type` | string | No       | impact / verification / endorsement                      |

**Model fields (`Credential`):**

```
id, organization_id, entrepreneur_id, template_id, source_draft_id, source_snapshot_id,
credential_type, status, title, description, public_id, issued_at, expires_at, revoked_at,
issuer_did, acta_vc_id, metadata, public_claims, created_by, created_at, updated_at
```

#### `GET /api/credentials/:id`

Individual credential by UUID.

#### `GET /api/credentials/public/:publicId`

Credential by public identifier (human-readable, for verification portal).

#### `GET /api/issuance-drafts`

Issuance drafts.

| Parameter         | Type   | Required | Description              |
| ----------------- | ------ | -------- | ------------------------ |
| `entrepreneur_id` | uuid   | No       | Filter by entrepreneur   |
| `status`          | string | No       | draft / ready / archived |

**Model fields (`IssuanceDraft`):**

```
id, organization_id, entrepreneur_id, template_id, latest_snapshot_id,
prepared_payload, status, created_by, created_at, updated_at
```

#### `GET /api/issuance-drafts/:id`

Individual draft.

#### `GET /api/credential-templates`

Credential templates.

| Parameter         | Type    | Required | Description                         |
| ----------------- | ------- | -------- | ----------------------------------- |
| `organization_id` | uuid    | No       | Filter by organization              |
| `credential_type` | string  | No       | impact / verification / endorsement |
| `active`          | boolean | No       | Filter by status                    |

**Model fields (`CredentialTemplate`):**

```
id, organization_id, name, credential_type, schema_version,
template_definition, active, created_at, updated_at
```

#### `GET /api/credential-templates/:id`

Individual template.

---

### 1.4 Forms & Sync

#### `GET /api/form-sources`

Form sources (Google Forms, etc.).

| Parameter         | Type    | Required | Description            |
| ----------------- | ------- | -------- | ---------------------- |
| `organization_id` | uuid    | No       | Filter by organization |
| `provider`        | string  | No       | Filter by provider     |
| `active`          | boolean | No       | Filter by status       |

**Model fields (`FormSource`):**

```
id, organization_id, provider, external_form_id, name, description,
active, metadata, created_at, updated_at
```

#### `GET /api/form-sources/:id`

Individual source.

#### `GET /api/form-submissions`

Raw form responses.

| Parameter        | Type | Required | Description           |
| ---------------- | ---- | -------- | --------------------- |
| `form_source_id` | uuid | No       | Filter by form source |

**Model fields (`FormSubmissionRaw`):**

```
id, form_source_id, external_response_id, submitted_at, responder_email,
raw_payload, raw_answers, checksum, synced_at, created_at
```

#### `GET /api/form-submissions/:id`

Individual response.

#### `GET /api/form-sync-runs`

Sync runs.

| Parameter        | Type   | Required | Description                                  |
| ---------------- | ------ | -------- | -------------------------------------------- |
| `form_source_id` | uuid   | No       | Filter by source                             |
| `status`         | string | No       | running / success / partial_success / failed |

**Model fields (`FormSyncRun`):**

```
id, form_source_id, status, started_at, finished_at, total_fetched,
total_inserted, total_updated, total_failed, error_log, metadata, created_at
```

#### `GET /api/form-sync-runs/:id`

Individual run.

---

### 1.5 Verification

#### `GET /api/verification-records`

Credential verification records.

| Parameter             | Type   | Required | Description          |
| --------------------- | ------ | -------- | -------------------- |
| `credential_id`       | uuid   | No       | Filter by credential |
| `verification_result` | string | No       | success / failed     |

**Model fields (`VerificationRecord`):**

```
id, credential_id, verifier_type, verifier_identifier,
verification_result, checked_at, metadata
```

#### `GET /api/verification-records/:id`

Individual record.

---

### 1.6 Analytics

#### `GET /api/analytics/dashboard`

Consolidated dashboard with aggregated metrics from the MicroMBA program.

No parameters.

**Response:**

```json
{
  "metadata": {
    "program": "MicroMBA GIVE Colombia",
    "period": "Impact Measurement",
    "note": "Aggregated data from im_measurements and related tables",
    "source": "Impact Measurement MicroMBA"
  },
  "summary": {
    "total_participants": 1000,
    "active_count": 830,
    "retention_rate_pct": 83.0,
    "women": 467,
    "men": 533,
    "women_percentage": 46.7,
    "previous_year_sales_total_cop": 0,
    "current_year_sales_total_cop": 0,
    "average_previous_year_sales_cop": 0,
    "average_current_year_sales_cop": 0,
    "average_variation_pct": 0,
    "full_time_jobs_previous_year": 0,
    "full_time_jobs_current_year": 0,
    "new_jobs": 0,
    "formalized_jobs": 0
  },
  "by_program": [
    {
      "program": "Entrepreneurial MBA",
      "participants": 624,
      "average_previous_year_sales_cop": 0,
      "average_current_year_sales_cop": 0,
      "average_variation_pct": 0,
      "new_jobs": 0
    }
  ],
  "by_gender": [
    {
      "gender": "Woman",
      "participants": 467,
      "average_previous_year_sales_cop": 0,
      "average_current_year_sales_cop": 0,
      "average_variation_pct": 0
    }
  ],
  "by_ally": [{ "ally": "Actec", "participants": 200, "new_jobs": 0 }],
  "by_age": [{ "range": "25-34", "participants": 150 }],
  "monthly_sales": [{ "month": "Jan", "average_cop": 58267857, "n": 92 }],
  "portfolio": {
    "total_with_credit": 700,
    "current": 113,
    "in_default": 587,
    "default_rate_pct": 83.86,
    "total_overdue_balance_cop": 5000000,
    "by_classification": [
      {
        "classification": "A",
        "label": "Normal (A)",
        "cases": 400,
        "overdue_balance_cop": 3000000
      }
    ]
  }
}
```

#### `GET /api/analytics/entrepreneurs`

Denormalized list of entrepreneurs with all measurement fields.

| Parameter          | Type    | Required | Description                                |
| ------------------ | ------- | -------- | ------------------------------------------ |
| `program`          | string  | No       | "Entrepreneurial MBA" / "Agribusiness MBA" |
| `gender`           | string  | No       | "Woman" / "Man"                            |
| `requested_credit` | string  | No       | "Yes" / "No"                               |
| `overdue`          | string  | No       | "Yes" / "No"                               |
| `page`             | integer | No       | Page (default 1)                           |
| `page_size`        | integer | No       | Page size (default 100, max 500)           |

```bash
GET /api/analytics/entrepreneurs?gender=Woman&page_size=10
GET /api/analytics/entrepreneurs?program=Entrepreneurial%20MBA&overdue=Yes
```

**Model fields (`EntrepreneurRecord`):**

```
document_number, full_name, business_name, program, ally, enrollment_status, gender,
municipality, sector, sales_prev_year_cop, sales_current_year_cop, sales_variation_pct,
new_jobs, level, cohort_name, cohort_year, active_credit, education_level,
socioeconomic_stratum, home_zone, legal_figure, business_size, age, age_range,
requested_credit, overdue, years_in_operation, total_costs_cop, total_assets_cop,
total_liabilities_cop, current_employees, is_formalized
```

---

### 1.7 Credentials (Impact Measurement)

Credentials that generate derived indicators from impact measurement data.

**General convention:**

- Parameter: `entrepreneur_id` (snake_case)
- Responses: **snake_case** on all keys
- Status codes: `200` (success), `400` (invalid param), `404` (not found), `500` (error)

#### 1.7.1 Impact Credential

> Does the business grow, sustain, or deteriorate?

| What it shows                                                                                                                                   | What it answers                                  | Minimum condition                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------ |
| Business, sector, years in operation, previous year sales, current year sales, sales variation, current jobs, new jobs generated and formalized | Does the business grow, sustain, or deteriorate? | Business, sales, and employment data must exist. |

**Endpoint:** `GET /api/credentials/impact`

**Parameters:**

| Parameter         | Type   | Required | Description                                                                    |
| ----------------- | ------ | -------- | ------------------------------------------------------------------------------ |
| `entrepreneur_id` | uuid   | No       | Entrepreneur ID. If omitted, returns all (with pagination).                    |
| `year`            | number | No       | Measurement year. If omitted, uses the most recent.                            |
| `verdict`         | string | No       | Filter by: `growing` \| `sustaining` \| `deteriorating` \| `insufficient_data` |
| `has_business`    | bool   | No       | `true` = only with business, `false` = only without business                   |
| `has_sales`       | bool   | No       | `true` = only with sales, `false` = only without sales                         |
| `has_employees`   | bool   | No       | `true` = only with employees, `false` = only without employees                 |
| `page`            | number | No       | Page number (default 1)                                                        |
| `page_size`       | number | No       | Records per page (default 50, max 200)                                         |

**Status codes:**

| Code  | Description                                                |
| ----- | ---------------------------------------------------------- |
| `200` | Successful request (individual or list)                    |
| `400` | `entrepreneur_id` is not a valid UUID or invalid parameter |
| `404` | Entrepreneur or measurement not found                      |
| `500` | Internal server error                                      |

**Examples:**

```bash
# Individual
GET /api/credentials/impact?entrepreneur_id=0012fb99-2591-426a-a708-5a3e8952582e

# List without filters
GET /api/credentials/impact?page_size=10

# Filter by verdict
GET /api/credentials/impact?verdict=growing&page_size=5

# Multiple filters
GET /api/credentials/impact?verdict=growing&has_sales=true&has_employees=true
```

**Response (individual):**

```json
{
  "data": {
    "entrepreneur_id": "0012fb99-...",
    "full_name": "Full Name",
    "document_number": "123456789",
    "business_name": "My Business S.A.S",
    "economic_sector": "Services",
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

**Response (list):**

```json
{
  "data": [
    { "entrepreneur_id": "...", "full_name": "...", "...": "..." },
    { "entrepreneur_id": "...", "full_name": "...", "...": "..." }
  ],
  "meta": { "total": 100, "page": 1, "page_size": 50, "has_next": true }
}
```

**Derived fields:**

| Field                 | Calculation                                                             |
| --------------------- | ----------------------------------------------------------------------- |
| `sales_variation_pct` | `((current_sales - previous_sales) / previous_sales) × 100`             |
| `new_jobs_generated`  | `current_employees - previous_employees`                                |
| `new_jobs_formalized` | `current_social_security - previous_social_security`                    |
| `verdict`             | `>5%` → `growing`, `-5% to 5%` → `sustaining`, `<-5%` → `deteriorating` |

---

#### 1.7.2 Behavior Credential

> Does the entrepreneur show signs of financial stability and payment capacity?

| What it shows                                                                                                                                                                                   | What it answers                                                               | Minimum condition                                          |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Credit segment start and end, active credit, average sales, costs and expenses, assets and liabilities, operating margin, debt-to-asset ratio, income stability, record validation and new jobs | Does the entrepreneur show signs of financial stability and payment capacity? | Sufficient financial data must exist to derive indicators. |

**Endpoint:** `GET /api/credentials/behavior`

**Parameters:**

| Parameter            | Type   | Required | Description                                                             |
| -------------------- | ------ | -------- | ----------------------------------------------------------------------- |
| `entrepreneur_id`    | uuid   | No       | Entrepreneur ID. If omitted, returns all (with pagination).             |
| `year`               | number | No       | Measurement year. If omitted, uses the most recent.                     |
| `financial_trend`    | string | No       | Filter by: `positive` \| `neutral` \| `negative` \| `insufficient_data` |
| `operating_capacity` | string | No       | Filter by: `high` \| `medium` \| `low` \| `insufficient_data`           |
| `leverage_level`     | string | No       | Filter by: `healthy` \| `moderate` \| `high` \| `insufficient_data`     |
| `credit_active`      | bool   | No       | `true` = with active credit, `false` = without credit                   |
| `has_financial_data` | bool   | No       | `true` = only with complete financial data                              |
| `page`               | number | No       | Page number (default 1)                                                 |
| `page_size`          | number | No       | Records per page (default 50, max 200)                                  |

**Status codes:** (200/400/404/500 — same as Impact Credential)

**Examples:**

```bash
# Individual
GET /api/credentials/behavior?entrepreneur_id=0012fb99-...

# List with financial trend filter
GET /api/credentials/behavior?financial_trend=positive&page_size=10

# With complete financial data
GET /api/credentials/behavior?has_financial_data=true

# Multiple filters
GET /api/credentials/behavior?financial_trend=positive&operating_capacity=high&credit_active=true
```

**Response (individual):**

```json
{
  "data": {
    "entrepreneur_id": "0012fb99-...",
    "full_name": "Full Name",
    "document_number": "123456789",
    "credit_segment_start": "growing",
    "credit_segment_end": "consolidation",
    "credit_active_12m": true,
    "avg_monthly_sales": 5000000,
    "avg_monthly_costs": 3000000,
    "total_assets": 80000000,
    "total_liabilities": 20000000,
    "estimated_operating_margin": 40.0,
    "leverage_ratio": 0.25,
    "monthly_income_stability": 0.85,
    "record_validity": "valid",
    "estimated_operating_capacity": "high",
    "leverage_level": "healthy",
    "commercial_stability": "moderate",
    "financial_trend": "positive"
  }
}
```

**Derived fields:**

| Field                          | Calculation                                                               |
| ------------------------------ | ------------------------------------------------------------------------- |
| `estimated_operating_margin`   | `((sales - costs) / sales) × 100`                                         |
| `leverage_ratio`               | `liabilities / assets`                                                    |
| `monthly_income_stability`     | `1 - coefficient_of_variation(monthly_sales)` (closer to 1 = more stable) |
| `estimated_operating_capacity` | Margin ≥20% → `high`, ≥10% → `medium`, <10% → `low`                       |
| `leverage_level`               | Ratio ≤0.4 → `healthy`, ≤0.7 → `moderate`, >0.7 → `high`                  |
| `commercial_stability`         | CV ≤0.15 → `stable`, ≤0.35 → `moderate`, >0.35 → `volatile`               |
| `financial_trend`              | Combines operating margin and leverage (see table below)                  |

**`financial_trend` logic:**

| Condition                         | Result     |
| --------------------------------- | ---------- |
| Margin ≥15% **and** Leverage ≤0.5 | `positive` |
| Margin ≥5% **and** Leverage ≤0.8  | `neutral`  |
| Any other case                    | `negative` |

---

#### 1.7.3 Profile Credential

> What is the formalization level and socioeconomic context of the entrepreneur?

| What it shows                                                                                                                                                                                                                       | What it answers                                                                | Minimum condition                           |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------- |
| Validated identity, education level, municipality and zone, household provider, household income, formalized business, NIT, years in operation, legal figure, business size, internet access, social security and job formalization | What is the formalization level and socioeconomic context of the entrepreneur? | Identity and formalization data must exist. |

**Endpoint:** `GET /api/credentials/profile`

**Parameters:**

| Parameter             | Type   | Required | Description                                                        |
| --------------------- | ------ | -------- | ------------------------------------------------------------------ |
| `entrepreneur_id`     | uuid   | No       | Entrepreneur ID. If omitted, returns all (with pagination).        |
| `is_formalized`       | bool   | No       | `true` = only formalized businesses, `false` = only non-formalized |
| `identity_validated`  | bool   | No       | `true` = only with validated identity, `false` = not validated     |
| `has_internet`        | bool   | No       | `true` = only with internet, `false` = without internet            |
| `contributes_pension` | bool   | No       | `true` = only pension contributors, `false` = non-contributors     |
| `page`                | number | No       | Page number (default 1)                                            |
| `page_size`           | number | No       | Records per page (default 50, max 200)                             |

**Status codes:** (200/400/404/500 — same as Impact Credential)

**Examples:**

```bash
# Individual
GET /api/credentials/profile?entrepreneur_id=0012fb99-...

# List: only formalized businesses
GET /api/credentials/profile?is_formalized=true&page_size=10

# Formalized AND identity validated
GET /api/credentials/profile?is_formalized=true&identity_validated=true

# With internet AND pension contribution
GET /api/credentials/profile?has_internet=true&contributes_pension=true&page_size=20
```

**Response (individual):**

```json
{
  "data": {
    "entrepreneur_id": "0012fb99-...",
    "full_name": "Full Name",
    "document_number": "123456789",
    "document_type": "CC",
    "identity_validated": true,
    "education_level": "Technical",
    "municipality": "Medellín",
    "residence_zone": "urban_center",
    "is_primary_provider": true,
    "avg_household_income": 3000000,
    "business_formalized": true,
    "nit": "123456789-1",
    "years_in_operation": 5,
    "legal_figure": "Natural person responsible for VAT",
    "business_size": "micro_enterprise",
    "has_internet": true,
    "health_regime": "Contributory",
    "contributes_pension": true,
    "compensation_fund": "Family compensation fund"
  }
}
```

**Response (list):**

```json
{
  "data": [
    { "entrepreneur_id": "...", "full_name": "...", "...": "..." },
    { "entrepreneur_id": "...", "full_name": "...", "...": "..." }
  ],
  "meta": { "total": 100, "page": 1, "page_size": 50, "has_next": true }
}
```

---

## 2. Direct Data Queries (Supabase PostgREST)

To query raw table data directly, use the auto-generated REST API from
Supabase (PostgREST).

### Configuration

**Base URL:** `http://localhost:54321/rest/v1/`

**Required headers:**

```
apikey: <NEXT_PUBLIC_SUPABASE_ANON_KEY>
Authorization: Bearer <NEXT_PUBLIC_SUPABASE_ANON_KEY>
Content-Type: application/json
```

> To bypass RLS use `SUPABASE_SERVICE_ROLE_KEY` instead of `ANON_KEY`.

---

### Reference Tables

Catalog and master list data.

| Endpoint                          | Description          | Records |
| --------------------------------- | -------------------- | ------- |
| `/rest/v1/im_allies`              | Program allies       | 10      |
| `/rest/v1/im_consultants`         | Assigned consultants | 34      |
| `/rest/v1/im_levels`              | Program levels       | 4       |
| `/rest/v1/im_economic_sectors`    | Economic sectors     | 7       |
| `/rest/v1/im_economic_activities` | Economic activities  | 141     |
| `/rest/v1/im_legal_figures`       | Legal figures        | 5       |
| `/rest/v1/im_education_levels`    | Education levels     | 9       |
| `/rest/v1/im_marital_statuses`    | Marital statuses     | 6       |
| `/rest/v1/im_compensation_funds`  | Compensation funds   | 7       |

**Example — list all economic sectors:**

```bash
curl "http://localhost:54321/rest/v1/im_economic_sectors?select=id,name" \
  -H "apikey: <YOUR_APIKEY>"
```

---

### Entity Tables

Entrepreneur, cohort, and business data.

| Endpoint                                        | Description                | Records |
| ----------------------------------------------- | -------------------------- | ------- |
| `/rest/v1/im_cohorts`                           | Cohorts/groups             | 101     |
| `/rest/v1/im_entrepreneur_demographics`         | Entrepreneur demographics  | 1,403   |
| `/rest/v1/im_entrepreneur_self_identifications` | Ethnic self-identification | 56      |
| `/rest/v1/im_businesses`                        | Business data              | 1,403   |

**Example — entrepreneurs with demographics (join):**

```bash
curl "http://localhost:54321/rest/v1/im_entrepreneur_demographics?select=*,entrepreneurs(full_name,document_number)" \
  -H "apikey: <YOUR_APIKEY>"
```

**Example — businesses in a municipality with economic activity:**

```bash
curl "http://localhost:54321/rest/v1/im_businesses?select=business_name,nit,municipality,im_economic_activities(name,im_economic_sectors(name))&municipality=eq.Medellín" \
  -H "apikey: <YOUR_APIKEY>"
```

**Example — cohorts from a specific ally:**

```bash
curl "http://localhost:54321/rest/v1/im_cohorts?select=name,cohort_year,program,im_allies(name)&ally_id=eq.<ALLY_UUID>" \
  -H "apikey: <YOUR_APIKEY>"
```

---

### Measurement Tables

Impact measurement process data.

| Endpoint                           | Description                      | Records |
| ---------------------------------- | -------------------------------- | ------- |
| `/rest/v1/im_measurements`         | Measurements (fact table)        | 1,460   |
| `/rest/v1/im_monthly_sales`        | Monthly sales                    | 15,232  |
| `/rest/v1/im_monthly_costs`        | Monthly costs                    | 14,903  |
| `/rest/v1/im_quarterly_balances`   | Quarterly balances               | 3,658   |
| `/rest/v1/im_employment_snapshots` | Employment (prev_year / current) | 2,232   |

**Example — 2024 measurements with cohort and consultant:**

```bash
curl "http://localhost:54321/rest/v1/im_measurements?measurement_year=eq.2024&select=*,im_cohorts(name,program),im_consultants(full_name)" \
  -H "apikey: <YOUR_APIKEY>"
```

**Example — monthly sales for a measurement:**

```bash
curl "http://localhost:54321/rest/v1/im_monthly_sales?measurement_id=eq.<MEASUREMENT_UUID>&order=month.asc&select=month,amount" \
  -H "apikey: <YOUR_APIKEY>"
```

**Example — employment snapshots for current period:**

```bash
curl "http://localhost:54321/rest/v1/im_employment_snapshots?period=eq.current_year&select=*,im_measurements(entrepreneur_id,measurement_year)" \
  -H "apikey: <YOUR_APIKEY>"
```

---

### Portfolio & Collection Tables

Overdue credit and collection tracking data.

| Endpoint                                 | Description            | Records |
| ---------------------------------------- | ---------------------- | ------- |
| `/rest/v1/im_overdue_credits`            | Overdue credits        | 587     |
| `/rest/v1/im_collection_responses`       | Collection responses   | 1,474   |
| `/rest/v1/im_collection_monthly_figures` | Collection sales/costs | 2,427   |
| `/rest/v1/im_collection_balances`        | Collection balances    | 463     |

**Example — overdue credits with entrepreneur data:**

```bash
curl "http://localhost:54321/rest/v1/im_overdue_credits?select=*,entrepreneurs(full_name,document_number)&order=overdue_balance.desc" \
  -H "apikey: <YOUR_APIKEY>"
```

**Example — collection responses from a period:**

```bash
curl "http://localhost:54321/rest/v1/im_collection_responses?collection_period=eq.jan_mar&collection_year=eq.2026&select=*,entrepreneurs(full_name)" \
  -H "apikey: <YOUR_APIKEY>"
```

---

### Useful PostgREST Operators

| Operator    | Usage                  | Example                          |
| ----------- | ---------------------- | -------------------------------- |
| `eq`        | Equal to               | `?field=eq.value`                |
| `neq`       | Not equal to           | `?field=neq.value`               |
| `gt`/`lt`   | Greater/less than      | `?amount=gt.1000000`             |
| `gte`/`lte` | Greater/less or equal  | `?measurement_year=gte.2023`     |
| `like`      | Partial match          | `?full_name=like.*Restrepo*`     |
| `ilike`     | Case-insensitive match | `?municipality=ilike.*medellin*` |
| `in`        | In list                | `?classification=in.(A,B)`       |
| `is`        | Is null / not null     | `?nit=not.is.null`               |
| `order`     | Order results          | `?order=amount.desc`             |
| `limit`     | Limit results          | `?limit=10`                      |
| `offset`    | Paginate from          | `?offset=20&limit=10`            |

---

## 3. Suggested Derived Indicators

The loaded data allows generating additional indicators that could be useful
for analysis or future endpoints.

### 3.1 Indicators by Cohort / Ally

| Indicator                    | Source                                   | Description                                                 |
| ---------------------------- | ---------------------------------------- | ----------------------------------------------------------- |
| Growth rate by cohort        | `im_measurements` + `im_monthly_sales`   | Average % sales variation grouped by cohort                 |
| Job generation by ally       | `im_employment_snapshots` + `im_cohorts` | Total new jobs generated, grouped by ally                   |
| Formalization rate by cohort | `im_businesses`                          | % of businesses with NIT and formal legal figure per cohort |
| Default rate by ally         | `im_overdue_credits`                     | Total overdue balance and credit count per ally             |

### 3.2 Longitudinal Indicators (across years)

| Indicator            | Source                                     | Description                                                            |
| -------------------- | ------------------------------------------ | ---------------------------------------------------------------------- |
| Sales evolution      | `im_monthly_sales` across years            | Compare monthly curves year vs. year for an entrepreneur               |
| Employment evolution | `im_employment_snapshots`                  | Trend of formal vs. informal employees over time                       |
| Segment transition   | `im_measurements.credit_segment_start/end` | How many entrepreneurs migrated segments (e.g. self-employed → growth) |
| Leverage progression | `im_quarterly_balances`                    | How debt-to-asset ratio evolves over time                              |

### 3.3 Demographic Profile Indicators

| Indicator                          | Source                                | Description                                               |
| ---------------------------------- | ------------------------------------- | --------------------------------------------------------- |
| Gender distribution                | `im_entrepreneur_demographics`        | % men vs. women in the program                            |
| Per capita income vs. poverty line | `im_entrepreneur_demographics`        | How many entrepreneurs are below the poverty line         |
| Social security coverage           | `im_entrepreneur_demographics`        | % with pension, contributory health, compensation fund    |
| Municipality map                   | `im_entrepreneur_demographics`        | Geographic distribution of served entrepreneurs           |
| Education level vs. impact         | Cross `demographics` + `measurements` | Correlation between education level and growth indicators |

### 3.4 Portfolio Indicators

| Indicator                      | Source                            | Description                                               |
| ------------------------------ | --------------------------------- | --------------------------------------------------------- |
| Risk concentration             | `im_overdue_credits`              | % of total overdue balance concentrated in top 10 debtors |
| Distribution by classification | `im_overdue_credits`              | Count and amount by classification (A, B, E)              |
| Average days overdue by ally   | `im_overdue_credits`              | Average `days_overdue` grouped by ally                    |
| Default vs. sales relationship | Cross `overdue` + `monthly_sales` | Whether defaulters have lower sales than average          |

### 3.5 Collection Indicators

| Indicator              | Source                    | Description                                                     |
| ---------------------- | ------------------------- | --------------------------------------------------------------- |
| Practice adoption rate | `im_collection_responses` | % that implemented practices taught in the program              |
| Credit need            | `im_collection_responses` | % expressing credit need and average requested amount           |
| Investment destination | `im_collection_responses` | Distribution of destinations (working capital, machinery, etc.) |
| Accounting tracking    | `im_collection_responses` | % with accountant and financial recording method                |

---

### Note on GraphQL

Supabase also exposes a GraphQL endpoint at `http://localhost:54321/graphql/v1`
with the same table schema, useful for more complex queries with multiple nested joins.
