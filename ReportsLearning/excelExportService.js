const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const connection = require('../config/db');

const exportToExcel = (fromDate, toDate, status, callback) => {
  // Build status filter clause
  let statusFilter = '';
  if (status && status !== 'all') {
    statusFilter = `AND ac.status = '${status}'`;
  }

  const query = `
    SELECT 
      nt.requestid AS 'Request ID',
      pn.ProjectName AS 'Project Name',
      emp.emp_name AS 'Employee Name',
      emp.emp_email AS 'Employee Email',
      ac.status AS 'Course Status',
      ac.learning_type AS 'Skill Type',
      DATE_FORMAT(ac.assigned_date, '%Y-%m-%d') AS 'Assigned Date',
      DATE_FORMAT(nt.expecteddeadline, '%Y-%m-%d') AS 'Expected Completion',
      DATE_FORMAT(ac.completion_date, '%Y-%m-%d') AS 'Actual Completion',
      ac.progress AS 'Progress',
      ct.type_name AS 'Course Type',
      sd.service_name AS 'Service Division',
      CASE 
        WHEN nt.newprospectname IS NOT NULL THEN 'Y' 
        ELSE 'N' 
      END AS 'New Prospect',
      nt.newprospectname AS 'Prospect Name',
      req_emp.emp_name AS 'Requested By',
      assigned_to_emp.emp_name AS 'Assigned To',
      emp_mentor.emp_name AS 'Mentor',
      c.duration_hours AS 'Duration (hrs)',
      CASE 
        WHEN nt.learningtype = 1 THEN 'Y'
        ELSE 'N'
      END AS 'Effectiveness Initiated'
    FROM newtrainingrequest nt
    JOIN assigned_courses ac ON nt.requestid = ac.requestid
    JOIN employee emp ON ac.employee_id = emp.emp_id
    JOIN employee emp_mentor ON ac.mentor_id = emp_mentor.emp_id
    JOIN employee req_emp ON nt.requestedbyid = req_emp.emp_id
    JOIN employee assigned_to_emp ON nt.requestedbyid = assigned_to_emp.emp_id
    JOIN course c ON ac.course_id = c.course_id
    JOIN course_type ct ON ac.coursetype_id = ct.type_id
    JOIN projectname pn ON nt.projectid = pn.projectid
    JOIN service_division sd ON nt.service_division = sd.id
    WHERE DATE(ac.assigned_date) BETWEEN ? AND ?
    ${statusFilter}
    ORDER BY ac.assigned_date DESC;
  `;

  connection.query(query, [fromDate, toDate], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return callback(err);
    }

    if (results.length === 0) {
      return callback(new Error('No data found for the selected filters'));
    }

    try {
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(results);

      // Add styling to header row
      const headerRange = XLSX.utils.decode_range(ws['!ref']);
      for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!ws[cellAddress]) continue;
        
        ws[cellAddress].s = {
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '2C3E50' } },
          alignment: { horizontal: 'center' }
        };
      }

      // Set column widths
      ws['!cols'] = [
        { wch: 10 }, { wch: 20 }, { wch: 20 }, { wch: 25 },
        { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
        { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 20 },
        { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 20 },
        { wch: 15 }, { wch: 20 }
      ];

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Training Report');

      // Create reports directory if it doesn't exist
      const dir = path.join(__dirname, '../reports');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }

      // Generate file path
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filePath = path.join(dir, `training_report_${timestamp}.xlsx`);

      // Write file
      XLSX.writeFile(wb, filePath);

      callback(null, { 
        filePath,
        data: results,
        statusFilter: status,
        dateRange: `${fromDate} to ${toDate}`
      });
    } catch (error) {
      console.error('Excel generation error:', error);
      callback(error);
    }
  });
};

module.exports = { exportToExcel };