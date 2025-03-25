// routes/getAllManagerFeedbackRoutes.js
const express = require('express');
const router = express.Router();
const { getAllManagerFeedbackController } = require('../controllers/getAllManagerFeedbackController');

router.get('/', getAllManagerFeedbackController);

module.exports = router;