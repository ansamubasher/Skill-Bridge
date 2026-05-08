require('dotenv').config();

// ── Force Google DNS so MongoDB Atlas SRV works on any network/ISP ────────
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
// ─────────────────────────────────────────────────────────────────────────

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes    = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const userRoutes    = require('./routes/userRoutes');
const paymentRoutes = require('./routes/paymentRoute');
const messageRoutes = require('./routes/messageRoutes');
const projectRoutes = require('./routes/projectRoutes');

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
