const express = require('express');
const router = express.Router();
const {
    getAllMatches,
    getMatchById,
    createMatch,
    updateMatchStatus,
    addMatchGoal,
    deleteMatchGoal,
    addMatchCard,
    deleteMatchCard
} = require('../controllers/matchesController');
const { verifyAdminToken } = require('../middlewares/authMiddleware');

// Public Match Routes
router.get('/', getAllMatches);
router.get('/:id', getMatchById);

// Admin Protected Routes
router.post('/', verifyAdminToken, createMatch);
router.put('/:id/status', verifyAdminToken, updateMatchStatus);

// Match Events (Goals & Cards)
router.post('/:id/goals', verifyAdminToken, addMatchGoal);
router.delete('/goals/:goal_id', verifyAdminToken, deleteMatchGoal);
router.post('/:id/cards', verifyAdminToken, addMatchCard);
router.delete('/cards/:card_id', verifyAdminToken, deleteMatchCard);

module.exports = router;
