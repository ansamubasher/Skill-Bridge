const express = require('express');
const mongoose = require('mongoose');

const freelancerRoutes = require('./backend/routes/freelancer');
const authRoutes = require('./backend/routes/authRoutes');

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  console.log("REQUEST HIT:", req.method, req.url);
  next();
});

// ROUTES FIRST (OK)
app.use('/auth', authRoutes);
// app.use('/freelancer', freelancerRoutes);

// CONNECT DB FIRST, THEN START SERVER
mongoose.connect('mongodb+srv://ansamubasher_db_user:210904ansa@cluster0.o5xuys6.mongodb.net/skillbridge?retryWrites=true&w=majority')
  .then(() => {
    console.log('MongoDB connected');

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  })
  .catch(err => {
    console.error('MongoDB connection failed:', err);
  });