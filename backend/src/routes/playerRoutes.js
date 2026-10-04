const express = require('express');
const router = express.Router();
const {
    getAllPlayers,
    getPlayerById,
    createPlayer,
    assignPlayerTeam
} = require('../controllers/playersController');
const { verifyAdminToken } = require('../middlewares/authMiddleware');

// Public Player Routes
router.get('/', getAllPlayers);
router.get('/:id', getPlayerById);

// Admin Protected Routes
router.post('/', verifyAdminToken, createPlayer);
router.post('/assign-team', verifyAdminToken, assignPlayerTeam);

module.exports = router;
