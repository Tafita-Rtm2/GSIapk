# GSI Insight - Web Version

Cette version web est synchronisée avec la même base de données que l'APK.

## Structure Simplifiée
- **web/** : Dossier principal sur votre serveur.
  - **server.js** : Le serveur Node.js (Proxy & Serveur Statique).
  - **package.json** : Dépendances du serveur.
  - **.env** : Configuration (Admin pass).
  - **frontend/** : Le code source de l'application.

## Guide de Déploiement cPanel

### 1. Installation du Serveur (Backend)
- Uploadez le contenu du dossier `web/` sur votre serveur (ex: `/home/groupegs/domains/groupesgi.mg/web`).
- Allez dans ce dossier et installez les paquets : `npm install`.
- Sur cPanel : Utilisez "Setup Node.js App".
  - **Application root** : `web`
  - **Application URL** : `https://groupegsi.mg/web`
  - **Application startup file** : `server.js`

### 2. Build du Site (Frontend)
Le serveur a besoin que le site soit "construit" (build) pour pouvoir l'afficher.
- Entrez dans le dossier `web/frontend/`.
- Installez les dépendances : `npm install`.
- **IMPORTANT** : Lancez la commande `npm run build`.
- Un dossier nommé `out/` sera créé à l'intérieur de `frontend/`. Le serveur l'utilisera automatiquement.

## Fonctionnalités
- **Base de données** : Même que l'APK (https://groupegsi.mg/rtmggmg/api).
- **Création Élève** : Uniquement via `https://groupegsi.mg/web/admincreat`.
  - Login par défaut : `GSI-MG`
  - Pass par défaut : `GSI-Madagascar`
- **Installation Mobile (PWA)** : Propose l'ajout à l'écran d'accueil sur téléphone.
- **Hébergement en sous-dossier** : Configuré pour fonctionner parfaitement dans `/web/`.
