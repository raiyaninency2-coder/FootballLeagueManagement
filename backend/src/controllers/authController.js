const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Admin Login Controller
const loginAdmin = async (req, res) => {
    try {
        const { usernameOrEmail, password } = req.body;

        if (!usernameOrEmail || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both username/email and password.'
            });
        }

        // Find admin by username or email
        const [admins] = await pool.query(
            'SELECT * FROM admins WHERE username = ? OR email = ? LIMIT 1',
            [usernameOrEmail, usernameOrEmail]
        );

        if (admins.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials. Admin not found.'
            });
        }

        const admin = admins[0];

        // Compare entered password with stored hashed password
        const isMatch = await bcrypt.compare(password, admin.password_hash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials. Incorrect password.'
            });
        }

        // Generate JSON Web Token (valid for 24 hours)
        const token = jwt.sign(
            {
                admin_id: admin.admin_id,
                username: admin.username,
                role: admin.role
            },
            process.env.JWT_SECRET || 'super_secret_jwt_key_football_league_2025',
            { expiresIn: '24h' }
        );

        // Send back token and safe profile details
        res.json({
            success: true,
            message: 'Admin login successful!',
            token,
            admin: {
                admin_id: admin.admin_id,
                username: admin.username,
                email: admin.email,
                full_name: admin.full_name,
                role: admin.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: error.message
        });
    }
};

// Get current logged-in admin profile
const getMe = async (req, res) => {
    try {
        const [admins] = await pool.query(
            'SELECT admin_id, username, email, full_name, role, created_at FROM admins WHERE admin_id = ? LIMIT 1',
            [req.admin.admin_id]
        );

        if (admins.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Admin profile not found.'
            });
        }

        res.json({
            success: true,
            admin: admins[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch admin profile',
            error: error.message
        });
    }
};

module.exports = {
    loginAdmin,
    getMe
};
