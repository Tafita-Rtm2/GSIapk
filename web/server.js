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
    console.warn("ATTENTION: ADMIN_USER ou ADMIN_PASS non défini dans .env");
}

app.use(cors());
app.use(express.json());

// --- ADMIN CREATION PROXY ---
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

// Le dossier 'out' est généré par la commande 'npm run build'
const buildDir = path.join(__dirname, 'out');

if (fs.existsSync(path.join(buildDir, 'index.html'))) {
    // On sert les fichiers statiques
    app.use('/web', express.static(buildDir));
    app.use(express.static(buildDir));

    // Support pour le routage SPA (Single Page Application)
    app.get(['/web/*', '*'], (req, res) => {
        if (req.url.includes('/api/')) return res.status(404).json({ error: "Not found" });
        res.sendFile(path.join(buildDir, 'index.html'));
    });
} else {
    // Page d'aide si le build n'est pas fait
    app.get('*', (req, res) => {
        res.status(200).send(`
            <div style="font-family: sans-serif; padding: 40px; line-height: 1.6;">
                <h1 style="color: #e11d48;">GSI Web - Build Manquant</h1>
                <p>Le serveur fonctionne, mais les fichiers du site n'ont pas encore été générés.</p>
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; border-left: 4px solid #e11d48;">
                    <p><strong>Comment régler cela sur cPanel :</strong></p>
                    <ol>
                        <li>Ouvrez le <b>Terminal</b> dans cPanel (ou utilisez l'interface "Setup Node.js App").</li>
                        <li>Allez dans le dossier : <code>cd domains/groupesgi.mg/web</code></li>
                        <li>Lancez : <code>npm install</code></li>
                        <li>Lancez : <code>npm run build</code></li>
                    </ol>
                    <p>Une fois terminé, un dossier <code>out/</code> apparaîtra et le site fonctionnera.</p>
                </div>
                <p style="margin-top: 20px; color: #6b7280;">Dossier vérifié : <code>${buildDir}</code></p>
            </div>
        `);
    });
}

app.listen(PORT, () => {
    console.log(`GSI Web Server running on port ${PORT}`);
});
