# NOMA — SaaS interne Café Coworking

Application interne de gestion des sessions client pour **NOMA Café Coworking**, Toulouse.

---

## Stack technique

| Couche       | Technologie                  |
|--------------|------------------------------|
| Frontend     | Next.js 15, React 19, TypeScript |
| Styles       | TailwindCSS 3               |
| Backend      | Next.js Server Actions       |
| Base de données | PostgreSQL via Supabase   |
| Auth         | Supabase Auth                |
| Hébergement  | Vercel + Supabase            |

---

## Architecture du projet

```
src/
├── app/
│   ├── (auth)/login/         # Page de connexion
│   ├── (dashboard)/          # Layout protégé
│   │   ├── page.tsx          # Dashboard du jour
│   │   ├── DashboardClient.tsx
│   │   ├── bar/              # File de préparation bar
│   │   ├── historique/       # Historique + export CSV
│   │   └── catalogue/        # Catalogue boissons/extras
│   └── actions/sessions.ts   # Server Actions (toute la logique métier)
├── components/
│   ├── ui/                   # Button, Modal, Input, Badge, Select
│   ├── layout/               # Sidebar, Header
│   ├── sessions/             # SessionCard, modals CRUD
│   ├── dashboard/            # KPIBar
│   └── bar/                  # BarQueue
├── hooks/
│   └── useTimer.ts           # Timer live pour sessions actives
├── lib/
│   ├── supabase/             # Client + Server clients
│   ├── utils.ts              # Fonctions utilitaires
│   └── constants.ts          # Zones, labels
└── types/index.ts            # Tous les types TypeScript
supabase/
├── schema.sql                # Schéma complet PostgreSQL
└── seed.sql                  # Données initiales
```

---

## Installation

### 1. Prérequis

- Node.js 20+
- npm ou yarn
- Compte Supabase (gratuit)

### 2. Cloner et installer

```bash
cd noma-saas
npm install
```

### 3. Créer le projet Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Aller dans **SQL Editor**
4. Exécuter `supabase/schema.sql` (copier-coller le contenu)
5. Exécuter `supabase/seed.sql` (copier-coller le contenu)

### 4. Configurer les variables d'environnement

```bash
cp .env.local.example .env.local
```

Remplir `.env.local` avec les valeurs de votre projet Supabase (Settings > API) :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 5. Créer un compte utilisateur

Dans Supabase > Authentication > Users > "Add user" :
- Email : `contact@nomacafe.fr`
- Mot de passe : (votre choix)

### 6. Lancer en développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

---

## Fonctionnalités V1

### Dashboard du jour
- KPIs : sessions totales, actives, terminées, boissons, extras
- Sessions actives avec timer en temps réel
- File bar intégrée (commandes en attente)
- Filtres : Toutes / En cours / Terminées
- Recherche par prénom

### Session
- Création en < 10 secondes (prénom + zone optionnelle)
- Timer live depuis l'arrivée
- Ajout boisson en 1 clic
- Ajout extra en 1 clic
- Arrêt avec calcul automatique de durée
- Annulation
- Édition (nom, zone, note)

### File bar
- Vue dédiée des commandes à préparer
- Marquage "Servi" en 1 clic
- Historique des commandes servies

### Historique
- Navigation par jour
- Tableau complet des sessions
- Export CSV quotidien

### Catalogue
- Vue des boissons (chaud/froid)
- Vue des extras

---

## Déploiement Vercel

```bash
# Connecter le repo à Vercel
vercel

# Ajouter les variables d'environnement dans Vercel Dashboard
# Déployer
vercel --prod
```

---

## Scripts disponibles

```bash
npm run dev          # Développement local
npm run build        # Build de production
npm run start        # Serveur de production
npm run type-check   # Vérification TypeScript
```

---

## Roadmap V2

- [ ] Supabase Realtime (mise à jour auto sans refresh)
- [ ] Gestion du catalogue (ajout/modification boissons)
- [ ] Statistiques hebdomadaires / mensuelles
- [ ] Mode iPad (layout optimisé touch)
- [ ] Impression reçu
- [ ] Gestion multi-staff (qui a créé la session)

---

Fait avec ☕ pour NOMA Café Coworking, Toulouse.
