const express = require('express');
const mongoose = require('mongoose');

const freelancerRoutes = require('./backend/routes/freelancer');

const authRoutes = require('./backend/routes/authRoutes');
const app = express();

// // Connect to MongoDB
mongoose.connect('mongodb+srv://ansamubasher_db_user:210904ansa@cluster0.o5xuys6.mongodb.net/skillbridge?retryWrites=true&w=majority')
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));


app.use ('/auth', authRoutes)

// app.use('/freelancer', freelancerRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
}); 