# PharmaOS - Système de Gestion Pharmaceutique

Solution complète et moderne pour la gestion de pharmacies, le suivi des stocks, la dispensation sécurisée et la logistique multi-magasins.

## Technologies
- **Frontend** : React, Vite, TypeScript
- **Styling** : Tailwind CSS, shadcn/ui, Framer Motion
- **Backend** : Supabase (Auth, Database, Functions)
- **State Management** : TanStack Query (React Query)

## Installation Locale

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement
# Créer un fichier .env à la racine avec les clés Supabase :
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_PUBLISHABLE_KEY=...

# 3. Lancer le serveur de développement
npm run dev
```

## Déploiement

Le projet est configuré pour être déployé sur **Vercel**. Assurez-vous d'ajouter les variables d'environnement `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY` dans les paramètres du projet Vercel.
