const pool = require('../config/db');

// --- COACHES ---
const getAllCoaches = async (req, res) => {
    try {
        const [coaches] = await pool.query(`
            SELECT c.*, t.team_id, t.name AS current_team_name, t.logo_url AS team_logo
            FROM coaches c
            LEFT JOIN teams t ON c.coach_id = t.coach_id
            ORDER BY c.first_name ASC
        `);
        res.json({ success: true, count: coaches.length, data: coaches });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch coaches', error: error.message });
    }
};

const getCoachById = async (req, res) => {
    try {
        const { id } = req.params;
        const [coaches] = await pool.query(`
            SELECT c.*, t.team_id, t.name AS current_team_name, t.logo_url AS team_logo
            FROM coaches c
            LEFT JOIN teams t ON c.coach_id = t.coach_id
            WHERE c.coach_id = ?
        `, [id]);

        if (coaches.length === 0) {
            return res.status(404).json({ success: false, message: 'Coach not found' });
        }
        res.json({ success: true, data: coaches[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch coach', error: error.message });
    }
};

const createCoach = async (req, res) => {
    try {
        const { first_name, last_name, nationality, date_of_birth, license_level, experience_years, photo_url } = req.body;
        if (!first_name || !last_name || !nationality) {
            return res.status(400).json({ success: false, message: 'First name, last name, and nationality are required.' });
        }

        const [result] = await pool.query(
            'INSERT INTO coaches (first_name, last_name, nationality, date_of_birth, license_level, experience_years, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [first_name, last_name, nationality, date_of_birth || null, license_level || 'UEFA Pro', experience_years || 0, photo_url || null]
        );

        res.status(201).json({ success: true, message: 'Coach added successfully', data: { coach_id: result.insertId } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to add coach', error: error.message });
    }
};

// --- REFEREES ---
const getAllReferees = async (req, res) => {
    try {
        const [referees] = await pool.query(`
            SELECT r.*, COUNT(m.match_id) AS total_matches_officiated
            FROM referees r
            LEFT JOIN matches m ON r.referee_id = m.referee_id
            GROUP BY r.referee_id
            ORDER BY r.first_name ASC
        `);
        res.json({ success: true, count: referees.length, data: referees });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch referees', error: error.message });
    }
};

const getRefereeById = async (req, res) => {
    try {
        const { id } = req.params;
        const [referees] = await pool.query('SELECT * FROM referees WHERE referee_id = ?', [id]);
        if (referees.length === 0) {
            return res.status(404).json({ success: false, message: 'Referee not found' });
        }

        const [matches] = await pool.query(`
            SELECT m.*, ht.name AS home_team_name, at.name AS away_team_name
            FROM matches m
            JOIN teams ht ON m.home_team_id = ht.team_id
            JOIN teams at ON m.away_team_id = at.team_id
            WHERE m.referee_id = ?
            ORDER BY m.match_date DESC
        `, [id]);

        res.json({ success: true, data: { ...referees[0], matches } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch referee', error: error.message });
    }
};

const createReferee = async (req, res) => {
    try {
        const { first_name, last_name, nationality, date_of_birth, badge_level, experience_years, photo_url } = req.body;
        if (!first_name || !last_name || !nationality) {
            return res.status(400).json({ success: false, message: 'First name, last name, and nationality are required.' });
        }

        const [result] = await pool.query(
            'INSERT INTO referees (first_name, last_name, nationality, date_of_birth, badge_level, experience_years, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [first_name, last_name, nationality, date_of_birth || null, badge_level || 'National', experience_years || 0, photo_url || null]
        );

        res.status(201).json({ success: true, message: 'Referee added successfully', data: { referee_id: result.insertId } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to add referee', error: error.message });
    }
};

// --- VENUES ---
const getAllVenues = async (req, res) => {
    try {
        const [venues] = await pool.query(`
            SELECT v.*, t.name AS tenant_team_name
            FROM venues v
            LEFT JOIN teams t ON v.venue_id = t.venue_id
            ORDER BY v.name ASC
        `);
        res.json({ success: true, count: venues.length, data: venues });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch venues', error: error.message });
    }
};

const getVenueById = async (req, res) => {
    try {
        const { id } = req.params;
        const [venues] = await pool.query('SELECT * FROM venues WHERE venue_id = ?', [id]);
        if (venues.length === 0) {
            return res.status(404).json({ success: false, message: 'Venue not found' });
        }
        res.json({ success: true, data: venues[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch venue', error: error.message });
    }
};

const createVenue = async (req, res) => {
    try {
        const { name, city, capacity, surface_type, image_url } = req.body;
        if (!name || !city || !capacity) {
            return res.status(400).json({ success: false, message: 'Name, city, and capacity are required.' });
        }

        const [result] = await pool.query(
            'INSERT INTO venues (name, city, capacity, surface_type, image_url) VALUES (?, ?, ?, ?, ?)',
            [name, city, capacity, surface_type || 'Natural Grass', image_url || null]
        );

        res.status(201).json({ success: true, message: 'Venue added successfully', data: { venue_id: result.insertId } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to add venue', error: error.message });
    }
};

module.exports = {
    getAllCoaches,
    getCoachById,
    createCoach,
    getAllReferees,
    getRefereeById,
    createReferee,
    getAllVenues,
    getVenueById,
    createVenue
};
