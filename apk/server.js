const express = require('express');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for CORS (essential for some browsers)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Range');
  res.setHeader('Access-Control-Allow-Credentials', true);
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Config API for the frontend
app.get('/apk/api/config', (req, res) => {
  res.json({
    API_BASE: process.env.API_BASE || "https://groupegsi.mg/rtmggmg/api",
    MEDIA_BASE: process.env.MEDIA_BASE || "https://groupegsi.mg/rtmggmg",
    ADMIN_CODE: process.env.ADMIN_CODE,
    PROF_PASS: process.env.PROF_PASS
  });
});

// Proxy for media assets to avoid CORS issues
app.get('/apk/api/proxy', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('URL is required');

  // Sécurité SSRF : On n'autorise que les URLs provenant du domaine officiel
  const allowedBase = "https://groupegsi.mg";
  if (!url.startsWith(allowedBase)) {
    console.warn(`[PROXY] Blocked unauthorized URL: ${url}`);
    return res.status(403).send('URL non autorisée.');
  }

  console.log(`[PROXY] Fetching: ${url}`);

  try {
    const fetchOptions = {
      method: 'GET',
      compress: false, // TRÈS IMPORTANT : Ne pas décompresser pour garder les Content-Length/Range intacts
      headers: {
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0'
      }
    };

    // On transmet les headers critiques pour le streaming (Range)
    if (req.headers.range) fetchOptions.headers.range = req.headers.range;
    if (req.headers.accept) fetchOptions.headers.accept = req.headers.accept;

    const response = await fetch(url, fetchOptions);

    // On recopie le statut et tous les headers pertinents
    res.status(response.status);

    const headersToCopy = [
      'content-type',
      'content-length',
      'content-range',
      'accept-ranges',
      'cache-control',
      'last-modified',
      'etag',
      'vary'
    ];

    headersToCopy.forEach(h => {
      const val = response.headers.get(h);
      if (val) res.setHeader(h, val);
    });

    // Force inline pour éviter le téléchargement, autorise le visionnage
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');

    console.log(`[PROXY] Fetching ${url} | Status: ${response.status} | Range: ${req.headers.range || 'none'}`);

    // Piping direct du flux
    response.body.pipe(res);

    response.body.on('error', (err) => {
      console.error('[PROXY] Stream error:', err);
      res.end();
    });

    req.on('close', () => {
      // Annuler le fetch si le client ferme la connexion
      if (response.body.destroy) response.body.destroy();
    });

  } catch (error) {
    console.error('[PROXY] Error:', error);
    if (!res.headersSent) {
      res.status(500).send('Proxy internal error');
    }
  }
});

// Serve static files from the 'out' directory
// Note: Next.js 'out' directory will be served at /apk because of basePath
app.use('/apk', express.static(path.join(__dirname, 'out')));

// Handle PWA manifest
app.get('/apk/manifest.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'out', 'manifest.json'));
});

// Handle Service Worker
app.get('/apk/sw.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'out', 'sw.js'));
});

// Redirect root to /apk/
app.get('/', (req, res) => {
  res.redirect('/apk/');
});

// Fallback to index.html for SPA routing
app.get('/apk/*', (req, res) => {
  console.log(`[DEBUG] Request for: ${req.path}`);
  const requestedPath = req.path.replace('/apk', '');

  // Try to find the file in the out directory
  // Next.js with trailingSlash: true creates folder/index.html
  let potentialFile = path.join(__dirname, 'out', requestedPath);

  // Clean up potential double slashes
  potentialFile = path.normalize(potentialFile);

  if (fs.existsSync(potentialFile) && fs.lstatSync(potentialFile).isDirectory()) {
    potentialFile = path.join(potentialFile, 'index.html');
  } else if (!fs.existsSync(potentialFile) && !requestedPath.includes('.')) {
    // If it doesn't exist and has no extension, it's likely a route
    const withIndex = path.join(__dirname, 'out', requestedPath, 'index.html');
    if (fs.existsSync(withIndex)) {
      potentialFile = withIndex;
    } else {
      potentialFile = path.join(__dirname, 'out', 'index.html');
    }
  }

  if (fs.existsSync(potentialFile) && fs.lstatSync(potentialFile).isFile()) {
    res.sendFile(potentialFile);
  } else {
    const mainIndex = path.join(__dirname, 'out', 'index.html');
    if (fs.existsSync(mainIndex)) {
      res.sendFile(mainIndex);
    } else {
      res.status(404).send('Error: out/index.html not found. Please ensure the project is built (npm run build).');
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access at http://localhost:${PORT}/apk/`);
});
