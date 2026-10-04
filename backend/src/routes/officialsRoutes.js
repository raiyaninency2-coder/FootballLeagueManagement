const express = require('express');
const router = express.Router();
const {
    getAllCoaches,
    getCoachById,
    createCoach,
    getAllReferees,
    getRefereeById,
    createReferee,
    getAllVenues,
    getVenueById,
    createVenue
} = require('../controllers/officialsController');
const { verifyAdminToken } = require('../middlewares/authMiddleware');

// Coaches
router.get('/coaches', getAllCoaches);
router.get('/coaches/:id', getCoachById);
router.post('/coaches', verifyAdminToken, createCoach);

// Referees
router.get('/referees', getAllReferees);
router.get('/referees/:id', getRefereeById);
router.post('/referees', verifyAdminToken, createReferee);

// Venues
router.get('/venues', getAllVenues);
router.get('/venues/:id', getVenueById);
router.post('/venues', verifyAdminToken, createVenue);

module.exports = router;
