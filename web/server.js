const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const ADMIN_USER = process.env.ADMIN_USER || 'GSI-MG';
const ADMIN_PASS = process.env.ADMIN_PASS || 'GSI-Madagascar';
const MAIN_API_BASE = "https://groupegsi.mg/rtmggmg/api";

app.use(cors());
app.use(express.json());

// --- ADMIN CREATION PROXY ---
app.post('/api/admin/create-student', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Missing authorization" });

    const [user, pass] = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    if (user !== ADMIN_USER || pass !== ADMIN_PASS) {
        return res.status(403).json({ error: "Unauthorized admin access" });
    }

    try {
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
// After building the frontend with 'npm run build', the 'out' directory will be generated.
app.use(express.static(path.join(__dirname, 'frontend', 'out')));

app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, 'frontend', 'out', 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            res.status(200).send("GSI Web: Frontend build (out/) not found. Build the frontend inside 'frontend/' folder first.");
        }
    });
});

app.listen(PORT, () => {
    console.log(`GSI Web Server running on port ${PORT}`);
});
