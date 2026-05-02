require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const freelancerRoutes = require('./routes/freelancer');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');

const clientRoutes = require('./routes/projectRoutes');
const app = express();
app.use(express.json());

app.use((req, res, next) => {
  console.log("REQUEST HIT:", req.method, req.url);
  next();
});

const PORT = process.env.PORT || 5000;

mongoose.connect('mongodb+srv://ansamubasher_db_user:test123@cluster0.o5xuys6.mongodb.net/skillbridge?retryWrites=true&w=majority')
  .then(() => {
    console.log('MongoDB connected, state:', mongoose.connection.readyState);

    // ✅ Register ALL routes AFTER DB is ready
    app.use('/auth', authRoutes);
    // //app.use('/profile', profileRoutes);
    // //app.use('/freelancer', freelancerRoutes);
    app.use ('/client', clientRoutes);

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