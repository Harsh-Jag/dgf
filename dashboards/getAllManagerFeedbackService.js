// services/getAllManagerFeedbackService.js
const db = require('../config/db');

const getAllManagerFeedback = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                mf.*,
                e.emp_name,
                e.emp_email
            FROM manager_feedback mf
            LEFT JOIN employee e ON mf.employee_id = e.emp_id;
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
    getAllManagerFeedback
};