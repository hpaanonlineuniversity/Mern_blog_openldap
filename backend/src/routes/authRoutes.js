// routes/authRoutes.js ကို update လုပ်ပါ

import express from 'express';
import { ldapService } from '../services/ldapService.js';

const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log("Login attempt - username:", username);

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    const user = await ldapService.authenticate(username, password);
    
    res.json({
      success: true,
      message: 'Login successful',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const {
      username,
      password,
      email,
      firstName,
      lastName,
      isAdmin = false
    } = req.body;

    console.log("Registration attempt - username:", username);

    // Validation
    if (!username || !password || !email || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: username, password, email, firstName, lastName'
      });
    }

    // Password strength check (optional)
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Email format validation (simple check)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    const userData = {
      username,
      password,
      email,
      firstName,
      lastName,
      isAdmin
    };

    const newUser = await ldapService.createUser(userData);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: newUser.toJSON()
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    let statusCode = 400;
    let errorMessage = error.message;

    // Handle specific error cases
    if (error.message.includes('already exists')) {
      statusCode = 409; // Conflict
      errorMessage = 'Username already exists';
    } else if (error.message.includes('Failed to create user')) {
      statusCode = 500;
      errorMessage = 'Internal server error during user creation';
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage
    });
  }
});

export default router;