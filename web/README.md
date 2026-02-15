# GSI Insight - Version Web (Installation Directe)

Cette version a été simplifiée pour une installation directe sur cPanel.

## Structure
- Tout est à la racine du dossier `web/`.
- Le serveur Node.js (`server.js`) gère à la fois le site et la sécurité.

## Guide de Déploiement cPanel

1.  **Préparation** : Supprimez tout le contenu actuel de votre dossier `web/` sur le serveur pour repartir sur une base propre.
2.  **Upload** : Transférez tout le contenu de ce dossier `web/` vers votre serveur.
3.  **Configuration Node.js** :
    *   Dans cPanel, utilisez "Setup Node.js App".
    *   **Application root** : `web`
    *   **Application URL** : `https://groupegsi.mg/web`
    *   **Application startup file** : `server.js`
4.  **Installation et Build (Étape Cruciale)** :
    *   Cliquez sur le bouton "Run JS Script" ou ouvrez le **Terminal** cPanel.
    *   Tapez : `npm install`
    *   Tapez : `npm run build`
    *   Cette dernière commande va créer le dossier `out/`. C'est ce dossier qui contient le site réel.
5.  **Relancer** : Redémarrez l'application Node.js depuis l'interface cPanel.

## Notes de Sécurité
Éditez le fichier `.env` à la racine pour changer les mots de passe admin si nécessaire.
- `ADMIN_USER` : Login pour la création d'élèves.
- `ADMIN_PASS` : Mot de passe pour la création d'élèves.
