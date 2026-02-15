const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const ADMIN_USER = process.env.ADMIN_USER || 'GSI-MG';
const ADMIN_PASS = process.env.ADMIN_PASS || 'GSI-Madagascar';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// DB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gsi_insight';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Generic Dynamic Schema/Model
const genericSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const getModel = (collectionName) => {
  return mongoose.models[collectionName] || mongoose.model(collectionName, genericSchema, collectionName);
};

// --- AUTH HELPERS ---
const isAdmin = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return false;
  try {
    const [user, pass] = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    return user === ADMIN_USER && pass === ADMIN_PASS;
  } catch (e) {
    return false;
  }
};

// --- API ROUTES ---

// Generic Get
app.get('/api/db/:collection', async (req, res) => {
  try {
    const { collection } = req.params;
    const { q, s, l, sk } = req.query;

    // Safety: Protect users collection
    if (collection === 'users' && !isAdmin(req)) {
        // If not admin, only allow filtering by email/id (for login/profile)
        // and NEVER return the whole list.
        if (!q) return res.status(403).json({ error: "Access denied" });
    }

    let query = {};
    if (q) {
      try {
        query = JSON.parse(decodeURIComponent(q));
      } catch (e) {
        return res.status(400).json({ error: "Invalid query JSON" });
      }
    }

    const Model = getModel(collection);
    let dbQuery = Model.find(query);

    if (s) {
      try {
        dbQuery = dbQuery.sort(JSON.parse(decodeURIComponent(s)));
      } catch (e) {}
    }

    if (l) dbQuery = dbQuery.limit(parseInt(l));
    if (sk) dbQuery = dbQuery.skip(parseInt(sk));

    const data = await dbQuery.exec();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generic Post
app.post('/api/db/:collection', async (req, res) => {
  try {
    const { collection } = req.params;

    // Restricted collections
    const restricted = ['users', 'lessons', 'assignments', 'announcements', 'schedules'];
    if (restricted.includes(collection) && !isAdmin(req)) {
      return res.status(403).json({ error: "Admin access required for this collection" });
    }

    const Model = getModel(collection);
    const newItem = new Model(req.body);
    const saved = await newItem.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generic Patch
app.patch('/api/db/:collection/:id', async (req, res) => {
  try {
    const { collection, id } = req.params;

    // Only allow admin to patch important stuff
    const restricted = ['users', 'lessons', 'assignments', 'announcements', 'schedules'];
    if (restricted.includes(collection) && !isAdmin(req)) {
       // Exception: students might want to update their own profile?
       // But user said "l'admin seule peux...", so let's stick to admin only for now.
       return res.status(403).json({ error: "Admin access required" });
    }

    const Model = getModel(collection);
    const updated = await Model.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generic Delete
app.delete('/api/db/:collection/:id', async (req, res) => {
  try {
    const { collection, id } = req.params;
    if (!isAdmin(req)) return res.status(403).json({ error: "Admin access required" });

    const Model = getModel(collection);
    await Model.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- FILE UPLOADS ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(__dirname, 'uploads', req.body.path || '');
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });

app.post('/api/upload', upload.single('file'), (req, res) => {
  // We allow upload (students upload homework, profile photos)
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const relativePath = path.join('uploads', req.body.path || '', req.file.filename);
  const viewUrl = `/files/view/${relativePath.replace(/\\/g, '/')}`;
  res.json({ url: viewUrl, viewUrl });
});

// Serve files
app.get('/files/view/*', (req, res) => {
    const filePath = req.params[0];
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
        res.sendFile(fullPath);
    } else {
        res.status(404).send('File not found');
    }
});

app.listen(PORT, () => {
  console.log(`GSI Web Backend running on port ${PORT}`);
});
