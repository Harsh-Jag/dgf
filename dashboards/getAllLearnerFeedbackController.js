// controllers/getAllLearnerFeedbackController.js
const { getAllLearnerFeedback } = require('../services/getAllLearnerFeedbackService');

const getAllFeedback = async (req, res) => {
    try {
        const results = await getAllLearnerFeedback();
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ 
            error: 'An error occurred while retrieving learner feedback', 
            details: error.message 
        });
    }
};

module.exports = {
    getAllFeedback
};