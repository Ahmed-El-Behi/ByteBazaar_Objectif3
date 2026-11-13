# ByteBazaar — Objectif 3 : développement et intégration des fonctionnalités principales

**Groupe 1** · Projet Web · SUP'COM · 2025/2026

ByteBazaar est une boutique en ligne de composants PC et de périphériques pour la Tunisie (prix en dinars, TND).
Ce dossier est le livrable de l'**Objectif 3** : les maquettes de l'Objectif 2 deviennent un site fonctionnel,
avec un frontend complet et un **backend minimal** qui gère les comptes, le catalogue et le panier à partir d'une
vraie base de données.

> **Lancer le site :** suivre le [guide d'installation](#5-installation-et-lancement), pas à pas, d'un ordinateur
> sans aucun outil installé jusqu'au site ouvert dans le navigateur.

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

Ce guide part d'un ordinateur sur lequel rien n'est installé et va jusqu'au site ouvert dans le navigateur. Il
fonctionne sous Windows, macOS et Linux. Compter environ 20 minutes la première fois (installations comprises),
puis quelques secondes pour relancer le site les fois suivantes.

**Vue d'ensemble :** installer Node.js et PostgreSQL → créer une base vide → configurer et lancer l'API (terminal 1)
→ lancer le site (terminal 2) → ouvrir http://localhost:4200.

### Étape 0 — Installer les outils (une seule fois)

| Outil                | Version                                          | Téléchargement                       |
| -------------------- | ------------------------------------------------ | ------------------------------------ |
| **Node.js** (+ npm)  | **24 LTS** recommandé (ou 22.22 et plus, ou 26+) | https://nodejs.org                   |
| **PostgreSQL**       | 16 ou plus récent                                | https://www.postgresql.org/download/ |
| Navigateur           | Chrome, Firefox, Edge ou Safari récent           |                                      |
| Éditeur (facultatif) | Visual Studio Code, ou le Bloc-notes             | https://code.visualstudio.com        |

**Node.js** — Télécharger la version « LTS » et l'installer avec les options par défaut. Les versions impaires
(23, 25) ne sont pas prises en charge par Angular.

**PostgreSQL** — Lancer l'installateur et garder les options par défaut :

- composants : PostgreSQL Server, **pgAdmin 4** et Command Line Tools ;
- **mot de passe du super-utilisateur `postgres`** : le choisir et **le noter**, il servira aux étapes 2 et 3 ;
- port : **5432** ;
- Stack Builder, proposé à la fin : inutile, on peut le fermer.

**Vérification** — Ouvrir un **nouveau** terminal, pour qu'il prenne en compte les installations : sous Windows,
menu Démarrer → « PowerShell » ; sous macOS, l'application « Terminal ». Puis taper :

```bash
node -v      # doit afficher v22.22 ou plus, par exemple v24.15.0
npm -v       # doit afficher un numéro de version, par exemple 11.6.2
```

Aucun autre outil n'est à installer : Angular, NestJS et Prisma sont installés automatiquement dans le projet par
`npm install` (étapes 3 et 4).

### Étape 1 — Récupérer le projet

- **Depuis le fichier zip** : clic droit sur `Groupe1_Projet_Web_Objectif3.zip` → « Extraire tout… » → « Extraire ».
  Le dossier extrait contient un dossier `Objectif3`, qui contient lui-même `README.md`, `backend` et `frontend`.
- **Depuis GitHub** : `git clone https://github.com/Ahmed-El-Behi/ByteBazaar_Objectif3.git`. Dans la suite, le
  dossier `ByteBazaar_Objectif3` joue le rôle du dossier `Objectif3`.

Ensuite, dans le terminal, se placer dans ce dossier. Le plus simple : taper `cd ` (avec l'espace), faire glisser le
dossier `Objectif3` dans la fenêtre du terminal, puis appuyer sur Entrée.

### Étape 2 — Créer la base de données

Créer une base vide nommée `bytebazaar`. Les tables et les produits y seront ajoutés à l'étape 3. Deux méthodes, au
choix.

**Méthode A — pgAdmin (sans ligne de commande)**

1. Ouvrir **pgAdmin 4**, installé avec PostgreSQL.
2. Dans le panneau de gauche, déplier **Servers** → **PostgreSQL** et saisir le mot de passe `postgres` choisi à
   l'étape 0.
3. Clic droit sur **Databases** → **Create** → **Database…**
4. Dans **Database**, taper `bytebazaar`, puis cliquer sur **Save**.

**Méthode B — ligne de commande**

Sous **Windows (PowerShell)**, `psql` n'est en général pas reconnu tel quel : il faut l'appeler par son chemin
complet. Remplacer `18` par le numéro de la version installée (voir le dossier `C:\Program Files\PostgreSQL`).

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE bytebazaar;"
```

Sous **macOS / Linux** :

```bash
psql -U postgres -c "CREATE DATABASE bytebazaar;"       # Linux, si refusé : sudo -u postgres psql -c "…"
```

Le mot de passe `postgres` est demandé ; les caractères ne s'affichent pas pendant la saisie, c'est normal. La
réponse attendue est `CREATE DATABASE`.

### Étape 3 — Configurer et lancer l'API (terminal 1)

**3.1 — Installer les dépendances**, depuis le dossier `Objectif3` :

```bash
cd backend
npm install          # 1 à 2 minutes ; installe les dépendances et génère le client Prisma
```

Des lignes `npm warn` peuvent s'afficher : elles sont sans conséquence.

**3.2 — Créer le fichier de configuration `.env`** à partir du modèle fourni :

```bash
copy .env.example .env      # Windows (PowerShell ou Invite de commandes)
cp .env.example .env        # macOS / Linux
```

Générer une clé secrète pour les sessions, puis copier la longue suite de caractères affichée :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Ouvrir le fichier `.env` (`notepad .env` sous Windows, `open -e .env` sous macOS, ou avec VS Code) et modifier deux
lignes :

```ini
DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/bytebazaar?schema=public"
JWT_SECRET="la-longue-suite-de-caracteres-generee-ci-dessus"
```

- `VOTRE_MOT_DE_PASSE` : le mot de passe `postgres` choisi à l'étape 0. S'il contient des caractères spéciaux,
  les remplacer par leur code : `@` → `%40`, `#` → `%23`, `:` → `%3A`, `/` → `%2F`, `%` → `%25`.
- Si PostgreSQL utilise un autre port que 5432, modifier aussi `5432`.
- Les autres lignes (`FRONTEND_URL`, `PORT`, `TRUST_PROXY`) n'ont pas à être modifiées.

Enregistrer et fermer le fichier.

**3.3 — Créer les tables et importer le catalogue :**

```bash
npx prisma migrate deploy --config prisma7.config.ts    # crée les tables ; affiche « successfully applied »
npm run seed                                             # importe les 3 891 produits (1 à 2 minutes)
```

L'import se termine par `En base : 15 catégories, 171 marques, 3891 produits (3891 actifs)`.

**3.4 — Lancer l'API :**

```bash
npm run start:dev
```

L'API est prête quand la ligne `Nest application successfully started` s'affiche. **Laisser ce terminal ouvert.**

Vérification : ouvrir http://localhost:3000/health dans le navigateur ; la page doit afficher
`{"status":"ok","database":"connected"}`.

### Étape 4 — Lancer le site (terminal 2)

Ouvrir un **second** terminal, se placer à nouveau dans le dossier `Objectif3` (comme à l'étape 1), puis :

```bash
cd frontend
npm install          # 1 à 2 minutes
npm start
```

Le site est prêt quand la ligne `➜  Local:   http://localhost:4200/` s'affiche. Si Angular demande s'il peut collecter
des statistiques d'utilisation anonymes, répondre `N` puis Entrée. **Laisser ce terminal ouvert lui aussi.**

### Étape 5 — Ouvrir le site

Ouvrir **http://localhost:4200** dans le navigateur. L'accueil affiche trois produits vedettes et les catégories ; le
catalogue contient les 3 891 produits. Le [manuel d'utilisation](#6-manuel-dutilisation) décrit ce qu'on peut y
faire.

Le site relaie automatiquement ses appels `/api/…` vers l'API du port 3000 (`frontend/proxy.conf.json`) : il n'y a
rien d'autre à configurer.

### Arrêter et relancer

- **Arrêter** : dans chacun des deux terminaux, appuyer sur `Ctrl + C`.
- **Relancer plus tard** : les étapes 0 à 3.3 ne sont à faire qu'une fois. Il suffit ensuite de lancer
  `npm run start:dev` dans `backend` (terminal 1), puis `npm start` dans `frontend` (terminal 2).
- **Repartir d'une base neuve** (facultatif) : supprimer la base `bytebazaar` dans pgAdmin, puis refaire l'étape 2
  et l'étape 3.3.

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

| Problème                                                                                                | Solution                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node`, `npm` ou `psql` « n'est pas reconnu » (_is not recognized_)                                     | Fermer et rouvrir le terminal après l'installation. Pour `psql` sous Windows, utiliser le chemin complet (étape 2, méthode B) ou pgAdmin (méthode A).                                                                      |
| PowerShell : « l'exécution de scripts est désactivée » (_running scripts is disabled_) en lançant `npm` | Utiliser l'**Invite de commandes** (`cmd`) au lieu de PowerShell : les commandes `npm` y sont identiques. Ou taper `npm.cmd` à la place de `npm`.                                                                          |
| `npm install` : _Unsupported engine_ ou erreur sur la version de Node                                   | Installer Node.js 24 LTS (étape 0), puis rouvrir le terminal.                                                                                                                                                              |
| `password authentication failed for user "postgres"`                                                    | Mauvais mot de passe dans `DATABASE_URL` (fichier `backend/.env`). Vérifier aussi les caractères spéciaux à remplacer (étape 3.2).                                                                                         |
| `database "bytebazaar" does not exist`                                                                  | La base n'a pas été créée : refaire l'étape 2.                                                                                                                                                                             |
| `Can't reach database server at localhost:5432` (_ECONNREFUSED_)                                        | PostgreSQL n'est pas démarré, ou utilise un autre port. Windows : touche Windows → « Services » → démarrer le service `postgresql-x64-…`. Vérifier le port dans `DATABASE_URL`.                                            |
| `JWT_SECRET manquant` au démarrage de l'API                                                             | Le fichier `backend/.env` n'existe pas, est enregistré sous un autre nom (`.env.txt` avec le Bloc-notes), ou `JWT_SECRET` est vide (étape 3.2).                                                                            |
| Le site s'affiche mais sans produits                                                                    | L'API n'est pas lancée (terminal 1), ou l'étape 3.3 (`migrate deploy` puis `npm run seed`) n'a pas été faite.                                                                                                              |
| `Port 3000 / 4200 is already in use`                                                                    | Un autre programme utilise ce port : le fermer. Sinon, changer de port : `PORT=3001` dans `backend/.env` et `"target": "http://localhost:3001"` dans `frontend/proxy.conf.json` ; `npm start -- --port 4300` pour le site. |
| « Trop de tentatives » à la connexion                                                                   | Protection contre le forçage (10 essais par 15 minutes) : patienter, ou arrêter puis relancer l'API.                                                                                                                       |

---

## 10. Données et crédits

- Composants : catalogue constitué pour le projet (`backend/data/catalogue_local_images_cleaned.json`).
- Périphériques : [docyx/pc-part-dataset](https://github.com/docyx/pc-part-dataset) (données PCPartPicker,
  licence MIT).
- Photos des périphériques : [Amazon Reviews 2023](https://huggingface.co/datasets/McAuley-Lab/Amazon-Reviews-2023)
  (McAuley Lab), utilisées dans un cadre pédagogique.
- Icônes : [Lucide](https://lucide.dev) (licence ISC). Polices : Bricolage Grotesque et Plus Jakarta Sans (Google
  Fonts, licence OFL).
