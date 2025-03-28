// routes/assignedCoursesByEmployeeRoutes.js
const express = require('express');
const router = express.Router();
const { getAssignedCoursesByEmployeeHandler } = require('../controllers/getAssignedCoursesByEmployeeController');

router.get('/:emp_id', getAssignedCoursesByEmployeeHandler);

module.exports = router;