//excelExportService.js

const XLSX = require("xlsx")
const fs = require("fs")
const path = require("path")
const connection = require("../config/db")

const buildQuery = (fromDate, toDate, status) => {
  let statusFilter = ""
  const currentDate = new Date().toISOString().split("T")[0]

  if (status && status !== "all") {
    if (status === "Completed") {
      // Include both 'Completed' and 'Completed with Delay' when Completed is selected
      statusFilter = `AND (ac.status = 'Completed' OR ac.status = 'Completed with Delay')`
    } else if (status === "Overdue") {
      // Over Due/Past Due: Expected Learning Completion Date is past but status is still Learning Initiated
      statusFilter = `AND ac.status = 'Learning Initiated' AND ac.completion_date < '${currentDate}'`
    } else if (status === "DueForCompletion") {
      // Due for completion: Expected Learning Completion Date is within a week from present
      statusFilter = `AND ac.status = 'Learning Initiated' AND ac.completion_date BETWEEN '${currentDate}' AND DATE_ADD('${currentDate}', INTERVAL 7 DAY)`
    } else if (status === "Rejected") {
      // Special case for Rejected status - handled differently below
      statusFilter = `AND ntr.requeststatus = 'rejected'`
    } else {
      statusFilter = `AND ac.status = '${status}'`
    }
  }

  // Special case for Rejected status or when "all" is selected (to include rejected)
  if (status === "Rejected" || status === "all") {
    const rejectedQuery = `
      SELECT 
        entr.requestid AS 'Request ID',
        pn.ProjectName AS 'Project Name',
        CASE 
            WHEN ntr.newprospectname IS NOT NULL THEN 'Y' 
            ELSE 'N' 
        END AS 'New Prospect (Y/N)',
        COALESCE(ntr.newprospectname, '') AS 'Prospect Name',
        '' AS 'Course Name',
        e.emp_name AS 'Employee Name',
        e.emp_email AS 'Employee Mail Id',
        e.Designation_Name AS 'Employee Designation',
        'Rejected' AS 'Course Status',
        ntr.comments AS 'Comments',
        entr.status AS 'User Status',
        '' AS 'Skill Type',
        '' AS 'Assigned Date',
        DATE_FORMAT(ntr.expecteddeadline, '%Y-%m-%d') AS 'Expected Learning Completion Date',
        '' AS 'Actual Learning Completion Date',
        0 AS 'Progress',
        created_by_emp.emp_name AS 'Request Created By',
        assigned_to_emp.emp_name AS 'Request Assigned To',
        '' AS 'Course Assigned By',
        0 AS 'Training Duration',
        '' AS 'Faculty/Mentor Name',
        '' AS 'Faculty/Mentor Mail Id',
        '' AS 'Faculty/Mentor Designation',
        '' AS 'Course Type',
        'N' AS 'Effectiveness Initiated (Y/N)',
        sd.service_name AS 'Service Division (Tech/Content)'
      FROM 
        emp_newtrainingrequested entr
      INNER JOIN 
        newtrainingrequest ntr ON entr.requestid = ntr.requestid
      LEFT JOIN 
        projectname pn ON ntr.projectid = pn.ProjectID
      INNER JOIN 
        employee e ON entr.emp_id = e.emp_id
      LEFT JOIN 
        service_division sd ON ntr.service_division = sd.id
      LEFT JOIN 
        employee created_by_emp ON ntr.requestedbyid = created_by_emp.emp_id
      LEFT JOIN 
        employee assigned_to_emp ON ntr.AssignedTo = assigned_to_emp.emp_id
      WHERE ntr.requeststatus = 'rejected'
      AND DATE(ntr.expecteddeadline) BETWEEN ? AND ?
    `

    if (status === "Rejected") {
      return rejectedQuery + ` ORDER BY ntr.expecteddeadline DESC;`
    }

    // For 'all', we'll combine both queries with UNION
    const regularQuery = `
      SELECT 
        entr.requestid AS 'Request ID',
        pn.ProjectName AS 'Project Name',
        CASE 
            WHEN ntr.newprospectname IS NOT NULL THEN 'Y' 
            ELSE 'N' 
        END AS 'New Prospect (Y/N)',
        COALESCE(ntr.newprospectname, '') AS 'Prospect Name',
        c.course_name AS 'Course Name',
        e.emp_name AS 'Employee Name',
        e.emp_email AS 'Employee Mail Id',
        e.Designation_Name AS 'Employee Designation',
        ac.status AS 'Course Status',
        ac.comments AS 'Comments',
        entr.status AS 'User Status',
        ac.learning_type AS 'Skill Type',
        DATE_FORMAT(ac.assigned_date, '%Y-%m-%d') AS 'Assigned Date',
        DATE_FORMAT(ac.completion_date, '%Y-%m-%d') AS 'Expected Learning Completion Date',
        DATE_FORMAT(ac.status_modified_date, '%Y-%m-%d') AS 'Actual Learning Completion Date',
        ac.progress AS 'Progress',
        created_by_emp.emp_name AS 'Request Created By',
        assigned_to_emp.emp_name AS 'Request Assigned To',
        assigned_by_emp.emp_name AS 'Course Assigned By',
        DATEDIFF(ac.status_modified_date, ac.assigned_date) AS 'Training Duration',
        mentor_emp.emp_name AS 'Faculty/Mentor Name',
        mentor_emp.emp_email AS 'Faculty/Mentor Mail Id',
        mentor_emp.Designation_Name AS 'Faculty/Mentor Designation',
        ct.type_name AS 'Course Type',
        CASE 
            WHEN ac.effectiveness_initiated = 1 THEN 'Y' 
            ELSE 'N' 
        END AS 'Effectiveness Initiated (Y/N)',
        sd.service_name AS 'Service Division (Tech/Content)'
      FROM 
        emp_newtrainingrequested entr
      INNER JOIN 
        newtrainingrequest ntr ON entr.requestid = ntr.requestid
      LEFT JOIN 
        projectname pn ON ntr.projectid = pn.ProjectID
      INNER JOIN 
        assigned_courses ac ON entr.emp_id = ac.employee_id AND entr.requestid = ac.requestid
      INNER JOIN 
        course c ON ac.course_id = c.course_id
      INNER JOIN 
        course_type ct ON ac.coursetype_id = ct.type_id
      INNER JOIN 
        employee e ON entr.emp_id = e.emp_id
      LEFT JOIN 
        service_division sd ON ntr.service_division = sd.id
      LEFT JOIN 
        employee created_by_emp ON ntr.requestedbyid = created_by_emp.emp_id
      LEFT JOIN 
        employee assigned_to_emp ON ntr.AssignedTo = assigned_to_emp.emp_id
      LEFT JOIN 
        employee assigned_by_emp ON ac.course_assigned_by_id = assigned_by_emp.emp_id
      LEFT JOIN 
        employee mentor_emp ON ac.mentor_id = mentor_emp.emp_id
      WHERE DATE(ac.assigned_date) BETWEEN ? AND ?
    `

    return `(${regularQuery}) UNION (${rejectedQuery}) ORDER BY \`Assigned Date\` DESC;`
  }

  return `
    SELECT 
      entr.requestid AS 'Request ID',
      pn.ProjectName AS 'Project Name',
      CASE 
          WHEN ntr.newprospectname IS NOT NULL THEN 'Y' 
          ELSE 'N' 
      END AS 'New Prospect (Y/N)',
      COALESCE(ntr.newprospectname, '') AS 'Prospect Name',
      c.course_name AS 'Course Name',
      e.emp_name AS 'Employee Name',
      e.emp_email AS 'Employee Mail Id',
      e.Designation_Name AS 'Employee Designation',
      ac.status AS 'Course Status',
      ac.comments AS 'Comments',
      entr.status AS 'User Status',
      ac.learning_type AS 'Skill Type',
      DATE_FORMAT(ac.assigned_date, '%Y-%m-%d') AS 'Assigned Date',
      DATE_FORMAT(ac.completion_date, '%Y-%m-%d') AS 'Expected Learning Completion Date',
      DATE_FORMAT(ac.status_modified_date, '%Y-%m-%d') AS 'Actual Learning Completion Date',
      ac.progress AS 'Progress',
      created_by_emp.emp_name AS 'Request Created By',
      assigned_to_emp.emp_name AS 'Request Assigned To',
      assigned_by_emp.emp_name AS 'Course Assigned By',
      DATEDIFF(ac.status_modified_date, ac.assigned_date) AS 'Training Duration',
      mentor_emp.emp_name AS 'Faculty/Mentor Name',
      mentor_emp.emp_email AS 'Faculty/Mentor Mail Id',
      mentor_emp.Designation_Name AS 'Faculty/Mentor Designation',
      ct.type_name AS 'Course Type',
      CASE 
          WHEN ac.effectiveness_initiated = 1 THEN 'Y' 
          ELSE 'N' 
      END AS 'Effectiveness Initiated (Y/N)',
      sd.service_name AS 'Service Division (Tech/Content)'
    FROM 
      emp_newtrainingrequested entr
    INNER JOIN 
      newtrainingrequest ntr ON entr.requestid = ntr.requestid
    LEFT JOIN 
      projectname pn ON ntr.projectid = pn.ProjectID
    INNER JOIN 
      assigned_courses ac ON entr.emp_id = ac.employee_id AND entr.requestid = ac.requestid
    INNER JOIN 
      course c ON ac.course_id = c.course_id
    INNER JOIN 
      course_type ct ON ac.coursetype_id = ct.type_id
    INNER JOIN 
      employee e ON entr.emp_id = e.emp_id
    LEFT JOIN 
      service_division sd ON ntr.service_division = sd.id
    LEFT JOIN 
      employee created_by_emp ON ntr.requestedbyid = created_by_emp.emp_id
    LEFT JOIN 
      employee assigned_to_emp ON ntr.AssignedTo = assigned_to_emp.emp_id
    LEFT JOIN 
      employee assigned_by_emp ON ac.course_assigned_by_id = assigned_by_emp.emp_id
    LEFT JOIN 
      employee mentor_emp ON ac.mentor_id = mentor_emp.emp_id
    WHERE DATE(ac.assigned_date) BETWEEN ? AND ?
    ${statusFilter}
    ORDER BY ac.assigned_date DESC;
  `
}

