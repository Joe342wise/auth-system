# Authentication System with Google OAuth & JWT

## Overview
This project is a secure authentication system built with **Node.js**, **Express**, **MongoDB**, and **Passport.js**. It supports traditional authentication with email/password, Google OAuth, and multi-factor authentication (MFA) via OTP. JWT is used for session management, and token blacklisting is implemented for logout security.

## Features
- **User Authentication** (Register, Login, Logout)
- **Google OAuth Authentication**
- **JWT-based Authentication**
- **OTP-based Email Verification**
- **Password Reset with OTP**
- **Token Blacklisting for Secure Logout**
- **Cron Job for Cleaning Expired Tokens**

## Technologies Used
- **Node.js & Express.js** - Backend framework
- **MongoDB & Mongoose** - Database and ORM
- **Passport.js** - Google OAuth authentication
- **JWT (jsonwebtoken)** - Token-based authentication
- **Nodemailer** - Email notifications
- **Node-cron** - Scheduled tasks
- **Bcrypt** - Password hashing

---

## Installation & Setup
### Prerequisites
- **Node.js** (v14+)
- **MongoDB** (local or Atlas instance)
- **Google Developer Console Account** (for OAuth setup)

### Steps to Run
1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-repo.git
   cd your-repo
   ```
2. **Install Dependencies**
   ```bash
   npm install
   ```
3. **Set Up Environment Variables**
   Create a `.env` file and add the following:
   ```env
   PORT=5000
   MONGO_URI=your-mongodb-connection-string
   JWT_SECRET=your-secret-key
   EMAIL_USER=your-email@example.com
   EMAIL_PASS=your-email-password
   SESSION_SECRET=your-session-secret
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   ```
4. **Run the Server**
   ```bash
   npm start
   ```

---

## Project Structure
```
📂 project-root
 ├── controllers
 │   ├── authController.js   # Handles user authentication & OTP logic
 ├── middleware
 │   ├── authMiddleware.js    # JWT authentication & token blacklisting
 ├── models
 │   ├── user.js             # User schema
 │   ├── otp.js              # OTP schema
 │   ├── passwordReset.js    # Password reset schema
 │   ├── tokenBlacklist.js   # Blacklisted tokens
 ├── routes
 │   ├── authRoutes.js       # Authentication-related routes
 │   ├── protectedRoutes.js  # Protected routes requiring authentication
 ├── config
 │   ├── db.js               # Database connection
 │   ├── passport.js         # Google OAuth setup
 ├── utils
 │   ├── sendEmail.js        # Email sending utility
 ├── server.js               # Main application entry point
 ├── package.json            # Dependencies & scripts
 ├── .env                    # Environment variables
```

---

## API Endpoints
### Authentication
| Method | Endpoint               | Description                |
|--------|------------------------|----------------------------|
| POST   | `/api/auth/register`    | Register a new user        |
| POST   | `/api/auth/verify-otp`  | Verify OTP for account activation |
| POST   | `/api/auth/login`       | Login and get JWT token    |
| POST   | `/api/auth/logout`      | Logout (Blacklist JWT)     |
| GET    | `/api/auth/google`      | Google OAuth Login         |
| GET    | `/api/auth/google/callback` | Google OAuth Callback  |

### Password Reset
| Method | Endpoint                    | Description                |
|--------|-----------------------------|----------------------------|
| POST   | `/api/auth/request-reset`   | Request password reset OTP |
| POST   | `/api/auth/verify-request-otp` | Verify password reset OTP |
| POST   | `/api/auth/reset-password`  | Reset password             |

### Protected Routes (Require Authentication)
| Method | Endpoint          | Description                |
|--------|------------------|----------------------------|
| GET    | `/api/protected/dashboard` | Protected user dashboard |

---

## Security Features
- **JWT Authentication**: Tokens expire in **8 hours**
- **Token Blacklisting**: Prevents reuse of old JWTs
- **Session Middleware**: Stores temporary user data before verification
- **Password Hashing**: Bcrypt encryption for secure storage
- **Email Verification**: OTP-based email validation
- **Cron Job**: Daily cleanup of expired blacklisted tokens

---

## License
This project is open-source and available under the **MIT License**.


