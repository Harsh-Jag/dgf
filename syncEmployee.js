const axios = require("axios")
const db = require("../config/db")

async function syncEmployees() {
  const connection = await db.promise()
  try {
    // Fetch data from the API
    const response = await axios.get(
      "https://academy.example.com/local/learningrequest/getAllUsers.php?token=ec25c26077f0b72a143df01",
    )
    const employees = Object.values(response.data)

    if (!employees || !employees.length) {
      console.log("No employees data received from API")
      return { success: false, message: "No employees data received from API" }
    }

    console.log(`Fetched ${employees.length} employees from API`)

    // Prepare employees data according to the database schema
    const employeesData = employees
      .map((emp) => ({
        emp_id: emp.employee_id || null,
        emp_name: `${emp.firstname} ${emp.lastname}`.trim(),
        emp_email: emp.email || null,
        profile_image: null, // No profile image in the API data
        manager_id: emp.direct_manager_employee_id || null,
        manager12_id: emp.manager12id || null,
        Designation_Name: emp.designation_name || null,
      }))
      .filter((emp) => emp.emp_id) // Filter out records without emp_id

    // Two-phase insertion to handle foreign key constraints

    // Phase 1: Insert employees without managers or with null managers
    const phase1Employees = employeesData.filter((emp) => !emp.manager_id && !emp.manager12_id)

    console.log(`Phase 1: Inserting ${phase1Employees.length} employees without managers`)

    for (const emp of phase1Employees) {
      await insertOrUpdateEmployee(connection, emp)
    }

    // Phase 2: Insert remaining employees
    const phase2Employees = employeesData.filter((emp) => emp.manager_id || emp.manager12_id)

    console.log(`Phase 2: Inserting ${phase2Employees.length} employees with managers`)

    // Sort employees to handle hierarchical dependencies
    // This helps ensure managers are inserted before their subordinates
    const sortedEmployees = sortEmployeesByHierarchy(phase2Employees)

    for (const emp of sortedEmployees) {
      await insertOrUpdateEmployee(connection, emp)
    }

    console.log(`Successfully synced ${employeesData.length} employees`)
    return {
      success: true,
      message: `Successfully synced ${employeesData.length} employees`,
    }
  } catch (error) {
    console.error("Error syncing employees:", error)
    return {
      success: false,
      message: `Error syncing employees: ${error.message}`,
      error,
    }
  }
}

async function insertOrUpdateEmployee(connection, employee) {
  try {
    // Check if employee already exists
    const [existingEmployee] = await connection.execute("SELECT emp_id FROM employee WHERE emp_id = ?", [
      employee.emp_id,
    ])

    if (existingEmployee.length > 0) {
      // Update existing employee
      await connection.execute(
        `UPDATE employee SET 
         emp_name = ?, 
         emp_email = ?, 
         manager_id = ?, 
         manager12_id = ?, 
         Designation_Name = ? 
         WHERE emp_id = ?`,
        [
          employee.emp_name,
          employee.emp_email,
          employee.manager_id,
          employee.manager12_id,
          employee.Designation_Name,
          employee.emp_id,
        ],
      )
      console.log(`Updated employee: ${employee.emp_id} - ${employee.emp_name}`)
    } else {
      // Insert new employee
      await connection.execute(
        `INSERT INTO employee 
         (emp_id, emp_name, emp_email, profile_image, manager_id, manager12_id, Designation_Name) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          employee.emp_id,
          employee.emp_name,
          employee.emp_email,
          employee.profile_image,
          employee.manager_id,
          employee.manager12_id,
          employee.Designation_Name,
        ],
      )
      console.log(`Inserted employee: ${employee.emp_id} - ${employee.emp_name}`)
    }
    return true
  } catch (error) {
    console.error(`Error processing employee ${employee.emp_id}:`, error)
    // Handle foreign key constraint errors by setting managers to null
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      console.log(`Foreign key constraint failed for ${employee.emp_id}, inserting without manager references`)
      // Try inserting without manager references
      await connection.execute(
        `INSERT INTO employee 
         (emp_id, emp_name, emp_email, profile_image, manager_id, manager12_id, Designation_Name) 
         VALUES (?, ?, ?, ?, NULL, NULL, ?)`,
        [employee.emp_id, employee.emp_name, employee.emp_email, employee.profile_image, employee.Designation_Name],
      )
      console.log(`Inserted employee without manager references: ${employee.emp_id}`)
      return true
    }
    throw error
  }
}

function sortEmployeesByHierarchy(employees) {
  // Create a map of employee IDs to their data
  const employeeMap = new Map()
  employees.forEach((emp) => employeeMap.set(emp.emp_id, emp))

  // Create a dependency graph
  const dependencyGraph = new Map()
  employees.forEach((emp) => {
    const dependencies = []
    if (emp.manager_id && employeeMap.has(emp.manager_id)) {
      dependencies.push(emp.manager_id)
    }
    if (emp.manager12_id && employeeMap.has(emp.manager12_id)) {
      dependencies.push(emp.manager12_id)
    }
    dependencyGraph.set(emp.emp_id, dependencies)
  })

  // Topological sort
  const visited = new Set()
  const sorted = []

  function visit(id) {
    if (visited.has(id)) return
    visited.add(id)

    const dependencies = dependencyGraph.get(id) || []
    for (const depId of dependencies) {
      visit(depId)
    }

    sorted.push(employeeMap.get(id))
  }

  // Visit all nodes
  for (const emp of employees) {
    visit(emp.emp_id)
  }

  return sorted
}

module.exports = { syncEmployees }

