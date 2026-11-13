# ByteBazaar — Objectif 3 : développement et intégration des fonctionnalités principales

**Groupe 1** · Projet Web · SUP'COM · 2025/2026

ByteBazaar est une boutique en ligne de composants PC et de périphériques pour la Tunisie (prix en dinars, TND).
Ce dossier est le livrable de l'**Objectif 3** : les maquettes de l'Objectif 2 deviennent un site fonctionnel,
avec un frontend complet et un **backend minimal** qui gère les comptes, le catalogue et le panier à partir d'une
vraie base de données.

---

## Sommaire

1. [Contenu du livrable](#1-contenu-du-livrable)
2. [Choix techniques](#2-choix-techniques)
3. [Fonctionnalités développées](#3-fonctionnalités-développées)
4. [Organisation du dossier](#4-organisation-du-dossier)
5. [Installation et lancement](#5-installation-et-lancement)
6. [Manuel d'utilisation](#6-manuel-dutilisation)
7. [API REST](#7-api-rest)
8. [Tests et vérifications](#8-tests-et-vérifications)
9. [Dépannage](#9-dépannage)
10. [Données et crédits](#10-données-et-crédits)

---

## 1. Contenu du livrable

| Partie          | Contenu                                                                                  |
| --------------- | ---------------------------------------------------------------------------------------- |
| `frontend/`     | Site complet (Angular) : 11 pages dynamiques, design final, responsive, bilingue FR / EN |
| `backend/`      | API REST minimale (NestJS) : inscription, connexion, profil, catalogue, filtres, panier  |
| Base de données | PostgreSQL, gérée avec Prisma (schéma, migration, import du catalogue)                   |
| `backend/data/` | Catalogue réel : **3 891 produits**, 15 catégories, 171 marques, photos locales          |

**Hors périmètre de cet objectif.** Ces fonctionnalités sont prévues pour les prochaines étapes du projet. Leurs
liens existent déjà dans le site et mènent à une page « Bientôt disponible » :

- configurateur PC 3D (compatibilité des pièces) et configurations enregistrées ;
- passage de commande, paiement et historique des commandes ;
- adresses de livraison, réinitialisation du mot de passe par e-mail ;
- gestion du stock et des commandes (administration).

Le stock de chaque produit est donc une donnée de démonstration : il est affiché (« En stock » / « Rupture ») et
limite les quantités du panier, mais il ne se gère pas encore depuis le site.

---

## 2. Choix techniques

| Couche           | Technologie                                   | Pourquoi                                                                                                                                                                    |
| ---------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend         | **Angular 22**, TypeScript                    | Framework complet (routage, formulaires, HTTP, tests) et structuré, adapté à un site à plusieurs pages ; composants autonomes et _signals_ pour un état simple et réactif.  |
| Icônes           | Lucide                                        | Jeu d'icônes cohérent et léger.                                                                                                                                             |
| Backend          | **NestJS 12** (Node.js), TypeScript           | Même langage que le frontend ; architecture en modules (contrôleur / service) claire et facile à étendre aux prochains objectifs.                                           |
| Base de données  | **PostgreSQL** + **Prisma 7**                 | Base relationnelle robuste (produits, catégories, marques, utilisateurs, paniers liés entre eux) ; Prisma fournit un schéma lisible, des migrations et des requêtes typées. |
| Authentification | JWT (sessions de 7 jours) + scrypt            | Mots de passe hachés avec un sel unique ; aucun mot de passe n'est stocké en clair.                                                                                         |
| Tests            | Vitest (frontend), Jest + Supertest (backend) |                                                                                                                                                                             |

**Gestion des états (frontend).** Les données partagées sont des _signals_ Angular dans des services : session de
l'utilisateur (`AuthService`), panier (`CartStateService`), langue (`I18nService`), thème (`ThemeService`) et
notifications (`ToastService`). Chaque page lit ces signals et se met à jour automatiquement.

---

## 3. Fonctionnalités développées

### Pages (frontend)

| Page                           | Route                                          | Contenu dynamique                                                                      |
| ------------------------------ | ---------------------------------------------- | -------------------------------------------------------------------------------------- |
| Accueil                        | `/`                                            | 3 produits vedettes tirés au hasard à chaque visite, catégories avec photo, compteurs  |
| Catalogue                      | `/produits`                                    | Recherche, filtres, tri et pagination, tous servis par l'API                           |
| Fiche produit                  | `/produits/:slug`                              | Photo, prix, disponibilité, description et caractéristiques traduites, ajout au panier |
| Panier                         | `/panier`                                      | Quantités, suppression, vidage, total ; panier invité puis panier du compte            |
| Connexion / Inscription        | `/connexion`, `/inscription`                   | Formulaires validés, messages d'erreur de l'API                                        |
| Mon compte                     | `/compte/profil`                               | Modification du nom, du téléphone et du mot de passe                                   |
| Contact                        | `/contact`                                     | Formulaire validé (envoi simulé côté navigateur)                                       |
| À propos, CGV, Confidentialité | `/a-propos`, `/conditions`, `/confidentialite` | Contenu bilingue, sommaire qui suit la lecture                                         |

### Interactions

- **Recherche** dans l'en-tête (chaque mot est cherché dans le nom, la marque, la catégorie ou la référence).
- **Filtres du catalogue** : catégorie et sous-catégorie, marque (plusieurs), prix minimum / maximum,
  « en stock uniquement » ; **tri** par pertinence, prix ou nouveauté. Les filtres sont dans l'URL : une recherche
  filtrée peut être partagée ou rouverte.
- **Panier** : ajout depuis la fiche produit ou au survol d'une carte du catalogue, notification en haut à droite,
  compteur animé dans l'en-tête. Sans compte, le panier est gardé dans le navigateur ; à la connexion, il est
  fusionné avec le panier du compte (enregistré en base).
- **Langue** FR / EN (bouton dans l'en-tête) : textes du site, noms de catégories, descriptions, messages d'erreur
  de l'API.
- **Thème** clair / sombre, mémorisé.
- **Responsive** : en-tête compact et menu défilant sur téléphone, grilles adaptées (mobile, tablette, ordinateur).
- **Accessibilité** : balises sémantiques, libellés ARIA sur les boutons-icônes, navigation au clavier, animations
  réduites si le système le demande.

### Backend

- **Comptes** : inscription (validation des champs, e-mail unique), connexion, session JWT, profil.
  Les tentatives de connexion et d'inscription sont limitées par adresse IP (protection contre le forçage).
- **Catalogue** : catégories (arborescence), marques, liste paginée avec filtres et tri, fiche produit, produits
  vedettes de l'accueil.
- **Panier** : un panier par compte ; ajout, modification, suppression, vidage, avec contrôle de la disponibilité.
- **Base de données** : schéma Prisma (`backend/prisma/schema.prisma`), une migration, script d'import du
  catalogue (relançable sans créer de doublons).

---

## 4. Organisation du dossier

```
Objectif3/
├── README.md
├── backend/                      API NestJS
│   ├── .env.example              modèle de configuration (à copier en .env)
│   ├── data/                     catalogue (JSON) importé par « npm run seed »
│   ├── prisma/
│   │   ├── schema.prisma         modèle de données
│   │   └── migrations/           création des tables
│   ├── prisma7.config.ts         configuration de Prisma
│   ├── src/
│   │   ├── main.ts               démarrage (CORS, langue, port)
│   │   ├── app.module.ts         assemblage des modules
│   │   ├── auth/                 inscription, connexion, profil, garde JWT
│   │   ├── catalog/              catégories, marques, produits, filtres, tri « Pertinence »
│   │   ├── cart/                 panier
│   │   ├── common/               validation des entrées, limite de tentatives, langue des messages
│   │   └── prisma/               connexion à la base, script d'import (seed.ts)
│   └── test/                     tests d'intégration
└── frontend/                     site Angular
    ├── public/products/          photos des produits (une par produit)
    ├── proxy.conf.json           relais /api → API (développement)
    ├── scripts/check-i18n.mjs    vérifie que chaque texte a sa traduction anglaise
    └── src/
        ├── styles.css            système de design (couleurs, typographie, espacements)
        ├── environments/         adresse de l'API
        └── app/
            ├── app.routes.ts     routes du site
            ├── pages/            une page par route
            ├── components/       carte produit, icônes, notifications, effets
            └── core/             services (API, session, panier, langue, thème), modèles, traductions
```

---

## 5. Installation et lancement

Le site fonctionne sur Windows, macOS et Linux.

### Prérequis

| Outil           | Version                                | Lien                                 |
| --------------- | -------------------------------------- | ------------------------------------ |
| Node.js (+ npm) | 22 LTS ou plus récent                  | https://nodejs.org                   |
| PostgreSQL      | 16 ou plus récent                      | https://www.postgresql.org/download/ |
| Navigateur      | Chrome, Firefox, Edge ou Safari récent |                                      |

Aucun outil à installer globalement : Angular CLI, NestJS CLI et Prisma sont installés dans chaque projet par
`npm install`. Vérifier les versions : `node -v` et `npm -v`.

### Étape 1 — Créer la base de données

Créer une base vide nommée `bytebazaar`, avec pgAdmin, ou en ligne de commande :

```bash
psql -U postgres -c "CREATE DATABASE bytebazaar;"
```

### Étape 2 — Configurer et lancer l'API

```bash
cd backend
npm install                                             # installe les dépendances et génère le client Prisma
```

Copier `.env.example` en `.env` (`cp .env.example .env`, ou `copy .env.example .env` sous Windows), puis
renseigner :

- `DATABASE_URL` : remplacer `motdepasse` par le mot de passe de l'utilisateur `postgres` (et le nom de la base si
  besoin) ;
- `JWT_SECRET` : une longue chaîne aléatoire, par exemple le résultat de
  `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

Puis :

```bash
npx prisma migrate deploy --config prisma7.config.ts   # crée les tables
npm run seed                                            # importe les 3 891 produits (≈ 1 à 2 min)
npm run start:dev                                       # API sur http://localhost:3000
```

Contrôle : http://localhost:3000/health doit afficher `{"status":"ok","database":"connected"}`.

### Étape 3 — Lancer le site (dans un second terminal)

```bash
cd frontend
npm install
npm start                                               # site sur http://localhost:4200
```

Ouvrir **http://localhost:4200**. Pendant le développement, le site relaie automatiquement les appels `/api/…`
vers l'API du port 3000 (`proxy.conf.json`) : il n'y a rien d'autre à configurer.

> Les deux terminaux (API et site) doivent rester ouverts pendant l'utilisation.

---

## 6. Manuel d'utilisation

1. **Parcourir** — Depuis l'accueil, choisir une catégorie ou cliquer sur « Voir le catalogue ».
2. **Filtrer** — Dans le catalogue, utiliser le panneau « Filtres » (sur téléphone, le bouton « Filtres » l'ouvre) :
   catégorie, marques, fourchette de prix, « en stock uniquement ». Le menu « Trier » change l'ordre. « Tout
   effacer » réinitialise les filtres.
3. **Rechercher** — Cliquer sur la loupe de l'en-tête, taper par exemple `rtx 4070` ou `souris logitech`, puis
   Entrée.
4. **Consulter un produit** — Cliquer sur une carte : photo, prix, disponibilité, description et caractéristiques.
5. **Ajouter au panier** — Bouton « Ajouter au panier » sur la fiche, ou petit bouton panier qui apparaît au
   survol d'une carte. Une notification confirme l'ajout et le compteur de l'en-tête s'incrémente.
6. **Gérer le panier** — Icône panier de l'en-tête : modifier les quantités (dans la limite du stock), retirer un
   article, ou vider le panier. Cliquer sur un article rouvre sa fiche.
7. **Créer un compte** — « Inscription » : prénom, nom, e-mail, mot de passe (8 caractères minimum). Le compte est
   connecté aussitôt, et le panier rempli avant l'inscription est conservé.
8. **Se connecter / se déconnecter** — « Connexion » dans l'en-tête ; la déconnexion se fait depuis « Mon compte »
   ou l'icône de sortie. Le panier d'un compte est retrouvé à la connexion suivante, sur n'importe quel appareil.
9. **Modifier son profil** — « Mon compte » : nom, téléphone, mot de passe (le mot de passe actuel est demandé).
10. **Langue et thème** — Bouton `FR` / `EN` et interrupteur clair / sombre de l'en-tête.

---

## 7. API REST

Base : `http://localhost:3000`, ou `/api/…` depuis le site. Les messages renvoyés suivent l'en-tête
`Accept-Language` (`fr` par défaut, `en`).

| Méthode  | Route                | Accès    | Rôle                                                                                                                                                                                   |
| -------- | -------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST`   | `/auth/register`     | public   | Inscription → `{ accessToken, user }`                                                                                                                                                  |
| `POST`   | `/auth/login`        | public   | Connexion → `{ accessToken, user }`                                                                                                                                                    |
| `GET`    | `/auth/me`           | connecté | Utilisateur de la session                                                                                                                                                              |
| `PATCH`  | `/auth/profile`      | connecté | Modifier nom, téléphone, mot de passe                                                                                                                                                  |
| `GET`    | `/categories`        | public   | Arborescence des catégories avec le nombre de produits                                                                                                                                 |
| `GET`    | `/categories/covers` | public   | Photo représentant chaque catégorie                                                                                                                                                    |
| `GET`    | `/brands`            | public   | Marques                                                                                                                                                                                |
| `GET`    | `/products`          | public   | Liste : `q`, `category`, `brand` (ex. `msi,asus`), `minPrice`, `maxPrice`, `inStock=true`, `sort` (`relevance`, `price_asc`, `price_desc`, `newest`, `name`), `page`, `limit` (48 max) |
| `GET`    | `/products/showcase` | public   | 3 produits vedettes pour l'accueil                                                                                                                                                     |
| `GET`    | `/products/:slug`    | public   | Fiche produit (images, caractéristiques)                                                                                                                                               |
| `GET`    | `/cart`              | connecté | Panier                                                                                                                                                                                 |
| `POST`   | `/cart/items`        | connecté | Ajouter `{ productId, quantity }`                                                                                                                                                      |
| `PATCH`  | `/cart/items/:id`    | connecté | Changer la quantité `{ quantity }`                                                                                                                                                     |
| `DELETE` | `/cart/items/:id`    | connecté | Retirer un article                                                                                                                                                                     |
| `DELETE` | `/cart`              | connecté | Vider le panier                                                                                                                                                                        |
| `GET`    | `/health`            | public   | État de l'API et de la base                                                                                                                                                            |

« connecté » : en-tête `Authorization: Bearer <accessToken>`. Exemple :

```bash
curl "http://localhost:3000/products?category=cartes-graphiques&brand=msi&maxPrice=3000&sort=price_asc&limit=5"
```

---

## 8. Tests et vérifications

```bash
# backend
npm test                 # tests unitaires (tri « Pertinence », santé de l'API)
npm run test:e2e         # tests d'intégration (base importée requise)
npm run lint

# frontend
npm test                 # tests unitaires (application, traductions)
npm run typecheck
npm run i18n:check       # chaque texte du site a sa traduction anglaise
npm run build            # build de production dans dist/frontend/browser
```

---

## 9. Dépannage

| Problème                                                       | Solution                                                                                                                                                     |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `JWT_SECRET manquant` au démarrage de l'API                    | Le fichier `backend/.env` n'existe pas ou `JWT_SECRET` est vide (étape 2).                                                                                   |
| `/health` indique une erreur de base, ou `npm run seed` échoue | Vérifier que PostgreSQL est démarré et que `DATABASE_URL` (mot de passe, port, nom de la base) est correct.                                                  |
| Le site s'affiche mais sans produits                           | L'API n'est pas lancée, ou `npm run seed` n'a pas été exécuté.                                                                                               |
| `Port 3000 / 4200 is already in use`                           | Fermer l'autre programme, ou changer de port : `PORT=3001` dans `.env` (et la cible de `frontend/proxy.conf.json`), `npm start -- --port 4300` pour le site. |
| « Trop de tentatives » à la connexion                          | Protection contre le forçage : attendre 15 minutes, ou redémarrer l'API en développement.                                                                    |

---

## 10. Données et crédits

- Composants : catalogue constitué pour le projet (`backend/data/catalogue_local_images_cleaned.json`).
- Périphériques : [docyx/pc-part-dataset](https://github.com/docyx/pc-part-dataset) (données PCPartPicker,
  licence MIT).
- Photos des périphériques : [Amazon Reviews 2023](https://huggingface.co/datasets/McAuley-Lab/Amazon-Reviews-2023)
  (McAuley Lab), utilisées dans un cadre pédagogique.
- Icônes : [Lucide](https://lucide.dev) (licence ISC). Polices : Bricolage Grotesque et Plus Jakarta Sans (Google
  Fonts, licence OFL).
