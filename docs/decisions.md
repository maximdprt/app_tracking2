# Architecture Decisions

## ADR-001 — Tailwind v4 avec @theme
**Choix** : Tokens CSS via `@theme` dans `globals.css`, pas de `tailwind.config.ts` actif.
**Pourquoi** : v4 lit la config CSS-first. La syntaxe v3 dans le config TS était ignorée.

## ADR-002 — Pas de shadcn/ui
**Choix** : Primitives UI maison (Button, Card, Dialog, Sheet, etc.).
**Pourquoi** : Contrôle 100% du rendu visuel et des animations. Évite la dette de dépendance.

## ADR-003 — getUser() obligatoire en SSR
**Choix** : `supabase.auth.getUser()` dans tous les Server Components et routes API.
**Pourquoi** : `getSession()` ne re-vérifie pas le JWT côté serveur, vulnérabilité auth.

## ADR-004 — Vrai streaming Mistral via SSE
**Choix** : Parser les chunks SSE de Mistral et ré-émettre en plain text stream.
**Pourquoi** : Le coach doit afficher la réponse token par token, pas un blob final.

## ADR-005 — Volume calculé depuis exercise_sets
**Choix** : `getWeeklyVolume` agrège `weight × reps` réels.
**Pourquoi** : L'ancien code multipliait `sessions.length × 850` arbitrairement — données fausses.

## ADR-006 — Auto-save debounced sur SetRow
**Choix** : 800ms de debounce sur poids/reps/RPE.
**Pourquoi** : Évite un round-trip à chaque keystroke tout en étant assez rapide pour ne rien perdre.

## ADR-007 — Onboarding splitté en 4 fichiers
**Choix** : `Step1Personal`, `Step2Activity`, `Step3Goal`, `Step4Recap` dans `features/onboarding/steps/`.
**Pourquoi** : Le précédent monobloc de 348 lignes était illisible et non testable.
