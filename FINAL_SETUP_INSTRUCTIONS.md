# 🚀 Instructions de Déploiement Vercel - PharmaOS

Toutes les traces de "Lovable" et "Pata Dawa" ont été supprimées. L'application est maintenant identifiée comme **PharmaOS**.

## 1. Variables d'Environnement sur Vercel
Lors de la création du projet sur Vercel, vous **DEVEZ** ajouter les variables suivantes dans **Settings > Environment Variables** :

| Nom | Valeur |
| :--- | :--- |
| `VITE_SUPABASE_URL` | `https://mplhzatyxnyqtreikhyp.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (Copiez la clé complète depuis votre fichier .env) |

## 2. Problème de Connexion (Admin)
Si vous ne pouvez pas vous connecter avec `amperella@gmail.com` / `Admin123`, voici les causes possibles :

### A. Le compte n'existe pas encore
Si c'est la première fois que vous lancez l'application, elle devrait vous proposer de **"Créer le compte Admin"** (Configuration initiale). 
- Si vous voyez l'écran de **Connexion** classique au lieu de la configuration, cela signifie que la base de données contient déjà un administrateur.

### B. Réinitialisation forcée
Si vous avez perdu l'accès, vous pouvez forcer le mode configuration en allant dans votre tableau de bord Supabase et en supprimant les lignes de la table `profiles` ou en vérifiant la table `auth.users`.

## 3. Nettoyage effectué
- ✅ Suppression de `lovable-tagger`.
- ✅ Suppression du plugin Lovable dans `vite.config.ts`.
- ✅ Remplacement de tous les textes "Pata Dawa" par "PharmaOS".
- ✅ Mise à jour de `index.html` (titre, meta, author).
- ✅ Configuration de la devise en **DZD** (Dinar Algérien).
- ✅ Création du fichier `vercel.json` pour un déploiement fluide.

## 4. Lancer en local pour tester
```bash
npm install
npm run dev
```
L'application sera disponible sur `http://localhost:8080`.
