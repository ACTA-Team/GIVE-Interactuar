# API de Medición de Impacto — Documentación

## Tabla de contenido

1. [Endpoints de Credenciales (Next.js)](#1-endpoints-de-credenciales-nextjs)
   - [Impact Credential](#11-impact-credential--credencial-de-impacto)
   - [Behavior Credential](#12-behavior-credential--credencial-de-comportamiento)
   - [Profile Credential](#13-profile-credential--credencial-de-perfil-y-formalización)
2. [Consulta directa de datos (Supabase PostgREST)](#2-consulta-directa-de-datos-supabase-postgrest)
   - [Configuración](#configuración)
   - [Tablas de referencia](#tablas-de-referencia)
   - [Tablas de entidades](#tablas-de-entidades)
   - [Tablas de medición](#tablas-de-medición)
   - [Tablas de cartera y recolección](#tablas-de-cartera-y-recolección)
3. [Sugerencias de datos derivados](#3-sugerencias-de-datos-derivados)

---

## 1. Endpoints de Credenciales (Next.js)

Estos endpoints procesan y transforman los datos crudos en indicadores derivados listos
para consumo. Se acceden a través de la app Next.js.

**URL base:** `http://localhost:3003` (desarrollo)

---

### 1.1 Impact Credential — Credencial de Impacto

> ¿El negocio crece, se sostiene o se deteriora?

**Endpoint:** `GET /api/credentials/impact`

| Parámetro        | Tipo   | Requerido | Descripción                                        |
| ---------------- | ------ | --------- | -------------------------------------------------- |
| `entrepreneurId` | uuid   | No        | ID del emprendedor. Si se omite, retorna todos.    |
| `year`           | number | No        | Año de medición. Si se omite, usa el más reciente. |

**Ejemplos:**

```bash
# Todos los emprendedores
GET /api/credentials/impact

# Un emprendedor específico
GET /api/credentials/impact?entrepreneurId=0012fb99-2591-426a-a708-5a3e8952582e

# Filtrado por año
GET /api/credentials/impact?year=2024

# Combinado
GET /api/credentials/impact?entrepreneurId=0012fb99-...&year=2024
```

**Respuesta (individual):**

```json
{
  "data": {
    "entrepreneurId": "0012fb99-...",
    "fullName": "Nombre Completo",
    "documentNumber": "123456789",
    "businessName": "Mi Empresa S.A.S",
    "economicSector": "Servicios",
    "yearsInOperation": 5,
    "totalSalesPrevYear": 50000000,
    "totalSalesCurrentYear": 60000000,
    "salesVariationPct": 20.0,
    "currentFullTimeEmployees": 4,
    "newJobsGenerated": 2,
    "newJobsFormalized": 1,
    "verdict": "growing"
  }
}
```

**Respuesta (lista):** `{ "data": [ ...array de objetos... ] }`

**Campos derivados:**

| Campo               | Cálculo                                                          |
| ------------------- | ---------------------------------------------------------------- |
| `salesVariationPct` | `((ventasActuales - ventasPrevias) / ventasPrevias) × 100`       |
| `newJobsGenerated`  | `empleados_actuales - empleados_previos`                         |
| `newJobsFormalized` | `seguridad_social_actual - seguridad_social_previa`              |
| `verdict`           | `>5%` → growing, `-5% a 5%` → sustaining, `<-5%` → deteriorating |

---

### 1.2 Behavior Credential — Credencial de Comportamiento

> ¿El emprendedor muestra estabilidad financiera y capacidad de pago?

**Endpoint:** `GET /api/credentials/behavior`

| Parámetro        | Tipo   | Requerido | Descripción                                        |
| ---------------- | ------ | --------- | -------------------------------------------------- |
| `entrepreneurId` | uuid   | No        | ID del emprendedor. Si se omite, retorna todos.    |
| `year`           | number | No        | Año de medición. Si se omite, usa el más reciente. |

**Ejemplos:**

```bash
# Todos los emprendedores
GET /api/credentials/behavior

# Un emprendedor con año específico
GET /api/credentials/behavior?entrepreneurId=0012fb99-...&year=2024
```

**Respuesta (individual):**

```json
{
  "data": {
    "entrepreneurId": "0012fb99-...",
    "fullName": "Nombre Completo",
    "documentNumber": "123456789",
    "creditSegmentStart": "en_crecimiento",
    "creditSegmentEnd": "consolidacion",
    "creditActive12m": true,
    "avgMonthlySales": 5000000,
    "avgMonthlyCosts": 3000000,
    "totalAssets": 80000000,
    "totalLiabilities": 20000000,
    "estimatedOperatingMargin": 40.0,
    "leverageRatio": 0.25,
    "monthlyIncomeStability": 0.85,
    "recordValidity": "valido",
    "estimatedOperatingCapacity": "high",
    "leverageLevel": "healthy",
    "commercialStability": "moderate",
    "financialTrend": "positive"
  }
}
```

**Campos derivados:**

| Campo                        | Cálculo                                                                          |
| ---------------------------- | -------------------------------------------------------------------------------- |
| `estimatedOperatingMargin`   | `((ventas - costos) / ventas) × 100`                                             |
| `leverageRatio`              | `pasivos / activos`                                                              |
| `monthlyIncomeStability`     | `1 - coeficiente_de_variación(ventas_mensuales)` (más cercano a 1 = más estable) |
| `estimatedOperatingCapacity` | Margen ≥20% → `high`, ≥10% → `medium`, <10% → `low`                              |
| `leverageLevel`              | Ratio ≤0.4 → `healthy`, ≤0.7 → `moderate`, >0.7 → `high`                         |
| `commercialStability`        | CV ≤0.15 → `stable`, ≤0.35 → `moderate`, >0.35 → `volatile`                      |
| `financialTrend`             | Combina margen operativo y apalancamiento (ver tabla abajo)                      |

**Lógica de `financialTrend`:**

| Condición                             | Resultado  |
| ------------------------------------- | ---------- |
| Margen ≥15% **y** Apalancamiento ≤0.5 | `positive` |
| Margen ≥5% **y** Apalancamiento ≤0.8  | `neutral`  |
| Cualquier otro caso                   | `negative` |

---

### 1.3 Profile Credential — Credencial de Perfil y Formalización

> ¿Qué tan formal, estable y rastreable es el solicitante y su negocio?

**Endpoint:** `GET /api/credentials/profile`

| Parámetro        | Tipo | Requerido | Descripción                                     |
| ---------------- | ---- | --------- | ----------------------------------------------- |
| `entrepreneurId` | uuid | No        | ID del emprendedor. Si se omite, retorna todos. |

**Ejemplos:**

```bash
# Todos los emprendedores
GET /api/credentials/profile

# Un emprendedor específico
GET /api/credentials/profile?entrepreneurId=0012fb99-...
```

**Respuesta (individual):**

```json
{
  "data": {
    "entrepreneurId": "0012fb99-...",
    "fullName": "Nombre Completo",
    "documentNumber": "123456789",
    "documentType": "CC",
    "identityValidated": true,
    "educationLevel": "Especialización",
    "municipality": "Medellín",
    "residenceZone": "cabecera_urbana",
    "isPrimaryProvider": false,
    "avgHouseholdIncome": 2500000,
    "businessFormalized": true,
    "nit": "900838560",
    "yearsInOperation": 5,
    "legalFigure": "Persona jurídica",
    "businessSize": "microempresa",
    "hasInternet": true,
    "healthRegime": "Contributivo",
    "contributesPension": true,
    "compensationFund": "Comfama"
  }
}
```

**Campos derivados:**

| Campo                | Cálculo                                                                   |
| -------------------- | ------------------------------------------------------------------------- |
| `identityValidated`  | `true` si tiene número de documento no vacío                              |
| `businessFormalized` | `true` si tiene NIT **y** la figura legal ≠ "Sin formalización (sin RUT)" |
| `hasInternet`        | `true` si el acceso a internet no contiene "no tengo"                     |
| `contributesPension` | `true` si la respuesta comienza con "sí/si" o menciona "BEPS"             |
| `yearsInOperation`   | Calculado a partir de `founded_date` hasta hoy                            |

**Códigos de respuesta (todos los endpoints):**

| Código | Significado                                    |
| ------ | ---------------------------------------------- |
| `200`  | Éxito                                          |
| `404`  | Emprendedor o datos de medición no encontrados |
| `500`  | Error interno del servidor                     |

---

## 2. Consulta directa de datos (Supabase PostgREST)

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

| Endpoint                          | Descripción            | Registros |
| --------------------------------- | ---------------------- | --------- |
| `/rest/v1/im_allies`              | Aliados del programa   | 10        |
| `/rest/v1/im_consultants`         | Consultores asignados  | 34        |
| `/rest/v1/im_levels`              | Niveles del programa   | 4         |
| `/rest/v1/im_economic_sectors`    | Sectores económicos    | 7         |
| `/rest/v1/im_economic_activities` | Actividades económicas | 141       |
| `/rest/v1/im_legal_figures`       | Figuras legales        | 5         |
| `/rest/v1/im_education_levels`    | Niveles de escolaridad | 9         |
| `/rest/v1/im_marital_statuses`    | Estados civiles        | 6         |
| `/rest/v1/im_compensation_funds`  | Cajas de compensación  | 7         |

**Ejemplo — listar todos los sectores económicos:**

```bash
curl "http://localhost:54321/rest/v1/im_economic_sectors?select=id,name" \
  -H "apikey: <TU_APIKEY>"
```

---

### Tablas de entidades

Datos de emprendedores, cohortes y negocios.

| Endpoint                                        | Descripción                | Registros |
| ----------------------------------------------- | -------------------------- | --------- |
| `/rest/v1/im_cohorts`                           | Cohortes/grupos            | 101       |
| `/rest/v1/im_entrepreneur_demographics`         | Demografía del emprendedor | 1,403     |
| `/rest/v1/im_entrepreneur_self_identifications` | Autoidentificación étnica  | 56        |
| `/rest/v1/im_businesses`                        | Datos del negocio          | 1,403     |

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

| Endpoint                           | Descripción                  | Registros |
| ---------------------------------- | ---------------------------- | --------- |
| `/rest/v1/im_measurements`         | Mediciones (tabla hecho)     | 1,460     |
| `/rest/v1/im_monthly_sales`        | Ventas mensuales             | 15,232    |
| `/rest/v1/im_monthly_costs`        | Costos mensuales             | 14,903    |
| `/rest/v1/im_quarterly_balances`   | Balances trimestrales        | 3,658     |
| `/rest/v1/im_employment_snapshots` | Empleo (prev_year / current) | 2,232     |

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

| Endpoint                                 | Descripción                  | Registros |
| ---------------------------------------- | ---------------------------- | --------- |
| `/rest/v1/im_overdue_credits`            | Cartera vencida              | 587       |
| `/rest/v1/im_collection_responses`       | Respuestas de recolección    | 1,474     |
| `/rest/v1/im_collection_monthly_figures` | Ventas/costos de recolección | 2,427     |
| `/rest/v1/im_collection_balances`        | Balances de recolección      | 463       |

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

| Operador    | Uso                         | Ejemplo                          |
| ----------- | --------------------------- | -------------------------------- |
| `eq`        | Igual a                     | `?field=eq.valor`                |
| `neq`       | Distinto de                 | `?field=neq.valor`               |
| `gt`/`lt`   | Mayor/menor que             | `?amount=gt.1000000`             |
| `gte`/`lte` | Mayor/menor o igual         | `?measurement_year=gte.2023`     |
| `like`      | Coincidencia parcial        | `?full_name=like.*Restrepo*`     |
| `ilike`     | Coincidencia sin mayúsculas | `?municipality=ilike.*medellin*` |
| `in`        | Está en lista               | `?classification=in.(A,B)`       |
| `is`        | Es null / not null          | `?nit=not.is.null`               |
| `order`     | Ordenar resultados          | `?order=amount.desc`             |
| `limit`     | Limitar resultados          | `?limit=10`                      |
| `offset`    | Paginar desde               | `?offset=20&limit=10`            |

---

## 3. Sugerencias de datos derivados

Los datos cargados permiten generar indicadores adicionales que podrían ser útiles
para análisis o futuros endpoints.

### 3.1 Indicadores por cohorte / aliado

| Indicador                         | Fuente                                   | Descripción                                             |
| --------------------------------- | ---------------------------------------- | ------------------------------------------------------- |
| Tasa de crecimiento por cohorte   | `im_measurements` + `im_monthly_sales`   | % promedio de variación de ventas agrupado por cohorte  |
| Generación de empleo por aliado   | `im_employment_snapshots` + `im_cohorts` | Total de nuevos empleos generados, agrupado por aliado  |
| Tasa de formalización por cohorte | `im_businesses`                          | % de negocios con NIT y figura legal formal por cohorte |
| Morosidad por aliado              | `im_overdue_credits`                     | Saldo total vencido y cantidad de créditos por aliado   |

### 3.2 Indicadores longitudinales (entre años)

| Indicador                    | Fuente                                     | Descripción                                                                  |
| ---------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------- |
| Evolución de ventas          | `im_monthly_sales` de distintos años       | Comparar curvas mensuales año vs. año para un emprendedor                    |
| Evolución del empleo         | `im_employment_snapshots`                  | Tendencia de empleados formales vs. informales a lo largo del tiempo         |
| Transición de segmento       | `im_measurements.credit_segment_start/end` | Cuántos emprendedores migraron de segmento (ej: cuenta propia → crecimiento) |
| Progresión de apalancamiento | `im_quarterly_balances`                    | Cómo evoluciona la relación deuda/activos en el tiempo                       |

### 3.3 Indicadores de perfil demográfico

| Indicador                               | Fuente                                | Descripción                                                     |
| --------------------------------------- | ------------------------------------- | --------------------------------------------------------------- |
| Distribución por género                 | `im_entrepreneur_demographics`        | % hombres vs. mujeres en el programa                            |
| Ingreso per cápita vs. línea de pobreza | `im_entrepreneur_demographics`        | Cuántos emprendedores están por debajo de la línea de pobreza   |
| Cobertura de seguridad social           | `im_entrepreneur_demographics`        | % con pensión, salud contributiva, caja de compensación         |
| Mapa de municipios                      | `im_entrepreneur_demographics`        | Distribución geográfica de los emprendedores atendidos          |
| Nivel educativo vs. impacto             | Cruce `demographics` + `measurements` | Correlación entre nivel de estudio e indicadores de crecimiento |

### 3.4 Indicadores de cartera

| Indicador                        | Fuente                            | Descripción                                              |
| -------------------------------- | --------------------------------- | -------------------------------------------------------- |
| Concentración de riesgo          | `im_overdue_credits`              | % del saldo vencido total concentrado en top 10 deudores |
| Distribución por clasificación   | `im_overdue_credits`              | Cantidad y monto por clasificación (A, B, E)             |
| Días promedio de mora por aliado | `im_overdue_credits`              | Promedio de `days_overdue` agrupado por aliado           |
| Relación mora vs. ventas         | Cruce `overdue` + `monthly_sales` | Si los morosos tienen ventas más bajas que el promedio   |

### 3.5 Indicadores de recolección

| Indicador                     | Fuente                    | Descripción                                                       |
| ----------------------------- | ------------------------- | ----------------------------------------------------------------- |
| Tasa de adopción de prácticas | `im_collection_responses` | % que implementó prácticas enseñadas en el programa               |
| Necesidad de crédito          | `im_collection_responses` | % que manifiesta necesidad de crédito y monto promedio solicitado |
| Destino de inversión          | `im_collection_responses` | Distribución de destinos (capital de trabajo, maquinaria, etc.)   |
| Seguimiento contable          | `im_collection_responses` | % con contador y método de registro financiero                    |

---

### Nota sobre GraphQL

Supabase también expone un endpoint GraphQL en `http://localhost:54321/graphql/v1`
con el mismo esquema de tablas, útil para consultas más complejas con múltiples joins
anidados.
