const express = require('express');
const router = express.Router();
const {
    getAllTeams,
    getTeamById,
    createTeam,
    updateTeam
} = require('../controllers/teamsController');
const { verifyAdminToken } = require('../middlewares/authMiddleware');

// Public Team Routes
router.get('/', getAllTeams);
router.get('/:id', getTeamById);

// Admin Protected Routes
router.post('/', verifyAdminToken, createTeam);
router.put('/:id', verifyAdminToken, updateTeam);

module.exports = router;
