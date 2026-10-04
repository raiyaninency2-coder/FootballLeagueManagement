const express = require('express');
const router = express.Router();
const { loginAdmin, getMe } = require('../controllers/authController');
const { verifyAdminToken } = require('../middlewares/authMiddleware');

// POST /api/auth/login - Public route for admin login
router.post('/login', loginAdmin);

// GET /api/auth/me - Protected route to verify current token and get admin info
router.get('/me', verifyAdminToken, getMe);

module.exports = router;
