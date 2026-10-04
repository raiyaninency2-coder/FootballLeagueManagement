const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const publicRoutes = require('./routes/publicRoutes');
const leagueRoutes = require('./routes/leagueRoutes');
const teamRoutes = require('./routes/teamRoutes');
const playerRoutes = require('./routes/playerRoutes');
const matchRoutes = require('./routes/matchRoutes');
const officialsRoutes = require('./routes/officialsRoutes');

dotenv.config();

// Ensure default superadmin has an exact bcrypt hash
async function ensureDefaultAdmin() {
    try {
        const hashedPassword = await bcrypt.hash('AdminPassword123!', 10);
        await pool.query(`
            INSERT INTO admins (admin_id, username, email, password_hash, full_name, role)
            VALUES (1, 'superadmin', 'admin@football-league.com', ?, 'League Commissioner', 'superadmin')
            ON DUPLICATE KEY UPDATE password_hash = ?;
        `, [hashedPassword, hashedPassword]);
        console.log('🔑 Default admin credentials verified (superadmin / AdminPassword123!)');
    } catch (err) {
        console.error('Admin sync notice:', err.message);
    }
}


const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api', leagueRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api', officialsRoutes);

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        message: '⚽ Football League Management System API is running!',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Database connectivity test endpoint
app.get('/api/test-db', async (req, res) => {
    try {
        // Query to count teams from the database
        const [teams] = await pool.query('SELECT COUNT(*) AS total_teams FROM teams');
        const [standings] = await pool.query('SELECT * FROM vw_season_standings LIMIT 4');

        res.json({
            success: true,
            message: 'Database is connected and functioning properly!',
            total_teams: teams[0].total_teams,
            preview_standings: standings
        });
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to query database',
            error: error.message
        });
    }
});

// Start Express Server
app.listen(PORT, async () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    await ensureDefaultAdmin();
});
