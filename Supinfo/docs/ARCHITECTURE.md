# Architecture Technique - SUPCONTENT

## Vue d'ensemble
SUPCONTENT est une application web distribuée suivant une architecture 3-tiers classique, conçue pour être déployée via Docker.

### Diagramme d'Architecture
```mermaid
graph TD
    Client[Client Web (React)] <-->|HTTP/REST| API[Serveur Backend (Express)]
    API <-->|SQL| DB[(Base de Données MySQL)]
    API <-->|HTTP| TMDB[API Externe (TMDB)]
    
    subgraph Docker
        Client
        API
        DB
    end
```

## Stack Technologique

### 1. Frontend Web
- **Framework** : React.js (Vite)
- **Langage** : JavaScript (ES6+)
- **Routing** : React Router DOM
- **UI** : TailwindCSS + Lucide Icons + Shadcn/UI (inspiré)
- **State Management** : Context API (AuthContext)
- **HTTP Client** : Axios

### 2. Backend
- **Framework** : Node.js avec Express
- **Base de données** : MySQL 8.0
- **ORM/Query Builder** : Mysql2 (avec Promisify pour async/await)
- **Authentification** : JWT (JSON Web Tokens) + Cookies/Headers
- **Sécurité** : Bcrypt (hachage mots de passe), CORS, Helmet

### 3. Base de Données
- **Système** : MySQL 8.0
- **Structure** : Relationnelle
- **Migrations** : Script SQL d'initialisation (`schema.sql`) exécuté au démarrage du conteneur.

## Flux de Données
1.  **Client** : L'utilisateur interagit avec l'interface React.
2.  **API** : Les requêtes sont envoyées au backend Express (ex: GET /api/media/movie/123).
3.  **Traitement** :
    *   Le backend vérifie le token JWT (si route protégée).
    *   Il interroge la base de données locale (ex: pour les critiques ou le cache).
    *   Si nécessaire, il interroge l'API TMDB pour récupérer les métadonnées fraîches.
4.  **Réponse** : Les données sont agrégées et renvoyées au client en JSON.

## Choix Techniques
- **Monorepo** : Facilite la gestion du code et le déploiement local.
- **Docker Compose** : Permet de lancer toute la stack (BDD, Backend, Frontend) avec une seule commande, garantissant un environnement iso-prod.
- **Cache TMDB** : Pour optimiser les performances et réduire les appels API, certaines données (comme les détails des films) sont mises en cache en base de données localement temporairement.
