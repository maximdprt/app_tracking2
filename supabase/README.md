# Supabase Setup

## 1) Link project
supabase login
supabase link --project-ref <your-project-ref>

## 2) Apply schema + policies
supabase db push
psql "$SUPABASE_DB_URL" -f ./supabase/seed.sql

## 3) Deploy Edge Function
supabase secrets set MISTRAL_API_KEY=<your_mistral_api_key>
supabase functions deploy mistral-proxy --no-verify-jwt=false

## 4) Generate TS types
supabase gen types typescript --linked > ./src/types/database.types.ts
