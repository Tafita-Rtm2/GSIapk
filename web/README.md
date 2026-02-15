# GSI Insight - Version Web

Ce dossier contient la version web complète de l'application GSI Insight, avec son propre backend Node.js.

## Structure
- `backend/` : Serveur Node.js (Express + MongoDB) pour gérer les données et les fichiers.
- `frontend/` : Application Next.js configurée pour le web.

## Installation et Déploiement

### 1. Backend (Node.js)
1. Allez dans `web/backend`.
2. Installez les dépendances : `npm install`.
3. Configurez le fichier `.env` avec votre URI MongoDB.
4. Lancez le serveur : `npm start`.
   - Sur cPanel, utilisez le "Setup Node.js App" et pointez sur `server.js`.

### 2. Frontend (Next.js)
1. Allez dans `web/frontend`.
2. Installez les dépendances : `npm install`.
3. Configurez `.env.local` pour pointer vers l'URL de votre backend.
4. Générez le build statique : `npm run build`.
5. Le dossier `out` généré contient les fichiers statiques à uploader sur votre hébergement (ex: `public_html`).

## Fonctionnalités Spéciales
- **Création Étudiant** : Accessible via `/admincreat`.
  - Nom d'utilisateur par défaut : `GSI-MG`
  - Mot de passe par défaut : `GSI-Madagascar`
  - (Modifiable dans les variables d'environnement)
- **Mode Hors-ligne (PWA)** : Le site peut être installé sur l'écran d'accueil du téléphone et fonctionne partiellement hors-ligne grâce au Service Worker.
- **Base de données** : Utilise MongoDB (via Mongoose) pour correspondre à la structure de l'APK.

## Note sur cPanel
Pour un déploiement optimal sur cPanel :
1. Uploadez le contenu du dossier `frontend/out` à la racine de votre site (`public_html`).
2. Créez une application Node.js pour le `backend` et assurez-vous que les ports et les URLs correspondent.
