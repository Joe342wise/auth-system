// const express = require("express");
// const connectDB = require("./config/db");
// const authRoutes = require("./routes/auth");
// require("dotenv").config();

// const app = express();
// connectDB();

// app.use(express.json());
// app.use("/api/auth", authRoutes);

// app.listen(5000, () => console.log("Server running on port 5000"));

const mongoose = require("mongoose");
const session = require("express-session");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const express = require("express");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

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

// Authentication Routes
app.use("/api/auth", authRoutes);

// Set up the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
