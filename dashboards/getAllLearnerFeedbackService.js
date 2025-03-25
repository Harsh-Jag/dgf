// services/getAllLearnerFeedbackService.js
const db = require('../config/db');

const getAllLearnerFeedback = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                lf.*,
                e.emp_name,
                e.emp_email
            FROM learner_feedback lf
            LEFT JOIN employee e ON lf.employee_id = e.emp_id;
        `;
        
        db.query(query, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

module.exports = {
    getAllLearnerFeedback
};