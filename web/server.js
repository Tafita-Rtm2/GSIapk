const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASS = process.env.ADMIN_PASS;
const MAIN_API_BASE = process.env.MAIN_API_BASE || "https://groupegsi.mg/rtmggmg/api";

if (!ADMIN_USER || !ADMIN_PASS) {
    console.error("FATAL: ADMIN_USER or ADMIN_PASS not set in .env");
}

app.use(cors());
app.use(express.json());

// --- ADMIN CREATION PROXY ---
// On écoute sur /web/api/... pour correspondre au sous-dossier
app.post(['/web/api/admin/create-student', '/api/admin/create-student'], async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Missing authorization" });

    try {
        const [user, pass] = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
        if (user !== ADMIN_USER || pass !== ADMIN_PASS) {
            return res.status(403).json({ error: "Unauthorized admin access" });
        }

        const response = await fetch(`${MAIN_API_BASE}/db/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (err) {
        res.status(500).json({ error: "Failed to connect to main database" });
    }
});

// --- SERVE FRONTEND ---

// Possible locations for the built site (the content of 'out' directory)
const possibleDirs = [
    path.join(__dirname, 'frontend', 'out'),
    path.join(__dirname, 'out'),
    path.join(__dirname, 'frontend')
];

let buildDir = null;
for (const dir of possibleDirs) {
    if (fs.existsSync(path.join(dir, 'index.html'))) {
        buildDir = dir;
        console.log(`Using build directory: ${buildDir}`);
        break;
    }
}

if (buildDir) {
    // On sert les fichiers statiques avec le préfixe /web et aussi à la racine au cas où
    app.use('/web', express.static(buildDir));
    app.use(express.static(buildDir));

    // Support for Next.js routing (SPA)
    app.get(['/web/*', '*'], (req, res) => {
        // If it's an API call that wasn't caught, return 404
        if (req.url.includes('/api/')) return res.status(404).json({ error: "Not found" });

        const indexPath = path.join(buildDir, 'index.html');
        res.sendFile(indexPath);
    });
} else {
    app.get('*', (req, res) => {
        res.status(200).send(`
            <h1>GSI Web - Erreur de configuration</h1>
            <p>Le dossier contenant le site (build) n'a pas été trouvé.</p>
            <p><strong>Action requise :</strong></p>
            <ol>
                <li>Entrez dans le dossier <code>frontend/</code></li>
                <li>Lancez la commande <code>npm install</code></li>
                <li>Lancez la commande <code>npm run build</code></li>
            </ol>
            <p>Ceci générera un dossier <code>out/</code> à l'intérieur de <code>frontend/</code> que ce serveur pourra utiliser.</p>
            <hr>
            <p>Emplacements vérifiés :</p>
            <ul>
                ${possibleDirs.map(d => `<li>${d}</li>`).join('')}
            </ul>
        `);
    });
}

app.listen(PORT, () => {
    console.log(`GSI Web Server running on port ${PORT}`);
});
