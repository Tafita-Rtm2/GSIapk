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

const https = require('https');
const http = require('http');

// Proxy for media assets to avoid CORS issues
app.get('/apk/api/proxy', (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('URL is required');

  // Sécurité SSRF : On n'autorise que les URLs provenant du domaine officiel
  const allowedBase = "https://groupegsi.mg";
  if (!targetUrl.startsWith(allowedBase)) {
    console.warn(`[PROXY] Blocked unauthorized URL: ${targetUrl}`);
    return res.status(403).send('URL non autorisée.');
  }

  const parsedUrl = new URL(targetUrl);
  const protocol = parsedUrl.protocol === 'https:' ? https : http;

  const options = {
    method: 'GET',
    headers: { ...req.headers }
  };

  // Nettoyage des headers sensibles
  delete options.headers.host;
  delete options.headers.connection;
  delete options.headers.cookie;

  // Assurer un User-Agent décent
  options.headers['user-agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  const proxyReq = protocol.request(targetUrl, options, (proxyRes) => {
    // On propage tous les headers de réponse de l'amont
    const responseHeaders = { ...proxyRes.headers };

    // On surcharge les headers critiques pour le web
    responseHeaders['content-disposition'] = 'inline';
    responseHeaders['access-control-allow-origin'] = '*';
    responseHeaders['access-control-allow-methods'] = 'GET, OPTIONS';
    responseHeaders['access-control-expose-headers'] = 'Content-Range, Content-Length, Accept-Ranges';

    // Retirer les headers qui pourraient bloquer l'affichage (CSP, etc.)
    delete responseHeaders['content-security-policy'];
    delete responseHeaders['x-frame-options'];

    res.writeHead(proxyRes.statusCode, responseHeaders);

    console.log(`[PROXY] Stream: ${targetUrl} [Status: ${proxyRes.statusCode}] [Range: ${req.headers.range || 'none'}]`);

    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('[PROXY] Request Error:', err);
    if (!res.headersSent) res.status(500).send('Proxy Error');
  });

  req.on('close', () => {
    proxyReq.destroy();
  });

  proxyReq.end();
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
