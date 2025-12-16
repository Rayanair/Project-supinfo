# SUPCONTENT

SUPCONTENT est un réseau social de niche dédié aux passionnés de Cinéma et de Séries TV. Il permet de découvrir des œuvres via l'API TMDB, de gérer sa collection personnelle, et d'échanger avec une communauté via des critiques, des likes et des commentaires.

## Fonctionnalités Clés
- **Découverte** : Recherche de films/séries, tendances, détails complets (API TMDB).
- **Bibliothèque** : Gestion de listes ("À voir", "Vu", Custos), statuts de visionnage.
- **Social** : Profils utilisateurs, système d'abonnement (Follow), Fil d'actualité.
- **Interactions** : Critiques, Notes (étoiles), Likes, Commentaires.
- **Messagerie** : Chat privé entre utilisateurs.
- **Admin** : Interface de modération et gestion des signalements.
- **Conformité** : Export des données utilisateur (RGPD).

## Pré-requis
- **Docker** et **Docker Compose** installés sur la machine.
- Une clé API **TMDB** (The Movie Database).

## Installation et Déploiement

### 1. Cloner le projet
Récupérez l'archive ou clonez le dépôt git.

### 2. Configuration
Créez un fichier `.env` à la racine du projet (copiez `.env.example`).
Il doit contenir impérativement votre clé TMDB :

```env
# Configuration Base de données
DB_HOST=mysql
DB_USER=supcontent_user
DB_PASSWORD=supcontent_password
DB_NAME=supcontent
DB_ROOT_PASSWORD=rootpassword

# Configuration Backend
PORT=5000
JWT_SECRET=votre_secret_tres_securise_ici
TMDB_API_KEY=VOTRE_CLE_API_TMDB_ICI

# Configuration Frontend
VITE_API_URL=http://localhost:5000/api
```

### 3. Lancement (Docker)
L'application est entièrement conteneurisée. Pour la lancer :

```bash
docker compose up --build
```

Cette commande va :
1.  Démarrer la base de données MySQL.
2.  Construire et lancer le Backend (Node.js).
3.  Construire et lancer le Frontend (serveur Web Nginx).

> L'application sera accessible sur **http://localhost:3000**

## Documentation
Vous trouverez plus de détails dans le dossier `docs/` :
- [Architecture Technique](docs/ARCHITECTURE.md)
- [Schéma de Base de Données](docs/DATABASE.md)
- [Manuel Utilisateur](docs/USER_MANUAL.md)

## Auteurs
Projet réalisé par Rayan SOUICI.
