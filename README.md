# Lift - Mobile Fitness App

Application mobile React Native (Expo Router) pour suivi musculation, nutrition et lifestyle.

## Stack
- Expo SDK 55
- TypeScript strict
- Expo Router
- Supabase (Auth, DB, Storage, Edge Functions)
- Zustand
- react-hook-form + zod
- NativeWind
- react-native-gifted-charts

## Setup local
1. Installer deps:
   - `npm install`
2. Configurer `.env.local`:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - `EXPO_PUBLIC_MISTRAL_API_KEY` (local uniquement)
3. Lancer:
   - `npm run start`

## Supabase
1. `supabase login`
2. `supabase link --project-ref <your-project-ref>`
3. `supabase db push`
4. `psql "$SUPABASE_DB_URL" -f ./supabase/seed.sql`
5. `supabase secrets set MISTRAL_API_KEY=<your_mistral_api_key>`
6. `supabase functions deploy mistral-proxy --no-verify-jwt=false`
7. `supabase gen types typescript --linked > ./src/types/database.types.ts`

## Deployment checklist
- Supabase URL/anon key renseignes
- Migrations appliquees
- Bucket `meal-photos` cree + policies
- Secret `MISTRAL_API_KEY` configure sur Supabase
- Fonction `mistral-proxy` deployee
- Build mobile via EAS
