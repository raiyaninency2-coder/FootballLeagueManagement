const pool = require('../config/db');

// GET /api/leagues - Get all leagues
const getAllLeagues = async (req, res) => {
    try {
        const [leagues] = await pool.query('SELECT * FROM leagues ORDER BY name ASC');
        res.json({ success: true, count: leagues.length, data: leagues });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch leagues', error: error.message });
    }
};

// GET /api/leagues/:id - Get league details with its seasons
const getLeagueById = async (req, res) => {
    try {
        const { id } = req.params;
        const [leagues] = await pool.query('SELECT * FROM leagues WHERE league_id = ?', [id]);
        if (leagues.length === 0) {
            return res.status(404).json({ success: false, message: 'League not found' });
        }

        const [seasons] = await pool.query('SELECT * FROM seasons WHERE league_id = ? ORDER BY start_date DESC', [id]);

        res.json({
            success: true,
            data: {
                ...leagues[0],
                seasons
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch league', error: error.message });
    }
};

// POST /api/leagues - Create a new league (Admin)
const createLeague = async (req, res) => {
    try {
        const { name, country, logo_url, description } = req.body;
        if (!name || !country) {
            return res.status(400).json({ success: false, message: 'Name and country are required.' });
        }

        const [result] = await pool.query(
            'INSERT INTO leagues (name, country, logo_url, description) VALUES (?, ?, ?, ?)',
            [name, country, logo_url || null, description || null]
        );

        res.status(201).json({
            success: true,
            message: 'League created successfully',
            data: { league_id: result.insertId, name, country, logo_url, description }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create league', error: error.message });
    }
};

// GET /api/seasons - Get all seasons with league name
const getAllSeasons = async (req, res) => {
    try {
        const [seasons] = await pool.query(`
            SELECT s.*, l.name AS league_name, l.country 
            FROM seasons s
            JOIN leagues l ON s.league_id = l.league_id
            ORDER BY s.start_date DESC
        `);
        res.json({ success: true, count: seasons.length, data: seasons });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch seasons', error: error.message });
    }
};

// GET /api/seasons/:id/standings - Get standings table for a specific season
const getSeasonStandings = async (req, res) => {
    try {
        const { id } = req.params;
        const [standings] = await pool.query(
            'SELECT * FROM vw_season_standings WHERE season_id = ? ORDER BY points DESC, goal_difference DESC, goals_for DESC, team_name ASC',
            [id]
        );
        res.json({ success: true, count: standings.length, data: standings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch standings', error: error.message });
    }
};

// POST /api/seasons - Create a new season (Admin)
const createSeason = async (req, res) => {
    try {
        const { league_id, season_name, start_date, end_date, status } = req.body;
        if (!league_id || !season_name || !start_date || !end_date) {
            return res.status(400).json({ success: false, message: 'league_id, season_name, start_date, and end_date are required.' });
        }

        const [result] = await pool.query(
            'INSERT INTO seasons (league_id, season_name, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)',
            [league_id, season_name, start_date, end_date, status || 'upcoming']
        );

        res.status(201).json({
            success: true,
            message: 'Season created successfully',
            data: { season_id: result.insertId, league_id, season_name, start_date, end_date, status: status || 'upcoming' }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create season', error: error.message });
    }
};

// POST /api/seasons/:id/register-team - Register a team to a season (Admin)
const registerTeamToSeason = async (req, res) => {
    try {
        const { id } = req.params; // season_id
        const { team_id } = req.body;

        if (!team_id) {
            return res.status(400).json({ success: false, message: 'team_id is required.' });
        }

        await pool.query(
            'INSERT INTO season_teams (season_id, team_id) VALUES (?, ?)',
            [id, team_id]
        );

        res.status(201).json({
            success: true,
            message: 'Team successfully registered in season.'
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Team is already registered in this season.' });
        }
        res.status(500).json({ success: false, message: 'Failed to register team to season', error: error.message });
    }
};

module.exports = {
    getAllLeagues,
    getLeagueById,
    createLeague,
    getAllSeasons,
    getSeasonStandings,
    createSeason,
    registerTeamToSeason
};
