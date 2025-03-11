const cron = require('node-cron');
const fetch = require('node-fetch');
const pool = require('../config/db');

async function processDesignation(designationName) {
    if (!designationName) return null;
    try {
        const [existing] = await pool.promise().query(
            'SELECT id FROM employee_level WHERE name = ?',
            [designationName]
        );
        if (existing.length > 0) return existing[0].id;
        const [result] = await pool.promise().query(
            'INSERT INTO employee_level (name) VALUES (?)',
            [designationName]
        );
        return result.insertId;
    } catch (error) {
        console.error('Designation error:', error);
        return null;
    }
}

async function syncEmployees() {
    let connection;
    try {
        connection = await pool.promise().getConnection();
        const response = await fetch('https://academy.harbingergroup.com/local/learningrequest/getAllUsers.php?token=ec25c26077c47fd4b77f0b72a143df01');
        if (!response.ok) throw new Error('API failed');
        const employees = await response.json();
        if (!Array.isArray(employees)) throw new Error('Invalid data');
        
        await connection.beginTransaction();
        const insertedIds = new Set();

        for (const emp of employees) {
            const empId = emp.employee_id ? String(emp.employee_id).trim().toUpperCase() : null;
            if (!empId || !empId.match(/^HS\d+$/)) {
                console.warn('Invalid ID:', emp.employee_id);
                continue;
            }

            const designationId = emp.designation_name ? await processDesignation(emp.designation_name) : null;
            const employeeData = {
                emp_id: empId,
                emp_name: `${emp.firstname || ''} ${emp.lastname || ''}`.trim(),
                emp_email: emp.email,
                profile_image: null,
                designation_id: designationId,
                manager_id: null,
                manager12_id: null
            };

            if (!employeeData.emp_id || !employeeData.emp_name || !employeeData.emp_email) {
                console.warn('Invalid record:', emp);
                continue;
            }

            await connection.query(
                `INSERT INTO employee 
                (emp_id, emp_name, emp_email, profile_image, designation_id, manager_id, manager12_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                emp_name = VALUES(emp_name),
                emp_email = VALUES(emp_email),
                profile_image = VALUES(profile_image),
                designation_id = VALUES(designation_id)`,
                [
                    employeeData.emp_id,
                    employeeData.emp_name,
                    employeeData.emp_email,
                    employeeData.profile_image,
                    employeeData.designation_id,
                    employeeData.manager_id,
                    employeeData.manager12_id
                ]
            );
            insertedIds.add(empId);
        }

        for (const emp of employees) {
            const empId = emp.employee_id ? String(emp.employee_id).trim().toUpperCase() : null;
            if (!empId) continue;

            const updates = [];
            const params = [];

            if (emp.direct_manager_employee_id) {
                const managerId = String(emp.direct_manager_employee_id).toUpperCase();
                if (insertedIds.has(managerId)) {
                    updates.push('manager_id = ?');
                    params.push(managerId);
                }
            }

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
        console.log('Sync completed');
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