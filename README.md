# NOMA Café Coworking — SaaS interne V1

Outil de gestion des sessions clients au comptoir.
**Stack** : Next.js 16 · React 19 · TypeScript · Tailwind CSS · JSON local / Supabase

---

## Démarrage rapide (mode local — recommandé)

```bash
cd noma-saas
npm install
npm run dev
```

Ouvrir http://localhost:3000

> Le mode local utilise `data/db.json` — **aucune connexion internet requise**.
> Des données d'exemple pour aujourd'hui sont déjà présentes.

---

## Configuration

### Mode local (défaut)

Le fichier `.env.local` contient déjà :

```
USE_LOCAL_DB=true
```

C'est tout. L'app fonctionne sans Supabase.

### Mode Supabase (cloud)

1. Créer un projet sur supabase.com
2. Exécuter `supabase/schema.sql` dans l'éditeur SQL
3. Exécuter `supabase/seed.sql` pour les données de référence
4. Modifier `.env.local` :

```
USE_LOCAL_DB=false
NEXT_PUBLIC_SUPABASE_URL=https://VOTRE_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...anon_key...
SUPABASE_SERVICE_ROLE_KEY=eyJ...service_role_key...
```

IMPORTANT : La SUPABASE_SERVICE_ROLE_KEY est différente de l'anon key.
La trouver dans Supabase > Settings > API > service_role.

---

## Fonctionnalités V1

### Dashboard
- Table des sessions : Arrivée / Prénom / Zone / Départ / Durée / Statut / Consommations / Actions
- Navigation par date (← Aujourd'hui →) + sélecteur
- Filtres : Tous / Actifs / Terminés + recherche par prénom
- Export CSV et Export Excel du jour affiché
- KPIs masquables
- Chronomètre live pour sessions actives

### Sessions
- Création en < 10 secondes
- Formule journée (forfait, durée non calculée)
- Heure d'arrivée et départ éditables → durée recalculée automatiquement

### Boissons & Extras
- Ajout en 1-2 clics depuis la ligne de session
- Statut bar : En préparation / Servi
- File bar dédiée (/bar)

### Autres pages
- /bar — File bar du jour
- /historique — Jour / Semaine / Mois + export CSV
- /stats — Top boissons/extras, heures d'affluence, KPIs globaux
- /catalogue — Consultation du catalogue

---

## Structure

```
src/
  app/
    page.tsx                    Dashboard principal
    actions/sessions.ts         Server Actions
    (dashboard)/
      DashboardClient.tsx       Table + navigation date
      bar/                      File bar
      historique/               Historique
      stats/                    Statistiques
      catalogue/                Catalogue
  components/
    sessions/  SessionRow, CreateSessionModal, EditSessionModal...
    bar/       BarQueue
    dashboard/ KPIBar
    ui/        Button, Modal, Input, Select, Badge
  lib/
    db.ts          Proxy local/Supabase automatique
    localDb.ts     Base JSON locale
    supabaseDb.ts  Base Supabase
    utils.ts       Helpers + CSV + Excel
    constants.ts   Zones, statuts

data/db.json       Base locale avec seed complet
supabase/schema.sql  Schéma PostgreSQL
supabase/seed.sql    Données de référence
```

---

## Déploiement Vercel

```bash
git push origin main
# Connecter le repo sur vercel.com
# Ajouter les 4 variables d'env dans Vercel (USE_LOCAL_DB=false + Supabase)
```

## iPad PWA

Safari > Partager > "Ajouter à l'écran d'accueil"
L'app s'ouvre en plein écran, sans barre Safari.
