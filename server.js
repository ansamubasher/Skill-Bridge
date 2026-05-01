<<<<<<< rana
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes); // Mounted as /api/projects as requested

// Root route
app.get("/", (req, res) => {
  res.send("Skill-Bridge API is running...");
});

// Database connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/skill-bridge";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

export default app;
=======
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
>>>>>>> main
