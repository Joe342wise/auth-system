const mongoose = require("mongoose");
const session = require("express-session");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const protectedRoutes = require("./routes/protectedRoutes");
const express = require("express");
const connectDB = require("./config/db");
const  passport = require("passport");
const cron = require("node-cron");
const TokenBlacklist = require("./models/tokenBlacklist");

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
app.use("/api/protected", protectedRoutes);

// Schedule cron job to clean up expired blacklisted tokens daily at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    await TokenBlacklist.deleteMany({ expiresAt: { $lt: new Date() } });
    console.log("Expired blacklisted tokens removed.");
  } catch (error) {
    console.error("Error removing expired tokens:", error);
  }
});

// Set up the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
