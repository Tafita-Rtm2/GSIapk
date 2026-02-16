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
const API_BASE = process.env.API_BASE || "https://groupegsi.mg/rtmggmg/api";
const MEDIA_BASE = process.env.MEDIA_BASE || "https://groupegsi.mg/rtmggmg";

// Endpoint de configuration pour le frontend
app.get('/web/api/config', (req, res) => {
  res.json({
    API_BASE,
    MEDIA_BASE
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

app.use('/web', express.static(path.join(__dirname, 'out'), {
  extensions: ['html']
}));

app.get('/web/*', (req, res) => {
  const relativePath = req.path.replace(/^\/web/, '');
  const htmlPath = path.join(__dirname, 'out', relativePath + '.html');

  if (fs.existsSync(htmlPath)) {
    return res.sendFile(htmlPath);
  }

  const indexPath = path.join(__dirname, 'out', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send("Build non trouvé. Veuillez lancer 'npm run build' dans le dossier web.");
  }
});

app.get('/', (req, res) => {
  res.redirect('/web');
});

app.listen(PORT, () => {
  console.log(`Serveur GSI Web démarré sur le port ${PORT}`);
});
