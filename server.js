const mongoose = require("mongoose");
const session = require("express-session");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const express = require("express");
const connectDB = require("./config/db");
const  passport = require("passport");

// Load environment variables
dotenv.config();

// Load Google OAuth Config
require("./config/passport");

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware to parse JSON
app.use(express.json());

// Session Middleware (For storing temporary user data)
app.use(session({
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Authentication Routes
app.use("/api/auth", authRoutes);

// Set up the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
