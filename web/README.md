# GSI Insight - Web Version

Cette version web est synchronisée avec la même base de données que l'APK.

## Structure
- **web/** : Dossier racine du projet web.
  - **server.js** : Le serveur Node.js (Proxy & Serveur Statique).
  - **package.json** : Dépendances du serveur.
  - **.env** : Configuration (Port, Admin pass).
  - **frontend/** : Le code source de l'application Next.js (Version simplifiée).

## Déploiement

### 1. Le Serveur (Backend)
- Allez dans le dossier `web`.
- Installez les paquets : `npm install`.
- Sur cPanel : Utilisez "Setup Node.js App" et pointez sur `web/server.js`.

### 2. Le Site (Frontend)
- Allez dans `web/frontend`.
- Installez : `npm install`.
- Générez le build : `npm run build`.
- Copiez le contenu de `web/frontend/out` vers le dossier public de votre serveur (ex: `public_html`).

## Notes Importantes
- **Base de données** : Utilise l'API GSI existante (https://groupegsi.mg/rtmggmg/api).
- **Création Élève** : Uniquement via `/admincreat`.
  - Login par défaut : `GSI-MG`
  - Pass par défaut : `GSI-Madagascar`
- **PWA** : Le site propose automatiquement l'installation sur mobile.
