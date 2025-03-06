const User = require("../models/user");
const OTP = require("../models/otp");
const PasswordReset = require("../models/passwordReset");
const TokenBlacklist = require("../models/tokenBlacklist");
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
    await sendEmail(
      email,
      "Verify Your Account",
      `<h1>Account Verification</h1>
      <p>Your OTP is: <strong>${otp}</strong></p>`
    );


    // Store user details in session or temp storage (before OTP verification)
    req.session.tempUser = { name, email, password: hashedPassword };

    return res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Verify OTP Handler
exports.verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const { email } = req.session.tempUser;

    // Check if OTP exists
    const existingOTP = await OTP.findOne({ email, otp });
    if (!existingOTP) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check if OTP has expired
    if (existingOTP.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Create User
    const { name, password } = req.session.tempUser;
    await User.create({ name, email, password, isVerified: true });

    // Delete OTP
    await OTP.deleteOne({ email });

    // Clear tempUser from session
    delete req.session.tempUser;

    return res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// User Login Handler
// exports.loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Check if user exists
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: "User not found" });
//     }

//     // Check if the user is verified
//     if (!user.isVerified) {
//       return res.status(400).json({ message: "Account not verified. Please verify your email first." });
//     }

//     // Compare password
//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     // Generate JWT Token
//     const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "8h" });

//     return res.status(200).json({ message: "Login successful", token });
//   } catch (error) {
//     return res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.isVerified || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials or unverified account" });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "8h" });
    return res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Logout Handler (Token Blacklisting)
exports.logout = async (req, res) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) return res.status(400).json({ message: "No token provided." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await TokenBlacklist.create({ token, expiresAt: new Date(decoded.exp * 1000) });

    return res.status(200).json({ message: "Logout successful." });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};



// Request Password Reset (Send OTP)
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    await PasswordReset.create({ email, otp, expiresAt });
    await sendEmail(
      email,
      "Verify Your Account",
      `<h1>Account Verification</h1>
      <p>Your OTP is: <strong>${otp}</strong></p>`
    );

    return res.json({ message: "OTP sent to your email." });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


let otpStore = {}
// Verify Password Reset OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const resetEntry = await PasswordReset.findOne({ email, otp });

    if (!resetEntry || resetEntry.expiresAt < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    otpStore[email] = otp;
    return res.json({ message: "OTP verified. Proceed with password reset." });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const resetEntry = await PasswordReset.findOne({ email, otp: otpStore[email] });

    if (!resetEntry || resetEntry.expiresAt < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ email }, { password: hashedPassword });
    await PasswordReset.deleteOne({ email, otp: otpStore[email] });

    return res.json({ message: "Password reset successful." });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
