const express = require("express");
const router = express.Router();
const { register, verifyOTP, loginUser } = require("../controllers/authController");

router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/login", loginUser);

module.exports = router;
