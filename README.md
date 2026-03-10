# GIVE-Interactuar

GIVE-Interactuar is currently best understood as a starter pack for the GIVE-Interactuar project.

The product purpose is not fully documented in this repository yet, but the codebase already makes the technical direction clear: this repo combines a Next.js frontend, Supabase backend resources, and credential-oriented integrations around ACTA, Stellar, and Google Forms ingestion.

## What This Repo Contains

- A single `frontend/` application built with Next.js App Router
- Supabase local config, SQL migration, seed data, and an Edge Function
- Scaffolded dashboard and verification routes
- Feature modules for entrepreneurs, credentials, verification, organizations, forms sync, and dashboard flows
- Tooling for linting, formatting, and local git hooks

## Verified Stack

### Frontend

- Next.js 16
- React 19
- TypeScript 5
- Tailwind CSS 4
- React Query
- React Hook Form
- Zod

### Backend and Data

- Supabase SSR + Supabase JS
- Supabase local development via `frontend/supabase/`
- SQL migration and seed workflow for the initial schema
- Next.js cron route for forms sync
- Supabase Edge Function scaffold for forms sync

### Integrations

- `@acta-team/acta-sdk`
- Stellar SDK
- Stellar Wallets Kit
- Google Forms sync via service-account credentials

### Tooling

- ESLint
- Prettier
- Husky
- GitHub Actions workflows for build and lint

## Current Building Blocks

The codebase already includes starter modules for:

- Dashboard pages and shared layout structure
- Entrepreneur management
- Credential flows
- Public verification flow
- Organization-related services and types
- Forms sync ingestion and mapping

Some areas are still scaffold-level. There are explicit TODOs in orchestration and edge-function code, and the root landing page remains close to the default Next.js starter state.

## Repository Shape

```text
.
├── .agents/skills/          # Shared skill definitions for agent-assisted work
├── .agent/skills/           # Agent-facing skill mirror
├── .claude/skills/          # Claude-facing skill mirror
├── frontend/
│   ├── src/app/             # Next.js app routes
│   ├── src/features/        # Feature-oriented modules
│   ├── src/lib/             # Shared services, helpers, Supabase clients
│   └── supabase/            # Local Supabase config, migrations, seed, functions
└── .github/workflows/       # Build and lint workflows
```

## Skills and Agentic Flow

This repo also carries local skills for agent-assisted development. The installed skill set currently covers:

- `acta` for ACTA credential and vault workflows
- `frontend-design` for UI implementation and polish
- `next-best-practices` for Next.js conventions
- `supabase-postgres-best-practices` for database and query guidance
- `vercel-composition-patterns` and `vercel-react-best-practices` for React architecture and performance
- `web-design-guidelines` for interface review and accessibility checks

The intended agentic flow is simple:

1. Inspect the repo and current branch state first.
2. Choose the relevant local skill when a task matches one of those domains.
3. Implement or review changes against the existing repo conventions.
4. Validate the result with targeted checks, then commit, push, and open a PR through the fork-based workflow when needed.

The `.agents`, `.agent`, and `.claude` directories exist to expose the same skill inventory to different agent runtimes while keeping the project workflow consistent.

## Contributing

This repository follows a gitflow-style contribution model.

### Branching model

- `main` is reserved for stable integration milestones
- `dev` is the active integration branch
- feature work should happen in branches named like `feat/<short-description>`

### Contribution flow

1. Fork the main repository.
2. Add the main repository as your upstream remote if needed.
3. Fetch the latest upstream changes and branch from `dev`.
4. Implement your change in a feature branch.
5. Push the branch to your fork.
6. Open a pull request from your fork back to the main repository targeting `dev`.

### Practical notes

- Keep pull requests focused and small when possible.
- Follow the existing conventional commit style, such as `feat:` and `chore:`.
- Before opening a PR, sync with the latest upstream `dev` so your branch is based on the current integration branch.
- If you are using an agent-assisted workflow, inspect the repo first, use the relevant local skill when appropriate, and validate changes before opening the PR.

## Local Development

### Prerequisites

- Node.js 20
- npm
- Supabase CLI

### Run the app

```bash
cd frontend
npm ci
cp .env.example .env.local
npm run dev
```

The app will start on `http://localhost:3000`.

## Environment Overview

The frontend expects configuration for:

- Supabase URL, anon key, and service role key
- App base URL
- Stellar network selection
- Google Forms service-account credentials and form identifiers
- Cron authentication secret

Use `frontend/.env.example` as the source of truth for required variables.

## Current Reading of the Repo

If you need a one-line description today, use this:

> A starter pack for GIVE-Interactuar with a Next.js frontend, Supabase backend scaffolding, and early credential and forms-sync building blocks.
