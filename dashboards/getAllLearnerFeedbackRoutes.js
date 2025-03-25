// routes/getAllLearnerFeedbackRoutes.js
const express = require('express');
const router = express.Router();
const { getAllFeedback } = require('../controllers/getAllLearnerFeedbackController');

router.get('/', getAllFeedback);

module.exports = router;