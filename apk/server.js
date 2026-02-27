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

// Config API for the frontend (Safe public config)
app.get('/apk/api/config', (req, res) => {
  res.json({
    API_BASE: process.env.API_BASE || "https://groupegsi.mg/rtmggmg/api",
    MEDIA_BASE: process.env.MEDIA_BASE || "https://groupegsi.mg/rtmggmg"
  });
});

const https = require('https');
const http = require('http');

// Proxy for media assets to avoid CORS issues
app.get('/apk/api/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('URL is required');

  // Sécurité SSRF : On n'autorise que les URLs provenant du domaine officiel
  const allowedBase = "https://groupegsi.mg";
  if (!targetUrl.startsWith(allowedBase)) {
    console.warn(`[PROXY] Blocked unauthorized URL: ${targetUrl}`);
    return res.status(403).send('URL non autorisée.');
  }

  try {
    const fetchOptions = {
      method: 'GET',
      headers: {
        ...req.headers,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      redirect: 'follow',
      compress: false // CRITICAL: Do not decompress to keep original headers valid
    };

    // Nettoyage des headers entrants
    delete fetchOptions.headers.host;
    delete fetchOptions.headers.connection;
    delete fetchOptions.headers.cookie;
    delete fetchOptions.headers.referer;

    const response = await fetch(targetUrl, fetchOptions);

    // Status Code propagation
    res.status(response.status);

    // Headers extraction and cleanup
    const skipHeaders = [
      'content-security-policy',
      'x-frame-options',
      'access-control-allow-origin',
      'set-cookie',
      'transfer-encoding',
      'connection'
    ];

    response.headers.forEach((value, name) => {
      if (!skipHeaders.includes(name.toLowerCase())) {
        res.setHeader(name, value);
      }
    });

    // Surcharger les headers pour le fonctionnement optimal web
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type, Accept');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges, Content-Type');

    // Forcer Accept-Ranges pour les médias connus si manquant
    const contentType = response.headers.get('content-type') || "";
    if (contentType.includes('video') || contentType.includes('audio')) {
       res.setHeader('Accept-Ranges', 'bytes');
    }

    console.log(`[PROXY] Streaming: ${targetUrl} [Status: ${response.status}] [Range: ${req.headers.range || 'none'}]`);

    response.body.pipe(res);

    response.body.on('error', (err) => {
      console.error('[PROXY] Pipe Error:', err);
      res.end();
    });

    req.on('close', () => {
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
