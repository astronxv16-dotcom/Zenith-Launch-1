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
| `focus-launcher` | web (PWA) | `artifacts/focus-launcher/` | Phase 1 — React + Vite PWA launcher (frosted glass, 3-panel swipe) |
| `launcher-native` | mobile (Expo) | `artifacts/launcher-native/` | Phase 2 — Native Android launcher (Expo + react-native-launcher-kit) |
| `api-server` | api | `artifacts/api-server/` | Express 5 API server |

## Focus Launcher (PWA)

- Clock: pure transparent text, rgba(210,218,228,0.62), weight 100, 0.02em spacing
- DailyPlanner uses `createPortal` to `document.body` to escape CSS transform context
- State key: `focus_launcher_state_v3` in localStorage
- 3-panel swipe: FocusPanel (left) / HomeScreen (center) / — (right reserved)

## Focus Launcher (Native — Expo)

- **State**: `LauncherProvider` wraps root, `useLauncherStore()` hook, AsyncStorage persistence
- **Panels**: 3-panel horizontal PanResponder swipe (FocusPanel / Home / AppDrawer)
- **App launching**: `react-native-launcher-kit` (native module — needs EAS build, not Expo Go)
- **Default launcher**: HOME intent filter via `plugins/withLauncherIntent.js` config plugin
- **Settings**: `expo-intent-launcher` to open Android Default Apps settings
- **Clock**: 72pt weight-100, minute-synced interval, 12h/24h toggle

### Important native module caveats
- `react-native-launcher-kit` does NOT work in Expo Go — requires EAS build APK
- All `require('react-native-launcher-kit')` calls are guarded with try/catch + `Platform.OS !== 'android'` checks so the web/Expo Go preview works fine

### EAS Build instructions (to run APK on device)
See `artifacts/launcher-native/EAS_BUILD.md` for step-by-step APK build instructions.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
