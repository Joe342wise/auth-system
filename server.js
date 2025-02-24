// const express = require("express");
// const connectDB = require("./config/db");
// const authRoutes = require("./routes/auth");
// require("dotenv").config();

// const app = express();
// connectDB();

// app.use(express.json());
// app.use("/api/auth", authRoutes);

// app.listen(5000, () => console.log("Server running on port 5000"));


const express = require("express");
const connectDB = require("./config/db");

require("dotenv").config();

const app = express();

// Connect to Database
connectDB();

app.use(express.json()); // Middleware to parse JSON

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
