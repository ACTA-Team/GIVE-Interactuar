# Give

Monorepo project using npm workspaces.

## Structure

- `frontend/` — Next.js web application
- `.github/workflows/` — CI pipelines (lint, build)

## Getting started

```bash
npm install
```

## Scripts

| Command          | Description                          |
| ---------------- | ------------------------------------ |
| `npm run format` | Format all workspaces with Prettier  |
| `npm run lint`   | Lint all workspaces with ESLint      |
| `npm run build`  | Build all workspaces                 |

## Git hooks (Husky)

- **pre-commit** — runs `npm run format` and stages changes
- **pre-push** — runs `npm run lint` and `npm run build`
