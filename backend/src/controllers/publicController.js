const pool = require('../config/db');

// GET /api/public/home-summary - Homepage statistics & widgets
const getHomeSummary = async (req, res) => {
    try {
        // Quick counts with safe fallback
        const [teamsRes] = await pool.query('SELECT COUNT(*) AS total FROM teams WHERE is_active = TRUE');
        const [playersRes] = await pool.query('SELECT COUNT(*) AS total FROM players');
        const [matchesRes] = await pool.query('SELECT COUNT(*) AS total FROM matches');
        const [goalsRes] = await pool.query('SELECT COUNT(*) AS total FROM match_goals');

        const total_teams = teamsRes[0]?.total || 0;
        const total_players = playersRes[0]?.total || 0;
        const total_matches = matchesRes[0]?.total || 0;
        const total_goals = goalsRes[0]?.total || 0;

        // Top 5 Standings for current active season
        const [topStandings] = await pool.query(`
            SELECT * FROM vw_season_standings 
            ORDER BY points DESC, goal_difference DESC, goals_for DESC 
            LIMIT 5
        `);

        // Next 3 Upcoming Fixtures
        const [upcomingMatches] = await pool.query(`
            SELECT 
                m.match_id, m.match_date, m.match_time, m.round_number, m.status,
                ht.team_id AS home_team_id, ht.name AS home_team_name, ht.short_code AS home_short_code, ht.logo_url AS home_logo,
                at.team_id AS away_team_id, at.name AS away_team_name, at.short_code AS away_short_code, at.logo_url AS away_logo,
                v.name AS venue_name, v.city AS venue_city
            FROM matches m
            JOIN teams ht ON m.home_team_id = ht.team_id
            JOIN teams at ON m.away_team_id = at.team_id
            LEFT JOIN venues v ON m.venue_id = v.venue_id
            WHERE m.status = 'scheduled'
            ORDER BY m.match_date ASC, m.match_time ASC
            LIMIT 3
        `);

        // Latest 3 Recent Results
        const [recentResults] = await pool.query(`
            SELECT 
                m.match_id, m.match_date, m.match_time, m.round_number, m.status,
                m.home_team_score, m.away_team_score,
                ht.team_id AS home_team_id, ht.name AS home_team_name, ht.short_code AS home_short_code, ht.logo_url AS home_logo,
                at.team_id AS away_team_id, at.name AS away_team_name, at.short_code AS away_short_code, at.logo_url AS away_logo,
                v.name AS venue_name
            FROM matches m
            JOIN teams ht ON m.home_team_id = ht.team_id
            JOIN teams at ON m.away_team_id = at.team_id
            LEFT JOIN venues v ON m.venue_id = v.venue_id
            WHERE m.status = 'completed'
            ORDER BY m.match_date DESC, m.match_time DESC
            LIMIT 3
        `);

        res.json({
            success: true,
            stats: {
                total_teams,
                total_players,
                total_matches,
                total_goals
            },
            topStandings: topStandings || [],
            upcomingMatches: upcomingMatches || [],
            recentResults: recentResults || []
        });
    } catch (error) {
        console.error('Home summary error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch homepage summary', error: error.message });
    }
};

module.exports = { getHomeSummary };
