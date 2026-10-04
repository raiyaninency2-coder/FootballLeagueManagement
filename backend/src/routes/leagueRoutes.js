const express = require('express');
const router = express.Router();
const {
    getAllLeagues,
    getLeagueById,
    createLeague,
    getAllSeasons,
    getSeasonStandings,
    createSeason,
    registerTeamToSeason
} = require('../controllers/leaguesController');
const { verifyAdminToken } = require('../middlewares/authMiddleware');

// Public League Routes
router.get('/leagues', getAllLeagues);
router.get('/leagues/:id', getLeagueById);
router.get('/seasons', getAllSeasons);
router.get('/seasons/:id/standings', getSeasonStandings);

// Admin Protected Routes
router.post('/leagues', verifyAdminToken, createLeague);
router.post('/seasons', verifyAdminToken, createSeason);
router.post('/seasons/:id/register-team', verifyAdminToken, registerTeamToSeason);

module.exports = router;
