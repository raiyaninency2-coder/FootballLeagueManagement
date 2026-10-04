const jwt = require('jsonwebtoken');

// Middleware to verify JWT token for protected admin routes
const verifyAdminToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        
        // Check if authorization header exists and starts with "Bearer "
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access Denied: No token provided or invalid format (Bearer token required).'
            });
        }

        // Extract token
        const token = authHeader.split(' ')[1];

        // Verify token with secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_football_league_2025');

        // Attach decoded admin info to request object
        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired token. Please log in again.',
            error: error.message
        });
    }
};

module.exports = { verifyAdminToken };
