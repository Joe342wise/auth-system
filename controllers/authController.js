const User = require("../models/user");
const OTP = require("../models/otp");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail"); // A function to send emails

// Generate Random OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// User Registration Handler
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate OTP
    const otp = generateOTP();
    const otpExpiration = new Date(Date.now() + 10 * 60 * 1000); // 10-minute expiration

    // Save OTP to database
    await OTP.create({ email, otp, expiresAt: otpExpiration });

    // Send OTP via email
    await sendEmail(email, "Verify Your Account", `Your OTP is: ${otp}`);

    // Store user details in session or temp storage (before OTP verification)
    req.session.tempUser = { name, email, password: hashedPassword };

    return res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find OTP in database
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Remove OTP from database after verification
    await OTP.deleteOne({ _id: otpRecord._id });

    // Retrieve user details from session (or temporary storage)
    const { name, password } = req.session.tempUser;

    // Save user to the database
    const newUser = await User.create({ name, email, password });

    return res.status(201).json({ message: "Account created successfully", user: newUser });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
