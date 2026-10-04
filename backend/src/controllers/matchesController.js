const pool = require('../config/db');

// GET /api/matches - List matches with query filters
const getAllMatches = async (req, res) => {
    try {
        const { season_id, status, round_number, team_id } = req.query;
        let query = `
            SELECT m.*,
                   s.season_name,
                   ht.name AS home_team_name, ht.short_code AS home_short_code, ht.logo_url AS home_logo,
                   at.name AS away_team_name, at.short_code AS away_short_code, at.logo_url AS away_logo,
                   v.name AS venue_name, v.city AS venue_city,
                   CONCAT(r.first_name, ' ', r.last_name) AS referee_name
            FROM matches m
            JOIN seasons s ON m.season_id = s.season_id
            JOIN teams ht ON m.home_team_id = ht.team_id
            JOIN teams at ON m.away_team_id = at.team_id
            LEFT JOIN venues v ON m.venue_id = v.venue_id
            LEFT JOIN referees r ON m.referee_id = r.referee_id
            WHERE 1=1
        `;
        let params = [];

        if (season_id) {
            query += ` AND m.season_id = ?`;
            params.push(season_id);
        }
        if (status) {
            query += ` AND m.status = ?`;
            params.push(status);
        }
        if (round_number) {
            query += ` AND m.round_number = ?`;
            params.push(round_number);
        }
        if (team_id) {
            query += ` AND (m.home_team_id = ? OR m.away_team_id = ?)`;
            params.push(team_id, team_id);
        }

        query += ` ORDER BY m.match_date ASC, m.match_time ASC`;

        const [matches] = await pool.query(query, params);
        res.json({ success: true, count: matches.length, data: matches });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch matches', error: error.message });
    }
};

// GET /api/matches/:id - Detailed Match Center (Match info, Lineups, Goals & Cards)
const getMatchById = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Core Match Details
        const [matches] = await pool.query(`
            SELECT m.*,
                   s.season_name, l.name AS league_name,
                   ht.team_id AS home_team_id, ht.name AS home_team_name, ht.short_code AS home_short_code, ht.logo_url AS home_logo,
                   at.team_id AS away_team_id, at.name AS away_team_name, at.short_code AS away_short_code, at.logo_url AS away_logo,
                   v.name AS venue_name, v.city AS venue_city, v.capacity,
                   r.first_name AS ref_first_name, r.last_name AS ref_last_name, r.badge_level AS ref_badge
            FROM matches m
            JOIN seasons s ON m.season_id = s.season_id
            JOIN leagues l ON s.league_id = l.league_id
            JOIN teams ht ON m.home_team_id = ht.team_id
            JOIN teams at ON m.away_team_id = at.team_id
            LEFT JOIN venues v ON m.venue_id = v.venue_id
            LEFT JOIN referees r ON m.referee_id = r.referee_id
            WHERE m.match_id = ?
        `, [id]);

        if (matches.length === 0) {
            return res.status(404).json({ success: false, message: 'Match not found.' });
        }
        const match = matches[0];

        // 2. Goal Events
        const [goals] = await pool.query(`
            SELECT mg.*,
                   CONCAT(p.first_name, ' ', p.last_name) AS scorer_name,
                   CONCAT(ap.first_name, ' ', ap.last_name) AS assist_name,
                   t.name AS credited_team_name, t.short_code AS credited_team_code
            FROM match_goals mg
            JOIN players p ON mg.player_id = p.player_id
            LEFT JOIN players ap ON mg.assist_player_id = ap.player_id
            JOIN teams t ON mg.team_id = t.team_id
            WHERE mg.match_id = ?
            ORDER BY mg.minute ASC
        `, [id]);

        // 3. Card Events
        const [cards] = await pool.query(`
            SELECT mc.*,
                   CONCAT(p.first_name, ' ', p.last_name) AS player_name,
                   t.name AS team_name, t.short_code AS team_code
            FROM match_cards mc
            JOIN players p ON mc.player_id = p.player_id
            JOIN teams t ON mc.team_id = t.team_id
            WHERE mc.match_id = ?
            ORDER BY mc.minute ASC
        `, [id]);

        // 4. Squad players for both teams (eligible for match)
        const [homeSquad] = await pool.query(`
            SELECT p.player_id, p.first_name, p.last_name, tp.jersey_number, tp.position
            FROM team_players tp
            JOIN players p ON tp.player_id = p.player_id
            WHERE tp.team_id = ? AND tp.is_active = TRUE
            ORDER BY tp.jersey_number ASC
        `, [match.home_team_id]);

        const [awaySquad] = await pool.query(`
            SELECT p.player_id, p.first_name, p.last_name, tp.jersey_number, tp.position
            FROM team_players tp
            JOIN players p ON tp.player_id = p.player_id
            WHERE tp.team_id = ? AND tp.is_active = TRUE
            ORDER BY tp.jersey_number ASC
        `, [match.away_team_id]);

        res.json({
            success: true,
            data: {
                ...match,
                goals,
                cards,
                home_squad: homeSquad,
                away_squad: awaySquad
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch match details', error: error.message });
    }
};

// POST /api/matches - Schedule a new match (Admin)
const createMatch = async (req, res) => {
    try {
        const { season_id, home_team_id, away_team_id, venue_id, referee_id, match_date, match_time, round_number } = req.body;
        if (!season_id || !home_team_id || !away_team_id || !match_date || !match_time) {
            return res.status(400).json({ success: false, message: 'season_id, home_team_id, away_team_id, match_date, and match_time are required.' });
        }

        const [result] = await pool.query(`
            INSERT INTO matches (season_id, home_team_id, away_team_id, venue_id, referee_id, match_date, match_time, round_number, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')
        `, [season_id, home_team_id, away_team_id, venue_id || null, referee_id || null, match_date, match_time, round_number || 1]);

        res.status(201).json({
            success: true,
            message: 'Match scheduled successfully',
            data: { match_id: result.insertId }
        });
    } catch (error) {
        // Trigger validation message will be caught here (e.g. if teams aren't registered in season)
        res.status(400).json({ success: false, message: error.message });
    }
};

// PUT /api/matches/:id/status - Update match status (Admin)
const updateMatchStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['scheduled', 'live', 'completed', 'postponed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
        }

        await pool.query('UPDATE matches SET status = ? WHERE match_id = ?', [status, id]);
        res.json({ success: true, message: `Match status updated to ${status}` });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update status', error: error.message });
    }
};

