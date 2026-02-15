const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Base path for the web version
const BASE_PATH = '/web';

// Serve static files from the Next.js export
// The 'out' directory should be inside the 'web' directory
app.use(BASE_PATH, express.static(path.join(__dirname, 'out')));

// Admin creation endpoint (Optional but good for security)
app.post(`${BASE_PATH}/api/admin-verify`, (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
});

app.post(`${BASE_PATH}/api/admin/create-student`, async (req, res) => {
  const { adminAuth, studentData } = req.body;

  // Verify admin again on server side
  if (adminAuth.username !== process.env.ADMIN_USER || adminAuth.password !== process.env.ADMIN_PASS) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    const response = await fetch(`${process.env.MAIN_API_BASE}/db/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData)
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Fallback for SPA (Single Page Application)
// All routes under /web should serve index.html
app.get(`${BASE_PATH}/*`, (req, res) => {
  res.sendFile(path.join(__dirname, 'out', 'index.html'));
});

// Redirect root to /web
app.get('/', (req, res) => {
  res.redirect(BASE_PATH);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access the app at http://localhost:${PORT}${BASE_PATH}`);
});
