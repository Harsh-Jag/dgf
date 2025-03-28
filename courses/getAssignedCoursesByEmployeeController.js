// controllers/getAssignedCoursesByEmployeeController.js
const { getAssignedCoursesByEmployee } = require('../services/getAssignedCoursesByEmployeeService');

const getAssignedCoursesByEmployeeHandler = async (req, res) => {
    const { emp_id } = req.params;

    if (!emp_id) {
        return res.status(400).json({ message: 'emp_id is a required parameter' });
    }

    try {
        const assignedCourses = await getAssignedCoursesByEmployee(emp_id);
        
        if (assignedCourses.length === 0) {
            return res.status(404).json({ message: 'No courses found for this employee' });
        }
        
        res.status(200).json({ data: assignedCourses });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
};

module.exports = {
    getAssignedCoursesByEmployeeHandler,
};