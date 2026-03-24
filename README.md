# Lausanne Darts — Coming Soon

Landing page one-page en Next.js (App Router) pour `lausanne-darts.ch`.

## Tu vois encore `Configuration Settings in the current Production deployment differ...` ?

Ce message signifie que **le dernier déploiement en production a été fait avec des overrides**.
Ce n'est pas corrigé rétroactivement: il faut **redeployer après reset**.

## Fix exact dans Vercel (Build and Deployment)

1. Ouvre **Project Settings → Build and Deployment**.
2. **Framework Preset** = `Next.js`.
3. **Root Directory** = vide (ou `.` si nécessaire).
4. Dans **Build & Output Settings**, vérifie:
   - Build Command = valeur Next par défaut
   - Output Directory = **vide** (jamais `public`, jamais `.next`)
5. Dans le bloc **Production Overrides**, ouvre le déploiement listé et clique **Reset to Project Settings**.
6. Sauvegarde.
7. Va dans **Deployments** et lance un **Redeploy** du dernier commit (sans cache si possible).

## Vérification après redeploy

- `/` doit répondre `200`.
- `/favicon.ico` doit répondre `200`.
- Le bandeau d'erreur sur les overrides ne doit plus apparaître pour le nouveau déploiement.

## Important

Les warnings console de type `zustand` / `DialogContent` vus dans `instrument.*.js` sont produits par des scripts Vercel (toolbar/instrumentation), pas par ce code applicatif.
