const express = require('express');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const ADMIN_USER = process.env.ADMIN_USER || "GSI-MG";
const ADMIN_PASS = process.env.ADMIN_PASS || "GSI-Madagascar";
const ADMIN_CODE = process.env.ADMIN_CODE || "Nina GSI";
const PROF_PASS = process.env.PROF_PASS || "prof-gsi-mg";
const API_BASE = process.env.API_BASE || "https://groupegsi.mg/rtmggmg/api";
const MEDIA_BASE = process.env.MEDIA_BASE || "https://groupegsi.mg/rtmggmg";

// Endpoint de configuration pour le frontend
app.get('/web/api/config', (req, res) => {
  res.json({
    API_BASE,
    MEDIA_BASE,
    ADMIN_CODE,
    PROF_PASS
  });
});

app.post('/web/api/admin/verify', (req, res) => {
  const { user, pass } = req.body;
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    res.status(200).json({ success: true });
  } else {
    res.status(401).json({ success: false, message: "Non autorisé" });
  }
});

app.get('/web/api/proxy', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("URL manquante");

  try {
    const response = await fetch(url, {
      headers: {
        'Range': req.headers.range || ''
      }
    });

    res.status(response.status);

    // Transférer les headers importants
    const headersToTransfer = ['content-type', 'content-length', 'accept-ranges', 'content-range'];
    headersToTransfer.forEach(h => {
      const val = response.headers.get(h);
      if (val) res.setHeader(h, val);
    });

    response.body.pipe(res);
  } catch (error) {
    console.error("Erreur proxy:", error.message);
    res.status(500).send("Erreur de chargement du média");
  }
});

app.post('/web/api/admin/create-student', async (req, res) => {
  const { admin, student } = req.body;
  if (admin.user !== ADMIN_USER || admin.pass !== ADMIN_PASS) {
    return res.status(401).json({ success: false, message: "Action non autorisée" });
  }
  try {
    const response = await fetch(`${API_BASE}/db/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student)
    });
    const data = await response.json();
    if (response.ok) {
      res.status(200).json({ success: true, data });
    } else {
      res.status(response.status).json({ success: false, message: "Erreur API GSI", error: data });
    }
  } catch (error) {
    console.error("Erreur creation etudiant:", error);
    res.status(500).json({ success: false, message: "Erreur serveur interne" });
  }
});

// Servir les fichiers statiques du dossier 'out'
app.use('/web', express.static(path.join(__dirname, 'out'), {
  extensions: ['html']
}));

// Fallback pour les routes Next.js (SPA support)
app.get('/web/*', (req, res) => {
  let relativePath = req.path.replace(/^\/web/, '');
  if (!relativePath || relativePath === '/') relativePath = '/index';

  // Supprimer le slash final pour tester le fichier .html
  let cleanPath = relativePath.endsWith('/') ? relativePath.slice(0, -1) : relativePath;

  const htmlPath = path.join(__dirname, 'out', cleanPath + '.html');
  const folderIndexPath = path.join(__dirname, 'out', cleanPath, 'index.html');

  if (fs.existsSync(htmlPath)) {
    return res.sendFile(htmlPath);
  } else if (fs.existsSync(folderIndexPath)) {
    return res.sendFile(folderIndexPath);
  }

  const indexPath = path.join(__dirname, 'out', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send("Build non trouvé.");
  }
});

app.get('/', (req, res) => {
  res.redirect('/web/');
});

async function syncConfigToDB() {
  try {
    // Check if config already exists
    const res = await fetch(`${API_BASE}/db/system_config`);
    const data = await res.json();

    const config = {
      id: 'main_config',
      ADMIN_CODE,
      PROF_PASS,
      updatedAt: new Date().toISOString()
    };

    if (Array.isArray(data) && data.length > 0) {
      // Update existing
      await fetch(`${API_BASE}/db/system_config/${data[0]._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      console.log("Config GSI synchronisée (Mise à jour)");
    } else {
      // Create new
      await fetch(`${API_BASE}/db/system_config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      console.log("Config GSI synchronisée (Création)");
    }
  } catch (error) {
    console.error("Échec de la synchronisation de la config vers la DB:", error.message);
  }
}

app.listen(PORT, () => {
  console.log(`Serveur GSI Web démarré sur le port ${PORT}`);
  // Sync config to DB for APK to scrape
  syncConfigToDB();
});
