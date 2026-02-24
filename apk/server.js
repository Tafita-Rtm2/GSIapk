const express = require('express');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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
    return res.status(403).send('URL non autorisée.');
  }

  try {
    const response = await fetch(url);
    const contentType = response.headers.get('content-type');
    if (contentType) res.setHeader('Content-Type', contentType);
    response.body.pipe(res);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).send('Proxy error');
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
  const requestedPath = req.path.replace('/apk', '');

  // Try to find the file in the out directory
  // Next.js with trailingSlash: true creates folder/index.html
  let potentialFile = path.join(__dirname, 'out', requestedPath);

  if (fs.existsSync(potentialFile) && fs.lstatSync(potentialFile).isDirectory()) {
    potentialFile = path.join(potentialFile, 'index.html');
  } else if (!fs.existsSync(potentialFile) && !requestedPath.includes('.')) {
    potentialFile = path.join(__dirname, 'out', requestedPath, 'index.html');
  }

  if (fs.existsSync(potentialFile) && fs.lstatSync(potentialFile).isFile()) {
    res.sendFile(potentialFile);
  } else {
    res.sendFile(path.join(__dirname, 'out', 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access at http://localhost:${PORT}/apk/`);
});
