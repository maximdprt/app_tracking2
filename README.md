# Lift SaaS (Phase 1)

Next.js 15 SaaS rebuild for Lift with Supabase Auth and protected app shell.

## Setup

1. Install dependencies
   ```bash
   npm install
   ```
2. Copy environment file
   ```bash
   cp .env.local.example .env.local
   ```
3. Fill env values
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `MISTRAL_API_KEY`
4. Start dev server
   ```bash
   npm run dev
   ```

## Phase 1 scope

- Next.js App Router bootstrapped
- Supabase browser/server clients and middleware session refresh
- Login + Signup pages with zod + react-hook-form
- Protected `(app)` layout and dashboard greeting
- Sidebar shell with key SaaS routes
