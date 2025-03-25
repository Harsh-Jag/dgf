// controllers/getAllManagerFeedbackController.js
const { getAllManagerFeedback: getManagerFeedbackService } = require('../services/getAllManagerFeedbackService');

const getAllManagerFeedbackController = async (req, res) => {
    try {
        const results = await getManagerFeedbackService();
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ 
            error: 'An error occurred while retrieving manager feedback', 
            details: error.message 
        });
    }
};

module.exports = {
    getAllManagerFeedbackController
};