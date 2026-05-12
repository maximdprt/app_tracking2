# Checklist QA — Lift V1

## Auth
- [ ] Signup email valide → email reçu → confirmation → login OK
- [ ] Signup email déjà utilisé → toast clair
- [ ] Signup mot de passe < 6 → message zod clair
- [ ] Login mauvais mdp → toast "Email ou mot de passe incorrect"
- [ ] Login email non confirmé → toast "Confirme ton email"
- [ ] Reset password fonctionne
- [ ] Logout → /login, session vidée, retour navigateur ne ré-affiche pas /dashboard
- [ ] Refresh sur route protégée → reste connecté
- [ ] /dashboard sans auth → redirect /login

## Onboarding
- [ ] User sans onboarding → forcé /onboarding au login
- [ ] Sliders fonctionnent (âge, taille, poids, fréquence, sommeil)
- [ ] Step 4 affiche objectifs cohérents (cross-check calculatrice)
- [ ] Save → redirect /dashboard, profil persisté
- [ ] Animations fluides entre steps

## Nutrition
- [ ] Recherche aliment < 300ms (debounced)
- [ ] Calcul macros instantané au changement de grammes
- [ ] Save repas → toast OK + apparition immédiate
- [ ] Suppression repas → ConfirmDialog → totals recalculés
- [ ] DateNavigator passé/futur fonctionne
- [ ] Empty state premium si aucun repas
- [ ] Pas de crash ProgressRing sur compte vide

## Training
- [ ] Démarrer séance libre → arrive sur sessionId avec timer
- [ ] Ajouter exercice via Dialog → visible immédiatement
- [ ] Logger 3 sets (poids/reps) → auto-save 800ms
- [ ] PR badge 🏆 si volume > précédent
- [ ] Sticky bottom bar affiche volume temps réel
- [ ] Terminer séance → ConfirmDialog → redirect /training
- [ ] Lancer un programme → session pré-remplie avec exercices planifiés

## Stats
- [ ] 4 charts affichés : Poids, Volume, Calories, Heatmap
- [ ] Filtre période (7j/30j/90j/1an) avec animation glissante
- [ ] Compte vide → empty states cohérents (pas de crash Recharts)
- [ ] Heatmap lisible avec dégradé de lime

## Coach IA
- [ ] CTA "Générer mon résumé" appelle /api/ai/summary
- [ ] Résumé sauvegardé dans daily_summaries (UPSERT)
- [ ] Régénération possible (overwrite)
- [ ] Chat : envoyer message → réponse streamée token par token
- [ ] Suggestions chips fonctionnent
- [ ] Erreur Mistral → fallback toast clair

## Habits
- [ ] Placeholder premium avec aperçu mock-up des 5 futures habits

## Profile
- [ ] Affiche email + avatar
- [ ] Sliders éditables
- [ ] ToggleGroup goal type
- [ ] Bouton "Enregistrer mes objectifs" recalcule les macros
- [ ] Déconnexion fonctionne
- [ ] Dialog suppression compte (placeholder V1.1)

## Transverse
- [ ] Cmd+K ouvre la palette
- [ ] Sidebar active highlight glisse avec layoutId
- [ ] Mobile 375px : sidebar = drawer Sheet fonctionnel
- [ ] Lighthouse >= 90 sur dashboard, nutrition, training, stats, coach, profile
- [ ] 0 warning console en navigation normale
- [ ] 0 `any` (`grep -rn ": any" src/` vide)
- [ ] 0 secret bundle client (`grep -r "MISTRAL" .next/static` vide)
- [ ] 404/500 stylés
- [ ] Favicon présent
- [ ] `npm run build` passe
- [ ] `npm run typecheck` passe
- [ ] `npm run lint` passe
