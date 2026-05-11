require('dotenv').config();

// Fix: Node.js 17+ on Windows breaks SRV DNS lookups (used by mongodb+srv://)
// This forces IPv4-first resolution, which matches OS behavior
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes    = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const userRoutes    = require('./routes/userRoutes');
const paymentRoutes = require('./routes/paymentRoute');
const messageRoutes = require('./routes/messageRoutes');
const projectRoutes = require('./routes/projectRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log('REQUEST HIT:', req.method, req.url);
  next();
});

// ── Mount routes (always, regardless of DB) ───────────────────────────────
app.use('/auth',     authRoutes);
app.use('/profiles', profileRoutes);
app.use('/users',    userRoutes);
app.use('/payments', paymentRoutes);
app.use('/messages', messageRoutes);
app.use('/projects', projectRoutes);
app.use('/notifications', notificationRoutes);

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── DB connection with automatic in-memory fallback ───────────────────────
async function startDB() {
  const atlasUri = process.env.MONGO_URI;

  // 1️⃣  Try Atlas first (only if MONGO_URI is set)
  if (atlasUri) {
    try {
      console.log('⏳ Trying MongoDB Atlas...');
      await mongoose.connect(atlasUri, { serverSelectionTimeoutMS: 6000 });
      console.log('✅ Connected to MongoDB Atlas');
      return;
    } catch (err) {
      console.warn('⚠️  Atlas unreachable:', err.message);
      console.warn('   → Falling back to in-memory MongoDB...');
    }
  } else {
    console.warn('ℹ️  MONGO_URI not set — using in-memory MongoDB');
  }

  // 2️⃣  Fallback: spin up a local in-memory MongoDB (works anywhere, no network)
  const { MongoMemoryServer } = require('mongodb-memory-server');
  const mongod = await MongoMemoryServer.create();
  const memUri  = mongod.getUri();

  await mongoose.connect(memUri);
  console.log('✅ Connected to in-memory MongoDB');
  console.log('   ⚡ Data is temporary — it resets on every server restart');
  console.log(`   URI: ${memUri}`);

  // Graceful shutdown
  process.on('SIGINT',  async () => { await mongod.stop(); process.exit(0); });
  process.on('SIGTERM', async () => { await mongod.stop(); process.exit(0); });
}

// ── Boot ──────────────────────────────────────────────────────────────────
startDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Fatal DB error:', err.message);
    process.exit(1);
  });

mongoose.connection.on('disconnected', () => console.log('⚠️  Mongoose disconnected'));
mongoose.connection.on('error', (err)  => console.log('⚠️  Mongoose error:', err.message));
