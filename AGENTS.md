# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Repo overview
This is a pnpm + Turborepo monorepo with two primary apps and several shared packages:
- `apps/nextjs`: Next.js (App Router) web app + the tRPC HTTP endpoint (and some webhooks).
- `apps/expo`: Expo + `expo-router` mobile app.
- `packages/api`: Shared tRPC router definitions (business logic lives here).
- `packages/db`: Prisma schema + Prisma client export.
- `packages/config/*`: Shared ESLint + Tailwind configs.

## Common commands
All commands below are run from the repo root unless otherwise noted.

### Install
```bash
pnpm install
```

Notes:
- Root `package.json` enforces `node >= 22.19.0` and `pnpm >= 10.15.1`.
- `.nvmrc` currently contains `18` (this conflicts with the root engine requirement).

### Dev (run apps)
Run both apps (Turbo parallel):
```bash
pnpm dev
```

Run just one app:
```bash
pnpm dev:nextjs
pnpm dev:expo
```

Equivalent pnpm filter form (useful when you want interactive logs in separate terminals):
```bash
pnpm --filter nextjs dev
pnpm --filter expo dev
```

### Build
Build everything via Turborepo:
```bash
pnpm build
```

Build a single app:
```bash
pnpm --filter nextjs build
```

### Lint / format / typecheck
Repo-wide:
```bash
pnpm lint
pnpm lint:fix
pnpm format
pnpm type-check
```

Single workspace examples:
```bash
pnpm --filter @startracker/api lint
pnpm --filter nextjs lint
pnpm --filter expo type-check
```

### Database (Prisma)
Prisma schema lives in `packages/db/prisma/schema.prisma`.

Common tasks:
```bash
pnpm db:generate
pnpm db:push
pnpm db:studio
```

### Stripe webhook listener (local dev)
There is a convenience script:
```bash
pnpm stripe:listen
```
This forwards Stripe events to `http://localhost:3000/api/webhooks/stripe`.

### Tests
No test runner/config (Jest/Vitest/Playwright/Cypress) is currently present in this repo. If tests are added later, document the commands here.

## Environment variables
- Root `.env` is used by multiple workspaces (Turbo `globalDependencies` includes `**/.env`).
- `apps/nextjs` uses `dotenv-cli` via `pnpm with-env ...` to load `../../.env`.

Important note: root `.env.example` appears to be from an older template (it references NextAuth and SQLite). Prefer:
- `turbo.json` `globalEnv` list for the full set expected by the monorepo.
- `PROJECT_GUIDE.md` for the project-specific setup (Clerk/Stripe/ImageKit/Postgres).

## High-level architecture

### Data layer (`packages/db`)
- `packages/db/prisma/schema.prisma`: Prisma models/enums.
- `packages/db/index.ts`: exports `prisma` (a singleton PrismaClient) and re-exports Prisma types.

### API layer (`packages/api`)
The shared tRPC router is defined here.
- Entry: `packages/api/src/root.ts` defines `appRouter` with:
  - `auth` router: `packages/api/src/router/auth/*`
  - `admin` router: `packages/api/src/router/admin/*`
- Context + auth:
  - `packages/api/src/trpc.ts` builds the tRPC context using Clerk (`auth()`) and Prisma (`prisma`).
  - Procedures:
    - `publicProcedure`
    - `protectedProcedure` (requires Clerk user)
    - `adminProcedure` (requires `User.privilegeLevel === ADMIN`)

### Next.js app (`apps/nextjs`)
- Routing uses Next.js App Router under `apps/nextjs/src/app/*`.
- tRPC HTTP endpoint:
  - `apps/nextjs/src/app/api/trpc/[trpc]/route.ts` (Fetch adapter).
  - This is what both web and mobile clients talk to at `/api/trpc`.
- Auth middleware:
  - `apps/nextjs/src/middleware.ts` uses Clerk middleware and treats many routes (including `/api/*`) as public.
- Web client usage:
  - `apps/nextjs/src/utils/api.ts` exports a typed `api` client (`createTRPCReact<AppRouter>()`).
  - Admin area wraps React Query + tRPC provider in `apps/nextjs/src/app/admin/(dashboard)/providers.tsx`.
- Webhooks:
  - Stripe webhook handlers live under `apps/nextjs/src/app/api/webhooks/stripe/*`.

### Expo app (`apps/expo`)
- Navigation/routing uses `expo-router` under `apps/expo/src/app/*`.
  - Route groups like `(unauthed)`, `(account-setup)`, `(authed)` are used.
  - `apps/expo/src/app/_layout.tsx` is the main root layout; it wires Clerk + tRPC provider and handles bootstrapping (fonts, auth, redirects).
- Mobile tRPC client:
  - `apps/expo/src/utils/api.tsx` defines `TRPCProvider` using `httpBatchLink` to `${getBaseUrl()}/api/trpc`.
  - It forwards Clerk tokens via the `Authorization` header.
  - `getBaseUrl()` prioritizes `EXPO_PUBLIC_API_URL`, otherwise uses a dev host derived from Expo constants; in non-dev it defaults to `https://startracker.vercel.app`.

## Where to start when changing behavior
- Add/modify backend behavior: start in `packages/api/src/router/**` and ensure the procedure uses the correct auth level.
- Update DB shape: edit `packages/db/prisma/schema.prisma`, then run `pnpm db:push` (and/or `pnpm db:generate`).
- Mobile screens/navigation: `apps/expo/src/app/*` (plus shared UI in `apps/expo/src/components/*`).
- Web/admin pages: `apps/nextjs/src/app/*` and shared UI in `apps/nextjs/src/components/*`.
