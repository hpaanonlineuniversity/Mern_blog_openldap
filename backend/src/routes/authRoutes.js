// routes/authRoutes.js
import express from 'express';
import { ldapService } from '../services/ldapService.js';

const router = express.Router();

// Authentication endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log("username",username);
    console.log("password", password);

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

export default router;