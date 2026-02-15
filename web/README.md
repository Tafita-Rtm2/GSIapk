# GSI Insight - Web Version (Structure Simplifiée)

Cette version web est optimisée pour un déploiement simple sur cPanel.

## Organisation
- **backend/** : Contient l'API Node.js (`server.js`).
- **frontend/** : Contient l'application web (`app/`, `components/`, etc.).

## Déploiement cPanel

### 1. Le Backend (API)
- Uploadez le dossier `backend` sur votre serveur.
- Installez les paquets : `npm install`.
- Configurez le `.env` avec votre base MongoDB.
- Utilisez le menu "Setup Node.js App" de cPanel et pointez sur `backend/server.js`.

### 2. Le Frontend (Site)
- Allez dans `frontend`.
- Générez le site : `npm run build`.
- Un dossier `out` sera créé. Copiez tout son contenu dans le dossier `public_html` de votre hébergement.

## Accès Administrateur
La création des élèves se fait sur : `votre-site.com/admincreat`
- Utilisez vos identifiants administrateur pour valider la création sur le serveur.
- L'inscription publique est désactivée.

## Mobile & Offline
Le site propose automatiquement une installation sur l'écran d'accueil du téléphone et fonctionne partiellement hors-ligne.