// POST /api/matches/:id/goals - Record a goal event (Admin)
// Database trigger trg_after_goal_insert automatically updates home_team_score and away_team_score!
const addMatchGoal = async (req, res) => {
    try {
        const { id } = req.params; // match_id
        const { team_id, player_id, assist_player_id, minute, goal_type } = req.body;

        if (!team_id || !player_id || !minute) {
            return res.status(400).json({ success: false, message: 'team_id, player_id, and minute are required.' });
        }

        const [result] = await pool.query(`
            INSERT INTO match_goals (match_id, team_id, player_id, assist_player_id, minute, goal_type)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [id, team_id, player_id, assist_player_id || null, minute, goal_type || 'regular']);

        // Return updated match scores
        const [[updatedMatch]] = await pool.query('SELECT home_team_score, away_team_score FROM matches WHERE match_id = ?', [id]);

        res.status(201).json({
            success: true,
            message: 'Goal recorded successfully! Match scoreboard updated automatically.',
            goal_id: result.insertId,
            current_score: updatedMatch
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// DELETE /api/matches/goals/:goal_id - Delete a goal event (Admin)
// Database trigger trg_after_goal_delete automatically recalculates score!
const deleteMatchGoal = async (req, res) => {
    try {
        const { goal_id } = req.params;

        const [[goal]] = await pool.query('SELECT match_id FROM match_goals WHERE goal_id = ?', [goal_id]);
        if (!goal) {
            return res.status(404).json({ success: false, message: 'Goal record not found.' });
        }

        await pool.query('DELETE FROM match_goals WHERE goal_id = ?', [goal_id]);

        const [[updatedMatch]] = await pool.query('SELECT home_team_score, away_team_score FROM matches WHERE match_id = ?', [goal.match_id]);

        res.json({
            success: true,
            message: 'Goal deleted and match score recalculated.',
            current_score: updatedMatch
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete goal', error: error.message });
    }
};

// POST /api/matches/:id/cards - Record a card event (Admin)
const addMatchCard = async (req, res) => {
    try {
        const { id } = req.params;
        const { team_id, player_id, minute, card_type, reason } = req.body;

        if (!team_id || !player_id || !minute || !card_type) {
            return res.status(400).json({ success: false, message: 'team_id, player_id, minute, and card_type are required.' });
        }

        const [result] = await pool.query(`
            INSERT INTO match_cards (match_id, team_id, player_id, minute, card_type, reason)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [id, team_id, player_id, minute, card_type, reason || null]);

        res.status(201).json({
            success: true,
            message: 'Card event recorded successfully.',
            card_id: result.insertId
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// DELETE /api/matches/cards/:card_id - Delete card event (Admin)
const deleteMatchCard = async (req, res) => {
    try {
        const { card_id } = req.params;
        await pool.query('DELETE FROM match_cards WHERE card_id = ?', [card_id]);
        res.json({ success: true, message: 'Card record deleted.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete card', error: error.message });
    }
};

module.exports = {
    getAllMatches,
    getMatchById,
    createMatch,
    updateMatchStatus,
    addMatchGoal,
    deleteMatchGoal,
    addMatchCard,
    deleteMatchCard
};
