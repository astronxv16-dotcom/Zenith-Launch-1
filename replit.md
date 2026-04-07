# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

| Artifact | Kind | Dir | Description |
|---|---|---|---|
| `focus-launcher` | web (PWA) | `artifacts/focus-launcher/` | Minimalist Android-style launcher — React + Vite + Tailwind, frosted-glass aesthetic |
| `api-server` | api | `artifacts/api-server/` | Express 5 API server |

## Focus Launcher (PWA)

- Clock: pure transparent text, rgba(210,218,228,0.62), weight 100, 0.02em spacing
- DailyPlanner uses `createPortal` to `document.body` to escape CSS transform context
- State key: `focus_launcher_state_v3` in localStorage
- 3-panel swipe: FocusPanel (left) / HomeScreen (center)
- Direct Android intents for app launching
- Blocked apps trigger `navigator.vibrate(180)`
- Clock format: 12h/24h toggle in SettingsModal
- Planner lives in FocusPanel (left panel), not HomeScreen

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
