const express = require("express");
const router = express.Router();
const passport = require("passport");
const { register, verifyOTP, loginUser } = require("../controllers/authController");

// Redirect to Google's OAuth page
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google callback route
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    if (!req.user) {
      return res.status(400).json({ message: "Google authentication failed" });
    }

    // Send JWT to frontend
    res.json({
      message: "Google login successful",
      token: req.user.token,
      user: req.user.user,
    });
  }
);

router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/login", loginUser);

module.exports = router;
