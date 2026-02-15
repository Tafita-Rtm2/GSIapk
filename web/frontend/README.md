# GSI Insight — “Where data meets your future.”

GSI Insight est l'application intelligente de GSI Internationale conçue pour accompagner chaque étudiant tout au long de son parcours académique et professionnel.

## Fonctionnalités
- **Tableau de bord intelligent** : Vos cours, devoirs et alertes en un coup d'œil.
- **Emploi du temps** : Vue hebdomadaire et mensuelle de votre planning.
- **Mes matières** : Accès aux syllabus, supports de cours, et notes.
- **Bibliothèque** : Recherche et téléchargement de documents pour un accès hors ligne.
- **Career Insight** : Opportunités de stages et suivi des compétences.
- **Ask Insight** : Assistant IA pour répondre à vos questions académiques.
- **Services administratifs** : Gestion des paiements et demandes de documents.

## Installation et Développement

### Prérequis
- Node.js (v18+)
- npm ou yarn
- Android Studio (pour le build Android)

### Installation
```bash
npm install
```

### Lancement en mode développement
```bash
npm run dev
```

### Build pour le Web (Export Statique)
```bash
npm run build
```

### Build pour Android (APK)
1. Exportez le projet web :
   ```bash
   npm run build
   ```
2. Synchronisez avec Capacitor :
   ```bash
   npx cap sync android
   ```
3. Ouvrez dans Android Studio pour générer l'APK :
   ```bash
   npx cap open android
   ```

## Technologies utilisées
- **Frontend** : Next.js 15, Tailwind CSS, Shadcn UI
- **Mobile** : Capacitor
- **IA** : Client-side logic (MVP)
- **Langues** : Français (défaut), Anglais

## Licence
Propriété de GSI Internationale.
