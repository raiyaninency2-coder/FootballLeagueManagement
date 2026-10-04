const pool = require('../config/db');

// GET /api/teams - List all teams
const getAllTeams = async (req, res) => {
    try {
        const { season_id } = req.query;
        let query = `
            SELECT t.*, v.name AS venue_name, v.city AS venue_city, v.capacity,
                   CONCAT(c.first_name, ' ', c.last_name) AS coach_name
            FROM teams t
            LEFT JOIN venues v ON t.venue_id = v.venue_id
            LEFT JOIN coaches c ON t.coach_id = c.coach_id
        `;
        let params = [];

        if (season_id) {
            query += ` JOIN season_teams st ON t.team_id = st.team_id WHERE st.season_id = ?`;
            params.push(season_id);
        }

        query += ` ORDER BY t.name ASC`;

        const [teams] = await pool.query(query, params);
        res.json({ success: true, count: teams.length, data: teams });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch teams', error: error.message });
    }
};

// GET /api/teams/:id - Comprehensive Team Profile
const getTeamById = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Team Core Info
        const [teams] = await pool.query(`
            SELECT t.*, v.name AS venue_name, v.city AS venue_city, v.capacity, v.surface_type,
                   c.coach_id, c.first_name AS coach_first_name, c.last_name AS coach_last_name,
                   c.nationality AS coach_nationality, c.license_level, c.experience_years AS coach_experience
            FROM teams t
            LEFT JOIN venues v ON t.venue_id = v.venue_id
            LEFT JOIN coaches c ON t.coach_id = c.coach_id
            WHERE t.team_id = ?
        `, [id]);

        if (teams.length === 0) {
            return res.status(404).json({ success: false, message: 'Team not found.' });
        }

        const team = teams[0];

        // 2. Active Squad Players (from team_players)
        const [squad] = await pool.query(`
            SELECT p.player_id, p.first_name, p.last_name, p.nationality, p.date_of_birth,
                   p.height_cm, p.preferred_foot, p.photo_url,
                   tp.jersey_number, tp.position, tp.start_date
            FROM team_players tp
            JOIN players p ON tp.player_id = p.player_id
            WHERE tp.team_id = ? AND tp.is_active = TRUE
            ORDER BY 
                CASE tp.position
                    WHEN 'Goalkeeper' THEN 1
                    WHEN 'Defender' THEN 2
                    WHEN 'Midfielder' THEN 3
                    WHEN 'Forward' THEN 4
                    ELSE 5
                END,
                tp.jersey_number ASC
        `, [id]);

        // 3. Recent Matches (Completed)
        const [recentMatches] = await pool.query(`
            SELECT m.*, 
                   ht.name AS home_team_name, ht.short_code AS home_short_code,
                   at.name AS away_team_name, at.short_code AS away_short_code
            FROM matches m
            JOIN teams ht ON m.home_team_id = ht.team_id
            JOIN teams at ON m.away_team_id = at.team_id
            WHERE (m.home_team_id = ? OR m.away_team_id = ?) AND m.status = 'completed'
            ORDER BY m.match_date DESC, m.match_time DESC
            LIMIT 5
        `, [id, id]);

        // 4. Upcoming Fixtures (Scheduled)
        const [upcomingMatches] = await pool.query(`
            SELECT m.*, 
                   ht.name AS home_team_name, ht.short_code AS home_short_code,
                   at.name AS away_team_name, at.short_code AS away_short_code,
                   v.name AS venue_name
            FROM matches m
            JOIN teams ht ON m.home_team_id = ht.team_id
            JOIN teams at ON m.away_team_id = at.team_id
            LEFT JOIN venues v ON m.venue_id = v.venue_id
            WHERE (m.home_team_id = ? OR m.away_team_id = ?) AND m.status = 'scheduled'
            ORDER BY m.match_date ASC, m.match_time ASC
            LIMIT 5
        `, [id, id]);

        res.json({
            success: true,
            data: {
                ...team,
                squad,
                recentMatches,
                upcomingMatches
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch team profile', error: error.message });
    }
};

// POST /api/teams - Create a new team (Admin)
const createTeam = async (req, res) => {
    try {
        const { name, short_code, city, founded_year, venue_id, coach_id, logo_url } = req.body;
        if (!name || !short_code || !city) {
            return res.status(400).json({ success: false, message: 'Name, short_code, and city are required.' });
        }

        const [result] = await pool.query(
            'INSERT INTO teams (name, short_code, city, founded_year, venue_id, coach_id, logo_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, short_code.toUpperCase(), city, founded_year || null, venue_id || null, coach_id || null, logo_url || null]
        );

        res.status(201).json({
            success: true,
            message: 'Team created successfully',
            data: { team_id: result.insertId, name, short_code, city, founded_year, venue_id, coach_id, logo_url }
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'A team with this name or short code already exists.' });
        }
        res.status(500).json({ success: false, message: 'Failed to create team', error: error.message });
    }
};

// PUT /api/teams/:id - Update an existing team (Admin)
const updateTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, short_code, city, founded_year, venue_id, coach_id, logo_url, is_active } = req.body;

        await pool.query(`
            UPDATE teams 
            SET name = COALESCE(?, name),
                short_code = COALESCE(?, short_code),
                city = COALESCE(?, city),
                founded_year = COALESCE(?, founded_year),
                venue_id = ?,
                coach_id = ?,
                logo_url = COALESCE(?, logo_url),
                is_active = COALESCE(?, is_active)
            WHERE team_id = ?
        `, [name, short_code ? short_code.toUpperCase() : null, city, founded_year, venue_id, coach_id, logo_url, is_active, id]);

        res.json({ success: true, message: 'Team updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update team', error: error.message });
    }
};

module.exports = {
    getAllTeams,
    getTeamById,
    createTeam,
    updateTeam
};
