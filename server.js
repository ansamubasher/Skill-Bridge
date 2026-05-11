require('dotenv').config();
// Fix: Node.js 17+ on Windows breaks SRV DNS lookups (used by mongodb+srv://)
// This forces IPv4-first resolution, which matches OS behavior
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const express = require('express');
const mongoose = require('mongoose');

const freelancerRoutes = require('./routes/freelancer');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const userRoutes = require('./routes/userRoutes');

const paymentRoutes = require('./routes/paymentRoute');
const messageRoutes = require('./routes/messageRoutes');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log("REQUEST HIT:", req.method, req.url);
  next();
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected, state:', mongoose.connection.readyState);

    // ✅ Register ALL routes AFTER DB is ready
    app.use('/auth', authRoutes);
    app.use('/profiles', profileRoutes);
    app.use('/users', userRoutes);
    // //app.use('/freelancer', freelancerRoutes);
    // app.use('/client', clientRoutes); 
    app.use('/payments', paymentRoutes);
    app.use('/messages', messageRoutes);

    // ✅ Start server LAST
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
  });


  mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected!');
});

mongoose.connection.on('error', (err) => {
  console.log('Mongoose error:', err.message);
});





``