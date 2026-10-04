const pool = require('../config/db');

// GET /api/players - List all players with their current club & jersey number
const getAllPlayers = async (req, res) => {
    try {
        const { team_id, position } = req.query;
        let query = `
            SELECT p.*, tp.jersey_number, tp.position, t.team_id, t.name AS current_team_name, t.logo_url AS team_logo
            FROM players p
            LEFT JOIN team_players tp ON p.player_id = tp.player_id AND tp.is_active = TRUE
            LEFT JOIN teams t ON tp.team_id = t.team_id
            WHERE 1=1
        `;
        let params = [];

        if (team_id) {
            query += ` AND tp.team_id = ?`;
            params.push(team_id);
        }

        if (position) {
            query += ` AND tp.position = ?`;
            params.push(position);
        }

        query += ` ORDER BY p.first_name ASC, p.last_name ASC`;

        const [players] = await pool.query(query, params);
        res.json({ success: true, count: players.length, data: players });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch players', error: error.message });
    }
};

// GET /api/players/:id - Comprehensive Player Profile with Transfer History & Match Stats
const getPlayerById = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Permanent Player Bio
        const [players] = await pool.query('SELECT * FROM players WHERE player_id = ?', [id]);
        if (players.length === 0) {
            return res.status(404).json({ success: false, message: 'Player not found.' });
        }
        const player = players[0];

        // 2. Current Active Club Info
        const [currentClub] = await pool.query(`
            SELECT tp.*, t.name AS team_name, t.short_code, t.logo_url
            FROM team_players tp
            JOIN teams t ON tp.team_id = t.team_id
            WHERE tp.player_id = ? AND tp.is_active = TRUE
            LIMIT 1
        `, [id]);

        // 3. Complete Transfer & Club Membership History
        const [careerHistory] = await pool.query(`
            SELECT tp.*, t.name AS team_name, t.short_code, t.logo_url
            FROM team_players tp
            JOIN teams t ON tp.team_id = t.team_id
            WHERE tp.player_id = ?
            ORDER BY tp.start_date DESC
        `, [id]);

        // 4. Goal Statistics
        const [goals] = await pool.query(`
            SELECT mg.*, m.match_date, t.name AS credited_team_name,
                   opp.name AS opponent_team_name
            FROM match_goals mg
            JOIN matches m ON mg.match_id = m.match_id
            JOIN teams t ON mg.team_id = t.team_id
            JOIN teams opp ON (opp.team_id = m.home_team_id OR opp.team_id = m.away_team_id) AND opp.team_id <> mg.team_id
            WHERE mg.player_id = ?
            ORDER BY m.match_date DESC
        `, [id]);

        // 5. Card Statistics
        const [cards] = await pool.query(`
            SELECT mc.*, m.match_date, t.name AS team_name
            FROM match_cards mc
            JOIN matches m ON mc.match_id = m.match_id
            JOIN teams t ON mc.team_id = t.team_id
            WHERE mc.player_id = ?
            ORDER BY m.match_date DESC
        `, [id]);

        res.json({
            success: true,
            data: {
                ...player,
                current_club: currentClub[0] || null,
                career_history: careerHistory,
                stats: {
                    total_goals: goals.length,
                    total_yellow_cards: cards.filter(c => c.card_type === 'yellow' || c.card_type === 'second_yellow').length,
                    total_red_cards: cards.filter(c => c.card_type === 'red').length
                },
                goals,
                cards
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch player profile', error: error.message });
    }
};

// POST /api/players - Create a new player bio (Admin)
const createPlayer = async (req, res) => {
    try {
        const { first_name, last_name, nationality, date_of_birth, height_cm, weight_kg, preferred_foot, photo_url } = req.body;
        if (!first_name || !last_name || !nationality || !date_of_birth) {
            return res.status(400).json({ success: false, message: 'First name, last name, nationality, and DOB are required.' });
        }

        const [result] = await pool.query(
            'INSERT INTO players (first_name, last_name, nationality, date_of_birth, height_cm, weight_kg, preferred_foot, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [first_name, last_name, nationality, date_of_birth, height_cm || null, weight_kg || null, preferred_foot || 'Right', photo_url || null]
        );

        res.status(201).json({
            success: true,
            message: 'Player created successfully',
            data: { player_id: result.insertId, first_name, last_name, nationality, date_of_birth }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create player', error: error.message });
    }
};

// POST /api/players/assign-team - Transfer or assign player to club (Admin)
const assignPlayerTeam = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { player_id, team_id, jersey_number, position, start_date } = req.body;
        if (!player_id || !team_id || !jersey_number || !position || !start_date) {
            return res.status(400).json({ success: false, message: 'player_id, team_id, jersey_number, position, and start_date are required.' });
        }

        // Close any prior active membership for this player
        await connection.query(`
            UPDATE team_players 
            SET is_active = FALSE, end_date = ?
            WHERE player_id = ? AND is_active = TRUE
        `, [start_date, player_id]);

        // Insert new active membership
        await connection.query(`
            INSERT INTO team_players (team_id, player_id, jersey_number, position, start_date, end_date, is_active)
            VALUES (?, ?, ?, ?, ?, NULL, TRUE)
        `, [team_id, player_id, jersey_number, position, start_date]);

        await connection.commit();
        res.status(201).json({ success: true, message: 'Player successfully assigned/transferred to club!' });
    } catch (error) {
        await connection.rollback();
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Jersey number is already taken by an active player in this club!' });
        }
        res.status(500).json({ success: false, message: 'Transfer failed', error: error.message });
    } finally {
        connection.release();
    }
};

module.exports = {
    getAllPlayers,
    getPlayerById,
    createPlayer,
    assignPlayerTeam
};
