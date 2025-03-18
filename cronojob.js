const cron = require('node-cron');
const axios = require('axios');
const pool = require('../config/db');

async function syncEmployees() {
  let connection;
  try {
    connection = await pool.promise().getConnection();

    // Fetch data from Matrix API to get emp_empl_status
    const date = new Date().toISOString().split('T')[0];
    const tokenString = `2022#@1academy${date}!@#$%^`;
    const matrixToken = Buffer.from(tokenString).toString('base64');
    const matrixUrl = `https://matrix.harbinger-systems.com/academy_get_data.php?id=${matrixToken}`;
    const matrixResponse = await axios.get(matrixUrl);

    if (matrixResponse.status !== 200) throw new Error('Matrix API failed');
    if (!Array.isArray(matrixResponse.data)) throw new Error('Invalid matrix data format');

    // Create a map of email to emp_empl_status
    const emailToStatus = new Map();
    for (const matrixEmp of matrixResponse.data) {
      const email = matrixEmp.emp_email_id?.trim().toLowerCase();
      if (email) {
        emailToStatus.set(email, matrixEmp.emp_empl_status);
      }
    }

    // Fetch data from Academy API
    const academyResponse = await axios.get('https://academy.harbingergroup.com/local/learningrequest/getAllUsers.php?token=ec25c26077c47fd4b77f0b72a143df01 ');
    if (academyResponse.status !== 200) throw new Error('Academy API failed');
    if (!Array.isArray(academyResponse.data)) throw new Error('Invalid academy data format');

    const employees = academyResponse.data;
    await connection.beginTransaction();
    const insertedIds = new Set();

    // First pass: Insert/update employees
    for (const emp of employees) {
      const empEmail = emp.email?.trim().toLowerCase();
      if (empEmail) {
        const status = emailToStatus.get(empEmail);
        if (status === 'Exited') {
          console.log(`Skipping exited employee with email: ${empEmail}`);
          continue;
        }
      }

      const empId = emp.employee_id ? String(emp.employee_id).trim().toUpperCase() : null;
      const designationName = emp.designation_name || null;

      const employeeData = {
        emp_id: empId,
        emp_name: `${emp.firstname || ''} ${emp.lastname || ''}`.trim(),
        emp_email: emp.email,
        profile_image: emp.profilepic || null,
        manager_id: null,
        manager12_id: null,
        designation_name: designationName,
      };

      if (!employeeData.emp_id || !employeeData.emp_name || !employeeData.emp_email) {
        console.warn('Invalid employee record:', emp);
        continue;
      }

      await connection.query(
        `INSERT INTO employee
        (emp_id, emp_name, emp_email, profile_image, manager_id, manager12_id, designation_name)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          emp_name = VALUES(emp_name),
          emp_email = VALUES(emp_email),
          profile_image = VALUES(profile_image),
          designation_name = VALUES(designation_name)`,
        [
          employeeData.emp_id,
          employeeData.emp_name,
          employeeData.emp_email,
          employeeData.profile_image,
          employeeData.manager_id,
          employeeData.manager12_id,
          employeeData.designation_name,
        ]
      );

      insertedIds.add(empId);
    }

    // Second pass: Update relationships
    for (const emp of employees) {
      const empId = emp.employee_id ? String(emp.employee_id).trim().toUpperCase() : null;
      if (!empId) continue;

      const updates = [];
      const params = [];

      // Process direct manager
      if (emp.direct_manager_employee_id) {
        const managerId = String(emp.direct_manager_employee_id).toUpperCase();
        if (insertedIds.has(managerId)) {
          updates.push('manager_id = ?');
          params.push(managerId);
        }
      }

      // Process L2 manager
      if (emp.manager12id) {
        const l2Id = String(emp.manager12id).toUpperCase();
        if (insertedIds.has(l2Id)) {
          updates.push('manager12_id = ?');
          params.push(l2Id);
        }
      }

      if (updates.length > 0) {
        params.push(empId);
        await connection.query(
          `UPDATE employee
          SET ${updates.join(', ')}
          WHERE emp_id = ?`,
          params
        );
      }
    }

    await connection.commit();
    console.log('Sync completed successfully');
    return true;
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Sync failed:', error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

module.exports = { syncEmployees };