const getReportData = (fromDate, toDate, status, callback) => {
  const query = buildQuery(fromDate, toDate, status)

  // For 'all' status, we need to pass the date parameters twice due to UNION
  const params = status === "all" ? [fromDate, toDate, fromDate, toDate] : [fromDate, toDate]

  connection.query(query, params, (err, results) => {
    if (err) {
      console.error("Database error:", err)
      return callback(err)
    }

    // Return empty array instead of error when no data found
    callback(null, results || [])
  })
}

const exportToExcel = (fromDate, toDate, status, callback) => {
  getReportData(fromDate, toDate, status, (err, results) => {
    if (err) {
      return callback(err)
    }

    // If no results, return early with a custom message
    if (results.length === 0) {
      return callback(new Error("No data found for the selected filters"))
    }

    try {
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(results)

      // Add styling to header row
      const headerRange = XLSX.utils.decode_range(ws["!ref"])
      for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C })
        if (!ws[cellAddress]) continue

        ws[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "2C3E50" } },
          alignment: { horizontal: "center" },
        }
      }

      // Set column widths
      ws["!cols"] = [
        { wch: 10 },
        { wch: 20 },
        { wch: 10 },
        { wch: 20 },
        { wch: 25 },
        { wch: 20 },
        { wch: 25 },
        { wch: 25 },
        { wch: 15 },
        { wch: 30 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 25 },
        { wch: 25 },
        { wch: 15 },
        { wch: 20 },
        { wch: 20 },
        { wch: 20 },
        { wch: 15 },
        { wch: 20 },
        { wch: 25 },
        { wch: 25 },
        { wch: 15 },
        { wch: 25 },
      ]

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Training Report")

      // Create reports directory if it doesn't exist
      const dir = path.join(__dirname, "../reports")
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir)
      }

      // Generate file path
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
      const filePath = path.join(dir, `training_report_${timestamp}.xlsx`)

      // Write file
      XLSX.writeFile(wb, filePath)

      callback(null, {
        filePath,
        data: results,
        statusFilter: status,
        dateRange: `${fromDate} to ${toDate}`,
      })
    } catch (error) {
      console.error("Excel generation error:", error)
      callback(error)
    }
  })
}

module.exports = {
  exportToExcel,
  getReportData,
}

