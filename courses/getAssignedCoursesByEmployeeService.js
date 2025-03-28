// services/getAssignedCoursesByEmployeeService.js
const db = require('../config/db');

const getAssignedCoursesByEmployee = async (emp_id) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                ac.*,
                e1.emp_name AS employee_name,
                e1.emp_email AS employee_email,
                e2.emp_name AS mentor_name,
                e2.emp_email AS mentor_email,
                c.course_name,
                c.course_description,
                ct.type_name AS coursetype_name,
                ct.type_description AS coursetype_description
            FROM assigned_courses ac
            JOIN employee e1 ON ac.employee_id = e1.emp_id
            JOIN employee e2 ON ac.mentor_id = e2.emp_id
            JOIN course c ON ac.course_id = c.course_id
            JOIN course_type ct ON ac.coursetype_id = ct.type_id
            WHERE ac.employee_id = ?;
        `;

        db.execute(query, [emp_id], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

module.exports = {
    getAssignedCoursesByEmployee,
};