const express = require('express');
const router = express.Router();
const { getHomeSummary } = require('../controllers/publicController');

router.get('/home-summary', getHomeSummary);

module.exports = router;
