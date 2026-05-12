# Lift

Premium fitness/nutrition SaaS — Next.js 15, Supabase, Mistral.

## Setup

```bash
npm install
cp .env.local.example .env.local   # remplis avec tes vraies valeurs
npm run dev
```

Stack : Next.js 15 (App Router) · React 19 · TypeScript strict · Tailwind v4 · Supabase · TanStack Query · Zustand · framer-motion · Recharts · Mistral.

## Architecture

- `src/app/` — routes (App Router)
- `src/components/ui/` — primitives (Button, Card, Input...)
- `src/components/layout/` — AppShell, Sidebar, Topbar
- `src/components/shared/` — composants métier réutilisables
- `src/features/` — logique par domaine (auth, nutrition, training...)
- `src/services/supabase/queries/` — toutes les queries DB
- `src/services/ai/` — wrapper Mistral
- `src/stores/` — Zustand
- `src/hooks/` — hooks réutilisables
- `src/lib/` — errors, utils, query-client
- `src/utils/` — calculs métier (BMR, TDEE, volume)
- `src/types/` — database (généré) + domain
- `src/constants/` — routes, meal-types, nutrition

## Scripts

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run typecheck` — TS strict check
- `npm run lint` — ESLint
- `npm run format` — Prettier

## Génération des types DB

```bash
npx supabase gen types typescript --project-id <id> > src/types/database.ts
```
