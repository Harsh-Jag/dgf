"use client"

import React, { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import {
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  RadioGroup,
  TextField,
  FormControlLabel,
  Radio,
  Button,
  Box,
  Divider,
  TableCell,
  TableContainer,
  TableBody,
  TableHead,
  TableRow,
  Table,
  IconButton,
  Avatar,
  Autocomplete,
  Dialog,
  DialogTitle,
  Tooltip,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import CloseIcon from "@mui/icons-material/Close"
import TablePagination from "@mui/material/TablePagination"
import ReactQuill from "react-quill-new" // Import react-quill-new
import "react-quill-new/dist/quill.snow.css" // Import styles for react-quill-new
import "./NewTrainingRequest.css" // Import the CSS file
import AuthContext from "../Auth/AuthContext"
// import { Snackbar, Alert } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import { toPascalCase } from "../../utils/stringUtils"
import getRoleType from "../../utils/roleUtils"
import { arrayBufferToBase64 } from "../../utils/ImgConveter"
import Grid from "@mui/material/Grid2"
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material"

const CustomRadio = styled(Radio)({
  "& .MuiSvgIcon-root": { fontSize: 16 },
})

const NewTrainingRequest = () => {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext) // Get the user from AuthContext
  const [formData, setFormData] = useState({
    completionCriteria: "",
    otherSkill: "",
    comment: "",
    trainingPurpose: "prospect",
    employeeDetails: "add",
    selectedDate: null,
    availableFromDate: null,
    emails: "",
    employees: [],
    invalidEmails: [],
    showSummary: false,
    rowsPerPage: 5,
    page: 0,
    showTable: false,
    sources: [],
    trainingObjectives: [],
    selectedSource: "",
    selectedTrainingObjective: "",
    techStacks: [],
    selectedTechStack: "",
    primarySkills: [],
    selectedPrimarySkill: "",
    projects: [],
    selectedProject: "",
    employeeLevels: [],
    selectedEmployeeLevel: [],
    services: [],
    requestonbehalf: "",
    prospectName: "",
    selectedServiceDivision: "",
    searchQuery: "",
    requestonbehalfRole: "",
  })

  const role = getRoleType(user.role_id)
  const [searchResults, setSearchResults] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [newRequestId, setNewRequestId] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")
  const [snackbarSeverity, setSnackbarSeverity] = useState("success")
  const [isFormValid, setIsFormValid] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Set default training purpose to "project" for roles other than 8 and 4
    if (user && user.role_id !== 8 && user.role_id !== 4) {
      setFormData((prevState) => ({
        ...prevState,
        trainingPurpose: "project",
      }))
    }
  }, [user])

  const validateForm = () => {
    const requiredFields = [
      formData.selectedSource,
      formData.selectedTrainingObjective,
      formData.selectedDate,
      formData.selectedTechStack,
      formData.selectedPrimarySkill,
      formData.otherSkill,
      formData.completionCriteria,
    ]

    if (formData.trainingPurpose === "prospect") {
      requiredFields.push(formData.prospectName, formData.selectedServiceDivision)
    } else if (formData.trainingPurpose === "project") {
      requiredFields.push(formData.selectedProject, formData.selectedServiceDivision)
    }

    if (formData.employeeDetails === "open" && role === "CapDev") {
      requiredFields.push(formData.selectedEmployeeLevel)
    }

    if (formData.employeeDetails === "add") {
      // Check if all table fields are filled
      const allTableFieldsFilled = formData.employees.every((emp) => emp.availableFrom && emp.bandwidth && emp.weekend)

      if (!allTableFieldsFilled) {
        return false
      }
      return requiredFields.every((field) => field !== "" && field !== null)
    }

    // Ensure otherSkill and completionCriteria are not empty
    if (!formData.otherSkill || !formData.completionCriteria) {
      return false
    }

    return requiredFields.every((field) => field !== "" && field !== null)
  }
  useEffect(() => {
    const isEmployeeDetailsValid =
      formData.employees.length > 0 &&
      formData.employees.every((emp) => emp.availableFrom && emp.bandwidth && emp.weekend)
    setIsFormValid(validateForm() && isEmployeeDetailsValid)
  }, [formData, formData.employees, formData.otherSkill, formData.completionCriteria, validateForm])

  const [expandedEmpId, setExpandedEmpId] = useState(null)

  const handleToggleEmpExpand = (empId) => {
    setExpandedEmpId(expandedEmpId === empId ? null : empId)
  }

  const handleExpectedDateChange = (e) => {
    const selectedDate = e.target.value
    if (new Date(selectedDate) >= new Date()) {
      setFormData({ ...formData, selectedDate })
      setIsFormValid(validateForm())
    } else {
      setSnackbarMessage("Please select a future date")
      setSnackbarSeverity("error")
      setSnackbarOpen(true)
    }
  }
  const availableFromDateChange = (e) => {
    const availableFromDate = e.target.value
    if (new Date(availableFromDate) >= new Date()) {
      setFormData({ ...formData, availableFromDate })
      setIsFormValid(validateForm())
    } else {
      setSnackbarMessage("Please select a future date")
      setSnackbarSeverity("error")
      setSnackbarOpen(true)
    }
  }

  useEffect(() => {
    if (user) {
      fetch(`http://localhost:8000/api/role/sources?role_id=${user.role_id}`)
        .then((response) => response.json())
        .then((data) => {
          setFormData((prevFormData) => ({
            ...prevFormData,
            sources: data,
          }))
        })
        .catch((error) => console.error("Error fetching sources:", error))
    }
    // Fetch tech stacks
    fetch(`http://localhost:8000/api/techstack/all`)
      .then((response) => response.json())
      .then((data) => {
        setFormData((prevFormData) => ({
          ...prevFormData,
          techStacks: data,
        }))
      })
      .catch((error) => console.error("Error fetching tech stacks:", error))
  }, [user])

  useEffect(() => {
    fetch(`http://localhost:8000/api/employee-level/all`)
      .then((response) => response.json())
      .then((data) => {
        setFormData((prevFormData) => ({
          ...prevFormData,
          employeeLevels: data,
        }))
      })
      .catch((error) => console.error("Error fetching employee levels:", error))
  }, [])

  useEffect(() => {
    // Fetch services data
    fetch(`http://localhost:8000/api/services`)
      .then((response) => response.json())
      .then((data) => {
        setFormData((prevFormData) => ({
          ...prevFormData,
          services: data.services,
        }))
      })
      .catch((error) => console.error("Error fetching services:", error))
  }, [])

  useEffect(() => {
    // Fetch employee levels data
    fetch(`http://localhost:8000/api/employee-level/all`)
      .then((response) => response.json())
      .then((data) => {
        setFormData((prevFormData) => ({
          ...prevFormData,
          employeeLevels: data,
        }))
      })
      .catch((error) => console.error("Error fetching employee levels:", error))
  }, [])

  useEffect(() => {
    const fetchNewRequestId = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/get-max-request-id/max-request-id")
        const data = await response.json()
        if (response.ok) {
          setNewRequestId(data.newRequestId)
        } else {
          console.error("Failed to fetch new request ID:", data.message)
        }
      } catch (error) {
        console.error("Error fetching new request ID:", error)
      }
    }

    fetchNewRequestId()
  }, [])

  useEffect(() => {
    if (user.role_id !== 4) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        requestonbehalf: user.emp_id,
      }))
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === "prospectName") {
      const nameValid = /^[a-zA-Z][a-zA-Z0-9\s\-_/&]{4,}$/.test(value)
      setFormData({
        ...formData,
        [name]: value,
        prospectNameError: !nameValid && value !== "",
        prospectNameErrorMessage:
          !nameValid && value !== ""
            ? "Invalid Prospect Name. Must start with an alphabet, allow alphanumeric characters, and be greater than 4 characters."
            : "",
      })
    } else {
      setFormData({ ...formData, [name]: value })
    }

    setIsFormValid(validateForm())
  }
  // const handleDateChange = (newValue) => {
  //   setFormData({ ...formData, selectedDate: newValue });
  //   setIsFormValid(validateForm());
  // };

  const handleSourceChange = (e) => {
    const selectedSource = e.target.value
    setFormData({ ...formData, selectedSource })
    setIsFormValid(validateForm())

    // Fetch training objectives based on the selected source
    fetch(`http://localhost:8000/api/training/objectives?source_id=${selectedSource}`)
      .then((response) => response.json())
      .then((data) => {
        setFormData((prevFormData) => ({
          ...prevFormData,
          trainingObjectives: data,
          selectedTrainingObjective: "",
        }))
        setIsFormValid(validateForm())
      })
      .catch((error) => console.error("Error fetching training objectives:", error))
  }
  const handleOtherSkillChange = (value) => {
    const sanitizedValue = value === "<p><br></p>" ? "" : value

    setFormData((prevData) => ({
      ...prevData,
      otherSkill: sanitizedValue,
    }))
    setIsFormValid(validateForm())
  }
  const handleCompletionCriteriaChange = (value) => {
    const sanitizedValue = value === "<p><br></p>" ? "" : value
    const wordCount = sanitizedValue.split(/\s+/).filter((word) => word.length > 0).length
    if (wordCount <= 1000) {
      setFormData((prevData) => ({
        ...prevData,
        completionCriteria: value,
      }))
    } else {
      alert("Maximum word limit of 1000 words exceeded")
    }
    setFormData({ ...formData, completionCriteria: sanitizedValue })
    setIsFormValid(validateForm())
  }

  const handleCommentsChange = (value) => {
    const sanitizedValue = value === "<p><br></p>" ? "" : value
    const wordCount = sanitizedValue.split(/\s+/).filter((word) => word.length > 0).length
    if (wordCount <= 350) {
      setFormData((prevData) => ({
        ...prevData,
        comment: value,
      }))
    } else {
      alert("Maximum word limit of 350 words exceeded")
    }
    setFormData({ ...formData, comment: sanitizedValue })
    setIsFormValid(validateForm())
  }

  const handleTrainingObjectiveChange = (e) => {
    const selectedTrainingObjective = e.target.value
    setFormData({ ...formData, selectedTrainingObjective })
    setIsFormValid(validateForm())
  }

  const handleTechStackChange = (e) => {
    const selectedTechStack = e.target.value
    setFormData({ ...formData, selectedTechStack })
    setIsFormValid(validateForm())

    // Fetch primary skills based on the selected tech stack
    fetch(`http://localhost:8000/api/primaryskill/by-stack?stack_id=${selectedTechStack}`)
      .then((response) => response.json())
      .then((data) => {
        setFormData((prevFormData) => ({
          ...prevFormData,
          primarySkills: data,
          selectedPrimarySkill: [],
        }))
        setIsFormValid(validateForm())
      })
      .catch((error) => console.error("Error fetching primary skills:", error))
  }

  // Fetch projects data
  useEffect(() => {
    fetch(`http://localhost:8000/api/project/all`)
      .then((response) => response.json())
      .then((data) => {
        setFormData((prevFormData) => ({
          ...prevFormData,
          projects: data,
        }))
      })
      .catch((error) => console.error("Error fetching projects:", error))
  }, [])

  useEffect(() => {
    if (user.role_id !== 4) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        requestonbehalf: user.emp_id,
        requestonbehalfRole: user.role_id,
      }))
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        requestonbehalf: user.emp_id,
        requestonbehalfRole: user.role_id,
      }))
    }
  }, [user])

  const handleEmployeeSearch = (event, value) => {
    if (value.length > 0) {
      let apiUrl
      if (formData.employeeDetails === "add" && formData.requestonbehalfRole !== 4) {
        apiUrl = `http://localhost:8000/api/employeeSearchByName/searchEmployeesByName?managerId=${formData.requestonbehalf}&name=${value}`
      } else {
        apiUrl = `http://localhost:8000/api/employees/searchWithoutManager?name=${value}`
      }

      fetch(apiUrl)
        .then((response) => response.json())
        .then(async (data) => {
          if (Array.isArray(data)) {
            const employeesWithSkills = await Promise.all(
              data.map(async (emp) => {
                try {
                  let learnerResponse
                  let learnerData

                  if (formData.employeeDetails === "open") {
                    learnerResponse = await fetch(
                      `http://localhost:8000/api/orgLevelLearners/getOrgLevelLearnerData/${emp.emp_id}`,
                    )
                    learnerData = await learnerResponse.json()
                    return {
                      ...emp,
                      totalPrimarySkills: learnerData.total_requests || 0,
                    }
                  } else {
                    learnerResponse = await fetch(`http://localhost:8000/api/learners/getLearners/${emp.emp_id}`)
                    learnerData = await learnerResponse.json()
                    return {
                      ...emp,
                      totalPrimarySkills: learnerData.total_primary_skills || 0,
                    }
                  }
                } catch (error) {
                  console.error("Error fetching learner data:", error)
                  return { ...emp, totalPrimarySkills: 0 }
                }
              }),
            )
            setSearchResults(
              employeesWithSkills.map((emp) => ({
                id: emp.emp_id,
                name: emp.emp_name,
                email: emp.emp_email,
                profileImage: emp.profile_image?.data
                  ? `data:image/jpeg;base64,${arrayBufferToBase64(emp.profile_image.data)}`
                  : "/placeholder.svg", // Use a placeholder image if profile_image is null
                uniqueKey: `${emp.emp_id}-${Date.now()}`,
                totalPrimarySkills: emp.totalPrimarySkills,
              })),
            )
          }
        })
        .catch((error) => console.error("Error fetching employees:", error))
    }
  }

  const handleManagerSearch = (event, value) => {
    if (value.length > 0) {
      fetch(`http://localhost:8000/api/managerSearchByName/searchManagersByName?name=${value}`)
        .then((response) => response.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setSearchResults(
              data.map((manager) => ({
                id: manager.manager_id,
                name: manager.manager_name,
                email: manager.manager_email,
                role: manager.role_id, // Use role_id from the response
                uniqueKey: `${manager.manager_id}-${Date.now()}`, // Add unique key
              })),
            )
          } else {
            console.error("Unexpected response format for manager search by name:", data)
          }
        })
        .catch((error) => console.error("Error fetching managers by name:", error))
    } else {
      setSearchResults([])
    }
  }

  const handleEmailSearch = async (email) => {
    try {
      let apiUrl

      // Construct the API URL based on the conditions
      if (formData.employeeDetails === "add" && formData.requestonbehalfRole !== 4) {
        apiUrl = `http://localhost:8000/api/employee/searchEmployeesByManagerIdAndEmail?managerid=${formData.requestonbehalf}&emailPrefix=${email}`
      } else {
        apiUrl = `http://localhost:8000/api/emailSearchWithoutManagerId/getEmployeesByEmail?email=${email}`
      }

      const response = await fetch(apiUrl)
      const data = await response.json()

      if (response.ok && data.length > 0) {
        const employee = data[0]

        // Check if employee already exists in the list
        if (!formData.employees.some((existingEmp) => existingEmp.id === employee.emp_id)) {
          // Fetch learning data to check how many learnings the employee has
          let learnerResponse
          let learnerData

          if (formData.employeeDetails === "open") {
            learnerResponse = await fetch(
              `http://localhost:8000/api/orgLevelLearners/getOrgLevelLearnerData/${employee.emp_id}`,
            )
            learnerData = await learnerResponse.json()

            // For org level, check if employee has more than 2 learnings
            if (learnerData.total_requests > 2) {
              setSnackbarMessage(
                `Failed to add employee ${employee.emp_name} because they already have three learnings.`,
              )
              setSnackbarSeverity("error")
              setSnackbarOpen(true)
              return null
            }
          } else {
            learnerResponse = await fetch(`http://localhost:8000/api/learners/getLearners/${employee.emp_id}`)
            learnerData = await learnerResponse.json()

            // For regular add, check if employee has 3 or more learnings
            if (learnerData.total_primary_skills >= 3) {
              setSnackbarMessage(
                `Failed to add employee ${employee.emp_name} because they already have three learnings.`,
              )
              setSnackbarSeverity("error")
              setSnackbarOpen(true)
              return null
            }
          }

          return {
            id: employee.emp_id,
            name: employee.emp_name,
            email: employee.emp_email,
            availableFrom: "",
            bandwidth: "",
            weekend: "",
            profileImage: employee.profile_image?.data
              ? `data:image/jpeg;base64,${arrayBufferToBase64(employee.profile_image.data)}`
              : "/placeholder.svg",
            uniqueKey: `${employee.emp_id}-${Date.now()}`,
            total_requests: learnerData.total_requests || learnerData.total_primary_skills || 0,
            requests: learnerData.requests || [],
          }
        }
      } else {
        console.error("Failed to fetch employee by email:", data.message)
        setSnackbarMessage(`Email ${email} not found.`)
        setSnackbarSeverity("error")
        setSnackbarOpen(true)
      }
    } catch (error) {
      console.error("Error fetching employee by email:", error)
      setSnackbarMessage(`Error fetching employee by email: ${error.message}`)
      setSnackbarSeverity("error")
      setSnackbarOpen(true)
    }
    return null
  }

  const addEmployeesByLevel = async () => {
    const newEmployees = []

    // Fetch employees based on selected employee levels if "Place an Open Request" is selected
    if (formData.selectedEmployeeLevel.length > 0) {
      const levelIds = formData.selectedEmployeeLevel.join(",")
      try {
        const response = await fetch(
          `http://localhost:8000/api/employeeDesignation/getEmployeesByDesignation?designationIds=${levelIds}`,
        )
        const data = await response.json()
        if (response.ok) {
          const fetchedEmployees = data.map((emp) => ({
            id: emp.emp_id,
            name: emp.emp_name,
            email: emp.emp_email,
            availableFrom: "",
            bandwidth: "",
            weekend: "",
            profileImage: `data:image/jpeg;base64,${arrayBufferToBase64(emp.profile_image.data)}`, // Convert image data to base64
            uniqueKey: `${emp.emp_id}-${Date.now()}`, // Add unique key
          }))

          // Filter out employees that are already in the list
          const uniqueEmployees = fetchedEmployees.filter(
            (emp) => !formData.employees.some((existingEmp) => existingEmp.id === emp.id),
          )

          newEmployees.push(...uniqueEmployees)
        } else {
          console.error("Failed to fetch employees by designation:", data.message)
          setSnackbarMessage(`Failed to fetch employees: ${data.message}`)
          setSnackbarSeverity("error")
          setSnackbarOpen(true)
        }
      } catch (error) {
        console.error("Error fetching employees by designation:", error)
        setSnackbarMessage(`Error fetching employees: ${error.message}`)
        setSnackbarSeverity("error")
        setSnackbarOpen(true)
      }
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      employees: [...prevFormData.employees, ...newEmployees],
      showTable: true,
      showSummary: true,
    }))
    setIsFormValid(validateForm())
  }

  const addEmployee = async () => {
    const newEmployees = []
    const invalidEmails = []
    const tooManyLearningsEmails = []

    // Add selected employee from "Select Employee" field
    if (selectedEmployee && !formData.employees.some((emp) => emp.id === selectedEmployee.id)) {
      try {
        const response = await fetch(`http://localhost:8000/api/learners/getLearners/${selectedEmployee.id}`)
        const data = await response.json()

        newEmployees.push({
          ...selectedEmployee,
          availableFrom: "",
          bandwidth: "",
          weekend: "",
          total_requests: data.total_requests || 0,
          requests: data.requests || [],
        })
      } catch (error) {
        console.error("Error fetching employee requests:", error)
        newEmployees.push(selectedEmployee)
      }
      setSelectedEmployee(null)
    }

    // Process comma-separated emails
    if (formData.emails.trim() !== "") {
      const emailList = formData.emails.split(",").map((email) => email.trim())
      const uniqueEmails = [...new Set(emailList)] // Remove duplicate emails

      for (const email of uniqueEmails) {
        const employee = await handleEmailSearch(email)
        if (employee) {
          newEmployees.push(employee)
        } else {
          // Check if it's an invalid email or an employee with too many learnings
          // This is a simplified check - the actual error message would come from handleEmailSearch
          invalidEmails.push(email)
        }
      }

      if (invalidEmails.length > 0) {
        setSnackbarMessage(`Invalid emails: ${invalidEmails.join(", ")}`)
        setSnackbarSeverity("error")
        setSnackbarOpen(true)
      }
    }

    setFormData((prev) => ({
      ...prev,
      employees: [...prev.employees, ...newEmployees],
      showTable: newEmployees.length > 0 || prev.employees.length > 0,
      showSummary: true,
      emails: "",
    }))

    setTimeout(() => {
      setIsFormValid(validateForm())
    }, 0)
  }

  const removeEmployee = (id) => {
    setFormData({
      ...formData,
      employees: formData.employees.filter((emp) => emp.id !== id),
    })
    setIsFormValid(validateForm())
  }

  const updateEmployee = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      employees: prev.employees.map((emp) => (emp.id === id ? { ...emp, [field]: value } : emp)),
    }))
    setIsFormValid(validateForm())
  }

  const updateAllEmployees = (updates) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      employees: prevFormData.employees.map((emp) => ({
        ...emp,
        ...updates,
      })),
    }))
    setTimeout(() => {
      setIsFormValid(validateForm())
    }, 0)
  }

  const submitPrimarySkills = async (requestId, primarySkillIds) => {
    const requestBody = {
      requestid: requestId,
      primary_skill_ids: Array.isArray(primarySkillIds) ? primarySkillIds : [primarySkillIds],
    }

    console.log("Submitting primary skills to API:", requestBody) // Log the request body

    try {
      const response = await fetch("http://localhost:8000/api/trainingRequestPrimarySkills/storePrimarySkills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        console.log("Primary skills submitted successfully")
      } else {
        console.error("Failed to submit primary skills")
        const errorData = await response.json()
        console.error("Error details:", errorData) // Log the error details from the server
        setSnackbarMessage(`Failed to submit primary skills: ${errorData.message}`)
        setSnackbarSeverity("error")
        setSnackbarOpen(true)
      }
    } catch (error) {
      console.error("Error submitting primary skills:", error)
      setSnackbarMessage(`Error submitting primary skills: ${error.message}`)
      setSnackbarSeverity("error")
      setSnackbarOpen(true)
    }
  }

  const handleSubmit = async () => {
    const formattedDate = formData.selectedDate ? new Date(formData.selectedDate).toISOString().split("T")[0] : null

    const requestBody = {
      requestid: newRequestId, // Include the newRequestId here
      requestonbehalfof: user.role_id === 4 ? formData.requestonbehalf : user.emp_id, // Use emp_id for non-CapDev roles
      requestedbyid: user.emp_id, // Add the current user's ID from the session
      source: formData.selectedSource,
      trainingobj: formData.selectedTrainingObjective,
      projectid: formData.trainingPurpose === "project" ? formData.selectedProject : null,
      newprospectname: formData.trainingPurpose === "prospect" ? formData.prospectName : null,
      expecteddeadline: formattedDate,
      techstack: formData.selectedTechStack,
      otherskill: formData.otherSkill,
      suggestedcompletioncriteria: formData.completionCriteria,
      comments: formData.comment,
      servicedivision: formData.selectedServiceDivision,
      org_level: formData.employeeDetails === "open" ? 1 : 0, // Set org_level based on employeeDetails
    }

    console.log("Submitting request body to newtrainingrequest API:", requestBody) // Log the request body

    try {
      const response = await fetch("http://localhost:8000/api/newtrainingrequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        console.log("New training request submitted successfully")
        setDialogOpen(true)

        // Submit primary skills
        await submitPrimarySkills(newRequestId, formData.selectedPrimarySkill)

        // Proceed with the existing API call for employee levels
        if (formData.employeeDetails === "open" && formData.selectedEmployeeLevel.length > 0) {
          const employeeLevelRequestBody = {
            requestid: newRequestId, // Use the newRequestId here
            employee_level_ids: formData.selectedEmployeeLevel.filter((id) => id !== undefined), // Use selectedEmployeeLevel
          }

          console.log("Submitting request body to training-request/employee-levels API:", employeeLevelRequestBody) // Log the request body

          try {
            const employeeLevelResponse = await fetch("http://localhost:8000/api/training-request/employee-levels", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(employeeLevelRequestBody),
            })

            if (employeeLevelResponse.ok) {
              console.log("Employee levels submitted successfully")
            } else {
              console.error("Failed to submit employee levels")
              const errorData = await employeeLevelResponse.json()
              console.error("Error details:", errorData) // Log the error details from the server
              setSnackbarMessage(`Failed to submit employee levels: ${errorData.message}`)
              setSnackbarSeverity("error")
              setSnackbarOpen(true)
            }
          } catch (error) {
            console.error("Error submitting employee levels:", error)
            setSnackbarMessage(`Error submitting employee levels: ${error.message}`)
            setSnackbarSeverity("error")
            setSnackbarOpen(true)
          }
        }

        // New API call for adding employees if "Add Employees" is selected
        if (formData.employeeDetails === "add" || formData.employeeDetails === "open") {
          const empNewTrainingRequestBody = formData.employees.map((emp) => ({
            emp_id: emp.id,
            availablefrom: emp.availableFrom ? new Date(emp.availableFrom).toISOString().split("T")[0] : null, // Ensure this field is not undefined
            dailyband: emp.bandwidth || null, // Ensure this field is not undefined
            availableonweekend: emp.weekend === "Yes", // Convert to boolean
            requestid: newRequestId,
          }))

          console.log("Submitting request body to empNewTrainingRequested API:", empNewTrainingRequestBody) // Log the request body

          try {
            const empNewTrainingResponse = await fetch(
              "http://localhost:8000/api/empNewTrainingRequested/insertTrainingRequest",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(empNewTrainingRequestBody),
              },
            )

            if (empNewTrainingResponse.ok) {
              console.log("Employees added successfully")
            } else {
              console.error("Failed to add employees")
              const errorData = await empNewTrainingResponse.json()
              console.error("Error details:", errorData) // Log the error details from the server
              setSnackbarMessage(`Failed to add employees: ${errorData.message}`)
              setSnackbarSeverity("error")
              setSnackbarOpen(true)
            }
          } catch (error) {
            console.error("Error adding employees:", error)
            setSnackbarMessage(`Error adding employees: ${error.message}`)
            setSnackbarSeverity("error")
            setSnackbarOpen(true)
          }
        }
      } else {
        console.error("Failed to submit new training request")
        const errorData = await response.json()
        console.error("Error details:", errorData) // Log the error details from the server
        setSnackbarMessage(`Failed to submit new training request: ${errorData.message}`)
        setSnackbarSeverity("error")
        setSnackbarOpen(true)
      }
    } catch (error) {
      console.error("Error submitting new training request:", error)
      setSnackbarMessage(`Error submitting new training request: ${error.message}`)
      setSnackbarSeverity("error")
      setSnackbarOpen(true)
    }

    try {
      // Make the API request to submit the training request and trigger email sending
      const response = await fetch("http://localhost:8000/api/email/submitTrainingRequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // body: JSON.stringify(formData),
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        setSnackbarMessage("Training request submitted and emails sent successfully.")
        setSnackbarSeverity("success")
      } else {
        const errorData = await response.json()
        setSnackbarMessage(`Error: ${errorData.error}`)
        setSnackbarSeverity("error")
      }
    } catch (error) {
      console.error("Error submitting request:", error)
      setSnackbarMessage(`Error: ${error.message}`)
      setSnackbarSeverity("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    navigate("/training-container")
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper
        className="paper"
        elevation={0}
        style={{
          backgroundColor: "#F2F3F7F7",
          padding: "6px 30px",

          minWidth: "100%",
          flexWrap: "wrap",
        }}
      >
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="flex-start" // Align the items to the left
          alignItems="center" // Vertically center the items
          marginBottom="1rem"
          gap={2}
          flexWrap="nowrap"
        >
          <Divider style={{ margin: "1rem 0 ", marginLeft: "13px", marginRight: "-32px" }} />
          <Typography
            variant="h5"
            gutterBottom
            className="mainHeading"
            style={{ fontWeight: "bold", fontSize: "14px" }}
          >
            New Learning Request
          </Typography>
          <Divider
            orientation="vertical"
            style={{
              height: "2rem",
              marginRight: "1rem",
              border: "0.1px solid rgb(156, 155, 155)",
              marginTop: "0.6rem",
            }}
          />
          <Typography className="subheader" style={{ whiteSpace: "nowrap", marginTop: "1rem", color: "#4F4949" }}>
            Request ID:
          </Typography>
          <Typography style={{ marginLeft: "-0.85rem", marginTop: "1rem" }}>
            <strong> LR{newRequestId !== null ? newRequestId : "Loading..."} </strong>
          </Typography>
          <Typography
            className="subheader"
            style={{
              whiteSpace: "nowrap",
              marginRight: "0rem",
              marginTop: "1rem",
              color: "#4F4949",
              marginLeft: "25px",
            }}
          >
            Requested By:
          </Typography>
          <Typography style={{ marginLeft: "-0.85rem", marginTop: "1rem", marginright: "25px" }}>
            <strong>
              {" "}
              <span>{user ? toPascalCase(user.name) : "User"}</span>
            </strong>
          </Typography>
        </Box>
        <Paper
          elevation={1}
          style={{
            padding: "2rem",
            backgroundColor: "#FFFFFF",
            borderRadius: "10px",
            minWidth: "100%",
            marginLeft: "-42px",
            boxShadow: "none",
            marginBottom: "50px",
          }}
        >
          <Typography className="simpleHeading" style={{ fontWeight: "600", marginBottom: "1rem", marginTop: "1rem" }}>
            Learning Request Details
          </Typography>

          <Grid container spacing={5}>
            {/* Request on behalf */}
            <Grid item size={4} style={{ order: role !== "CapDev" ? 1 : 0 }}>
              {role === "CapDev" && (
                <FormControl fullWidth>
                  <Typography
                    className="subheader"
                    style={{
                      display: "inline",
                      marginBottom: "0.5rem",
                      marginLeft: "0rem",
                      marginRight: "0.8rem",
                      color: "#4F4949",
                    }}
                  >
                    Request on behalf{" "}
                    {/* <span className="required" style={{ display: "inline" }}>
            *
          </span> */}
                  </Typography>
                  {user.role_id === 4 ? (
                    <Autocomplete
                      options={searchResults}
                      getOptionLabel={(option) => option.name || ""}
                      name="requestonbehalf"
                      onInputChange={handleManagerSearch}
                      onChange={(event, value) =>
                        setFormData({
                          ...formData,
                          requestonbehalf: value ? value.id : "",
                          requestonbehalfRole: value ? value.role : "", // Store the role_id in formData
                        })
                      }
                      value={searchResults.find((option) => option.id === formData.requestonbehalf) || null} // Set default value
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          style={{
                            height: "20px",
                            marginLeft: "2px",
                            fontSize: "12px",
                            fontStyle: "normal",
                          }}
                          InputProps={{
                            ...params.InputProps,
                          }}
                          InputLabelProps={{
                            style: { fontSize: "10px", opacity: "0.75" },
                          }}
                        />
                      )}
                      PaperComponent={(props) => <Paper {...props} style={{ maxHeight: 300, fontSize: "12px" }} />}
                      renderOption={(props, option) => (
                        <li
                          {...props}
                          style={{
                            fontSize: "12px",
                            padding: "4px 4px 4px 6px",
                          }}
                        >
                          {option.name}
                        </li>
                      )}
                    />
                  ) : (
                    <Typography>{user ? toPascalCase(user.name) : "User"}</Typography>
                  )}
                </FormControl>
              )}
            </Grid>

            {/* Source */}
            <Grid item size={4}>
              <FormControl fullWidth style={{ marginLeft: "0px" }}>
                <Typography
                  className="subheader"
                  style={{
                    display: "inline",
                    marginBottom: "0.5rem",
                    marginLeft: "0rem",
                    marginRight: "0.8rem",
                    color: "#4F4949",
                  }}
                >
                  Designation <span className="required">*</span>
                </Typography>
                <Select
                  variant="outlined"
                  name="source"
                  value={formData.selectedSource}
                  onChange={handleSourceChange}
                  displayEmpty
                  style={{
                    height: "30px",
                    fontSize: "12px",
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                        width: 100,
                        fontSize: "12px",
                      },
                    },
                  }}
                >
                  <MenuItem disabled value="" style={{ fontSize: "12px", padding: "4px 4px 4px 6px" }}>
                    <em
                      style={{
                        height: "30px",
                        opacity: "0.75",
                        fontStyle: "normal",
                        fontFamily: "Poppins",
                      }}
                    >
                      Select Designation
                    </em>
                  </MenuItem>
                  {formData.sources.map((source) => (
                    <MenuItem
                      key={source.source_id}
                      value={source.source_id}
                      style={{ fontSize: "12px", padding: "4px 4px 4px 6px" }}
                    >
                      {source.source_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Learning Objective */}
            <Grid item size={4}>
              <FormControl fullWidth style={{ marginleft: "8px" }}>
                <Typography
                  className="subheader"
                  style={{
                    display: "inline",
                    marginBottom: "0.5rem",
                    color: "#4F4949",
                  }}
                >
                  Learning Objective <span className="required">*</span>
                </Typography>
                <Select
                  variant="outlined"
                  name="trainingObjective"
                  value={formData.selectedTrainingObjective}
                  onChange={handleTrainingObjectiveChange}
                  displayEmpty
                  style={{
                    height: "30px",
                    fontSize: "12px",
                  }}
                >
                  <MenuItem disabled value="" style={{ fontSize: "12px", padding: "4px 4px 4px 6px" }}>
                    <em
                      style={{
                        height: "30px",
                        opacity: "0.75",
                        fontStyle: "normal",
                        fontFamily: "Poppins",
                      }}
                    >
                      Select Learning Objective
                    </em>
                  </MenuItem>
                  {formData.trainingObjectives.map((objective) => (
                    <MenuItem
                      key={objective.training_id}
                      value={objective.training_id}
                      style={{ fontSize: "12px", padding: "4px 4px 4px 6px" }}
                    >
                      {objective.training_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Typography
            className="simpleHeading"
            style={{ fontWeight: "600", marginBottom: "0.2rem", paddingTop: "2rem" }}
          >
            Skilling For
          </Typography>
          <FormControl component="fieldset" style={{ marginBottom: "0.5rem" }}>
            <RadioGroup
              row
              name="trainingPurpose"
              value={formData.trainingPurpose}
              onChange={(e) => {
                // Only allow changes if role_id is 8 or 4
                if (user.role_id === 8 || user.role_id === 4) {
                  handleChange(e)
                }
              }}
            >
              <FormControlLabel
                value="prospect"
                control={<CustomRadio sx={{ "& .MuiSvgIcon-root": { color: "#707070" } }} />}
                label={
                  <Typography className="subheader" style={{ fontWeight: "600" }}>
                    Prospect
                  </Typography>
                }
                disabled={user.role_id !== 8 && user.role_id !== 4}
              />
              <FormControlLabel
                value="project"
                style={{ marginLeft: "20px" }}
                control={<CustomRadio sx={{ "& .MuiSvgIcon-root": { color: "#707070" } }} />}
                label={
                  <Typography className="project" style={{ fontWeight: "600" }}>
                    Existing Project
                  </Typography>
                }
                disabled={user.role_id !== 8 && user.role_id !== 4}
              />
            </RadioGroup>
          </FormControl>
          {formData.trainingPurpose === "prospect" ? (
            <Grid container spacing={5}>
              <Grid size={4}>
                <FormControl
                  fullWidth
                  style={{
                    display: "flex",
                    marginRight: "0.3rem",
                  }}
                >
                  <Typography
                    className="subheader"
                    style={{
                      display: "inline",
                      marginBottom: "0.5rem",
                      color: "#4F4949",
                    }}
                  >
                    Service Division <span className="required">*</span>
                  </Typography>
                  <Select
                    variant="outlined"
                    defaultValue=""
                    name="selectedServiceDivision"
                    value={formData.selectedServiceDivision}
                    onChange={handleChange}
                    displayEmpty
                    style={{ height: "30px", fontSize: "12px" }}
                  >
                    <MenuItem disabled value="" style={{ fontSize: "12px", padding: "4px 4px 4px 6px" }}>
                      <em
                        style={{
                          height: "30px",
                          opacity: "0.75",
                          fontStyle: "normal",
                          fontFamily: "Poppins",
                        }}
                      >
                        Select Service Division
                      </em>
                    </MenuItem>
                    {formData.services.map((service) => (
                      <MenuItem
                        key={service.id}
                        value={service.id}
                        style={{ fontSize: "12px", padding: "4px 4px 4px 6px" }}
                      >
                        {service.service_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={4}>
                <FormControl
                  fullWidth
                  style={{
                    display: "flex",
                    marginLeft: "0",
                    marginRight: "0.6rem",
                  }}
                >
                  <Typography
                    className="subheader"
                    style={{
                      display: "inline",
                      marginBottom: "0.5rem",
                      color: "#4F4949",
                    }}
                  >
                    Prospect Name <span className="required">*</span>
                  </Typography>
                  <Tooltip
                    title={formData.prospectNameErrorMessage}
                    open={formData.prospectNameError}
                    placement="bottom-end"
                    arrow
                  >
                    <TextField
                      variant="outlined"
                      placeholder="Enter Prospect"
                      name="prospectName"
                      value={formData.prospectName}
                      onChange={handleChange}
                      error={formData.prospectNameError}
                      InputProps={{
                        style: { fontSize: "12px" },
                      }}
                    />
                  </Tooltip>
                </FormControl>
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={5}>
              <Grid item size={4}>
                <FormControl fullWidth className="formControl" style={{ display: "flex", marginRight: "0.3rem" }}>
                  <Typography
                    className="subheader"
                    style={{ display: "inline", marginBottom: "0.5rem", color: "#4F4949" }}
                  >
                    Service Division <span className="required">*</span>
                  </Typography>
                  <Select
                    variant="outlined"
                    defaultValue=""
                    name="selectedServiceDivision"
                    value={formData.selectedServiceDivision}
                    onChange={handleChange}
                    displayEmpty
                    style={{ height: "30px", fontSize: "12px", minWidth: "100%" }}
                  >
                    <MenuItem disabled value="" style={{ fontSize: "12px", padding: "4px 4px 4px 6px" }}>
                      <em
                        style={{
                          height: "30px",
                          opacity: "0.75",
                          fontStyle: "normal",
                          width: "274px",
                          fontFamily: "Poppins",
                        }}
                      >
                        Select Service Division
                      </em>
                    </MenuItem>
                    {formData.services.map((service) => (
                      <MenuItem
                        key={service.id}
                        value={service.id}
                        style={{ fontSize: "12px", padding: "4px 4px 4px 6px" }}
                      >
                        {service.service_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item size={4}>
                <FormControl fullWidth className="formControl" style={{ display: "flex", marginRight: "0.6rem" }}>
                  <Typography
                    className="subheader"
                    style={{ display: "inline", marginBottom: "0.5rem", color: "#4F4949" }}
                  >
                    Project Name <span className="required">*</span>
                  </Typography>
                  <Select
                    variant="outlined"
                    name="prospectName"
                    value={formData.selectedProject}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        selectedProject: e.target.value === formData.selectedProject ? "" : e.target.value,
                      })
                    }
                    displayEmpty
                    style={{ height: "30px", fontSize: "12px", minWidth: "100%" }}
                  >
                    <MenuItem
                      disabled
                      value=""
                      style={{
                        fontSize: "12px",
                        padding: "4px 4px 4px 6px",
                        fontFamily: "Poppins",
                      }}
                    >
                      <em
                        style={{
                          height: "30px",
                          opacity: "0.75",
                          fontStyle: "normal",
                          fontFamily: "Poppins",
                        }}
                      >
                        Select Project
                      </em>
                    </MenuItem>
                    {formData.projects.map((project) => (
                      <MenuItem
                        key={project.ProjectID}
                        value={project.ProjectID}
                        style={{ fontSize: "10px", padding: "4px 4px 4px 6px", width: "100px" }}
                      >
                        {project.ProjectName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
          <Typography className="simpleHeading" style={{ fontWeight: "600", marginBottom: "1rem", paddingTop: "2rem" }}>
            Learning Details
          </Typography>

          <FormControl fullWidth marginBottom="1rem">
            <Grid container spacing={5}>
              {/* Date Field */}
              <Grid item size={4}>
                <FormControl fullWidth>
                  <Typography
                    className="subheader"
                    noWrap
                    style={{ display: "inline", marginBottom: "0.5rem", color: "#4F4949" }}
                  >
                    Expected completion Timeline <span className="required">*</span>
                  </Typography>
                  <TextField
                    className="availabledates"
                    type="date"
                    value={formData.selectedDate}
                    onChange={handleExpectedDateChange}
                    inputProps={{
                      min: new Date().toISOString().split("T")[0], // Set the minimum date to today
                    }}
                    sx={{
                      fontSize: "10px",
                      fontFamily: "Poppins",
                      letterSpacing: "-0.5px", // Reduce letter spacing
                      padding: "5px",
                      width: "160px",
                      "& input": {
                        fontSize: "14px",
                        color: "#787878",
                      },
                    }}
                  />
                </FormControl>
              </Grid>

              {/* Tech Stack Field */}
              <Grid item size={4}>
                <FormControl fullWidth>
                  <Typography
                    className="subheader"
                    noWrap
                    style={{
                      display: "inline",
                      marginBottom: "0.5rem",
                      color: "#4F4949",
                    }}
                  >
                    Tech Stack / Competency
                    <span className="required">*</span>
                  </Typography>
                  <Select
                    variant="outlined"
                    name="techStack"
                    value={formData.selectedTechStack}
                    onChange={handleTechStackChange}
                    displayEmpty
                    style={{
                      height: "30px",
                      fontSize: "12px",
                      fontStyle: "normal",
                    }}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                          fontSize: "12px",
                        },
                      },
                    }}
                  >
                    <MenuItem disabled value="" style={{ fontSize: "12px", padding: "4px 4px 4px 6px" }}>
                      <em
                        style={{
                          height: "30px",
                          opacity: "0.75",
                          color: "#4F4949",
                          fontStyle: "normal",
                          fontFamily: "Poppins",
                        }}
                      >
                        Select Tech Stack
                      </em>
                    </MenuItem>
                    {formData.techStacks.map((stack) => (
                      <MenuItem
                        key={stack.stack_id}
                        value={stack.stack_id}
                        style={{ fontSize: "12px", padding: "4px 4px 4px 6px" }}
                      >
                        {stack.stack_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Primary Skill Field */}
              <Grid item size={4}>
                <FormControl fullWidth>
                  <Typography
                    className="subheader"
                    noWrap
                    style={{
                      display: "inline",
                      marginBottom: "0.5rem",
                      marginRight: "100px",
                      color: "#4F4949",
                    }}
                  >
                    Primary Skill
                    <span className="required">*</span>
                  </Typography>
                  <Select
                    variant="outlined"
                    name="primarySkill"
                    value={formData.selectedPrimarySkill}
                    SelectDisplayProps={{ style: { fontSize: "12px" } }}
                    onChange={(e) => {
                      const selectedSkills = e.target.value
                      setFormData({
                        ...formData,
                        selectedPrimarySkill: selectedSkills,
                      })
                    }}
                    style={{
                      height: "30px",
                      fontSize: "12px",
                      opacity: 1,
                      marginLeft: "0px",
                    }}
                  >
                    <MenuItem disabled value="" style={{ fontSize: "12px", padding: "4px 4px 4px 6px" }}>
                      <em style={{ height: "30px", opacity: "1", fontStyle: "normal", fontFamily: "Poppins" }}>
                        Select rimary Skill
                      </em>
                    </MenuItem>
                    {formData.primarySkills.map((skill) => (
                      <MenuItem
                        key={skill.skill_id}
                        value={skill.skill_id}
                        style={{ fontSize: "12px", padding: "4px 4px 4px 6px" }}
                      >
                        {skill.skill_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </FormControl>

          <Grid container spacing={5} marginTop="1rem">
            {/* Other Skills Field */}
            <Grid item size={4}>
              <FormControl fullWidth>
                <Typography
                  className="subheader"
                  style={{ display: "inline", marginBottom: "0.5rem", color: "#4F4949", maxWidth: "400px" }}
                >
                  Enter any other relevant information<span className="required">*</span>
                </Typography>
                <ReactQuill
                  value={formData.otherSkill}
                  onChange={handleOtherSkillChange}
                  modules={{
                    toolbar: [["bold", "italic", "underline"]],
                  }}
                  // placeholder="Other Skill Details should be less than 1000 words"
                  style={{
                    height: "138px",
                    fontStyle: "normal",
                    fontFamily: "Poppins",
                    marginTop: "0.5rem",
                    maxWidth: "100%",
                  }}
                />
              </FormControl>
            </Grid>

            {/* Completion Criteria Field */}
            <Grid item size={4}>
              <FormControl fullWidth>
                <Typography
                  className="subheader"
                  style={{ display: "inline", marginBottom: "0.5rem", color: "#4F4949", maxWidth: "400px" }}
                >
                  Expected completion criteria <span className="required">*</span>
                </Typography>
                <ReactQuill
                  value={formData.completionCriteria}
                  onChange={handleCompletionCriteriaChange}
                  modules={{
                    toolbar: [["bold", "italic", "underline"]],
                  }}
                  placeholder="Suggest Completion criteria should be less than 1000 words"
                  style={{
                    height: "138px",
                    maxWidth: "100%",
                    marginTop: "0.5rem",
                    fontStyle: "normal",
                    fontFamily: "Poppins",
                  }}
                />
              </FormControl>
            </Grid>

            {/* Comments Field */}
            <Grid item size={4}>
              <FormControl fullWidth>
                <Typography
                  className="subheader"
                  style={{ marginBottom: "0.1rem", color: "#4F4949", maxWidth: "400px", display: "inline" }}
                >
                  Desired Impact<span className="required">*</span>
                </Typography>
                <ReactQuill
                  value={formData.comment}
                  onChange={handleCommentsChange}
                  modules={{
                    toolbar: [["bold", "italic", "underline"]],
                  }}
                  placeholder="Comments should be less than 350 words"
                  style={{
                    height: "138px",
                    maxWidth: "100%",
                    marginTop: "0.5rem",
                  }}
                />
              </FormControl>
            </Grid>
          </Grid>

          <Typography
            className="simpleHeading"
            style={{ fontWeight: "600", marginBottom: "0.5rem", marginTop: "80px" }}
          >
            Employee Details
            <p style={{ fontWeight: "300", color: "#4F4949", fontSize: "10px", marginTop: "2px" }}>
              Employees with up to 3 ongoing learnings cannot be included in this learning request
            </p>
          </Typography>
          <FormControl component="fieldset" className="formControl" style={{ marginBottom: "0.5rem" }}>
            {role === "CapDev" && (
              <RadioGroup row name="employeeDetails" value={formData.employeeDetails} onChange={handleChange}>
                <FormControlLabel
                  value="add"
                  control={<CustomRadio sx={{ "& .MuiSvgIcon-root": { color: "#707070" } }} />}
                  label={
                    <Typography className="subheader" style={{ fontWeight: "600" }}>
                      Add Employees
                    </Typography>
                  }
                />{" "}
                {/* {role === "CapDev" && ( */}
                <FormControlLabel
                  value="open"
                  control={<CustomRadio sx={{ "& .MuiSvgIcon-root": { color: "#707070" } }} />}
                  label={
                    <Typography className="subheader" style={{ fontWeight: "600" }}>
                      Place an Open Request
                    </Typography>
                  }
                />
              </RadioGroup>
            )}
          </FormControl>

          <Grid container spacing={5} style={{ gap: "10px" }}>
            {/* Employee Select Section */}
            <Grid item size={4}>
              <FormControl fullWidth>
                <Typography
                  className="subheader"
                  style={{ display: "inline", marginBottom: "0.5rem", color: "#4F4949" }}
                >
                  Select Employee <span className="required">*</span>
                </Typography>

                <Autocomplete
                  options={searchResults}
                  getOptionLabel={(option) => option.name || ""}
                  getOptionDisabled={(option) =>
                    formData.employeeDetails === "open"
                      ? option.totalPrimarySkills >= 1
                      : option.totalPrimarySkills >= 3
                  }
                  onInputChange={handleEmployeeSearch}
                  onChange={(event, value) => {
                    if (
                      (formData.employeeDetails === "open" && value && value.totalPrimarySkills < 1) ||
                      (formData.employeeDetails === "add" && value && value.totalPrimarySkills < 3)
                    ) {
                      setSelectedEmployee(value)
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      placeholder="Search Employees"
                      helperText={
                        formData.employeeDetails === "open"
                          ? "Employees with 1+ ongoing learnings cannot be selected"
                          : "Employees with 3+ ongoing learnings cannot be selected"
                      }
                      InputProps={{
                        ...params.InputProps,
                        style: { fontSize: "12.5px" },
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li
                      {...props}
                      style={{
                        opacity:
                          formData.employeeDetails === "open"
                            ? option.totalPrimarySkills >= 1
                              ? 0.5
                              : 1
                            : option.totalPrimarySkills >= 3
                              ? 0.5
                              : 1,
                        pointerEvents:
                          formData.employeeDetails === "open"
                            ? option.totalPrimarySkills >= 1
                              ? "none"
                              : "auto"
                            : option.totalPrimarySkills >= 3
                              ? "none"
                              : "auto",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px",
                        fontSize: "12px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Avatar src={option.profileImage} style={{ width: 24, height: 24 }} />
                        <span>{option.name}</span>
                      </div>

                      {option.totalPrimarySkills > 0 && (
                        <span
                          style={{
                            backgroundColor:
                              option.totalPrimarySkills >= 3
                                ? "#ffebee"
                                : option.totalPrimarySkills === 1
                                  ? "#fbfbd3"
                                  : "#fbfbd3",
                            borderRadius: "12px",
                            padding: "4px 8px",
                            fontSize: "10px",
                            color: option.totalPrimarySkills >= 3 ? "#c62828" : "#000000",
                          }}
                        >
                          {option.totalPrimarySkills} learnings
                        </span>
                      )}
                    </li>
                  )}
                  PaperComponent={(props) => (
                    <Paper
                      {...props}
                      style={{
                        maxHeight: 300,
                        fontSize: "12px",
                      }}
                    />
                  )}
                />
              </FormControl>
            </Grid>

            {formData.employeeDetails === "add" && (
              <Grid item>
                <Typography
                  className="subheader"
                  align="center"
                  style={{ marginTop: "32px", color: "#4F4949", fontSize: "12px" }}
                >
                  OR
                </Typography>
              </Grid>
            )}

            {/* Email Input Section */}
            {formData.employeeDetails === "add" && (
              <Grid item size={4}>
                <FormControl fullWidth>
                  <Typography
                    className="subheader"
                    style={{ display: "inline", marginBottom: "0.5rem", color: "#4F4949" }}
                  >
                    Enter comma(,) separated email ids <span className="required">*</span>
                  </Typography>
                  <TextField
                    variant="outlined"
                    name="emails"
                    placeholder="Enter Email by , separated"
                    value={formData.emails}
                    onChange={handleChange}
                    InputProps={{
                      style: { fontSize: "12.5px" },
                    }}
                  />
                </FormControl>
              </Grid>
            )}

            {/* Add Employee Button */}
            <Grid item>
              <Box display="flex" justifyContent="flex-end" marginTop="1.7rem">
                <Button
                  className="btn"
                  variant="contained"
                  onClick={addEmployee}
                  sx={{
                    height: "31px",
                    fontSize: "21px",
                    fontWeight: "500",
                    minWidth: "40px",
                    backgroundColor: "white",
                    color: "#1C71FE",
                    boxShadow: "none",
                    border: "0.5px solid #1C71FE",
                    marginLeft: "10px",
                  }}
                >
                  +
                </Button>
              </Box>
            </Grid>

            {formData.employeeDetails === "open" && (
              <Grid item>
                <Typography
                  className="subheader"
                  align="center"
                  style={{ marginTop: "32px", color: "#4F4949", fontSize: "12px" }}
                >
                  OR
                </Typography>
              </Grid>
            )}

            {/* Employee Level Section */}
            {formData.employeeDetails === "open" && role === "CapDev" && (
              <Grid item size={4}>
                <FormControl fullWidth className="formControl">
                  <Typography
                    className="subheader"
                    style={{ display: "inline", marginBottom: "0.5rem", color: "#4F4949" }}
                  >
                    Employee Level <span className="required">*</span>
                  </Typography>
                  <Select
                    variant="outlined"
                    name="employeeLevel"
                    value={formData.selectedEmployeeLevel}
                    onChange={(e) => setFormData({ ...formData, selectedEmployeeLevel: e.target.value })}
                    style={{ height: "30px", fontSize: "12px" }}
                    multiple // Allow multiple selections
                  >
                    <MenuItem value="">
                      <em>Select Employee Level</em>
                    </MenuItem>
                    {formData.employeeLevels.map((level) => (
                      <MenuItem key={level.id} value={level.id}>
                        {level.job_title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Add Employees by Level Button */}
            {formData.employeeDetails === "open" && role === "CapDev" && (
              <Grid item>
                <Box display="flex" justifyContent="flex-end" marginTop="1.7rem">
                  <Button
                    className="btn"
                    variant="contained"
                    onClick={addEmployeesByLevel}
                    sx={{
                      height: "31px",
                      fontSize: "21px",
                      fontWeight: "500",
                      minWidth: "40px",
                      backgroundColor: "white",
                      color: "#1C71FE",
                      boxShadow: "none",
                      border: "0.5px solid #1C71FE",
                      marginLeft: "10px",
                    }}
                  >
                    +
                  </Button>
                </Box>
              </Grid>
            )}
            {/* Table for Employees */}
            {formData.showTable && (
              <Grid item size={12} style={{ boxShadow: "none" }}>
                <TableContainer component={Paper} className="tableContainer">
                  <Table size="smaller">
                    <TableHead className="head">
                      <TableRow style={{ height: "40px", backgroundColor: "#CCE3FF" }}>
                        <TableCell className="tableHeader">Employee ID</TableCell>
                        <TableCell className="tableHeader">Name</TableCell>
                        <TableCell className="tableHeader">Available From</TableCell>
                        <TableCell className="tableHeader">Daily Bandwidth</TableCell>
                        <TableCell className="tableHeader">Available on Weekend?</TableCell>
                        <TableCell className="tableHeader">Actions</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell></TableCell>
                        <TableCell>
                          <Box display="flex" justifyContent="flex-end" marginBottom="1rem">
                            <TextField
                              variant="outlined"
                              placeholder="Search Employees"
                              value={formData.searchQuery}
                              onChange={(e) => setFormData({ ...formData, searchQuery: e.target.value })}
                              style={{ fontSize: "12px", width: "200px", marginTop: "16px" }}
                              InputProps={{
                                style: { fontSize: "12.5px", color: "#4F4949" },
                              }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <TextField
                            className="availabledates"
                            type="date"
                            value={formData.availableFromDate}
                            onChange={availableFromDateChange}
                            inputProps={{
                              min: new Date().toISOString().split("T")[0],
                            }}
                            sx={{
                              fontSize: "10px",
                              fontFamily: "Poppins",
                              letterSpacing: "-0.5px",
                              padding: "5px",
                              width: "160px",
                              "& input": {
                                fontSize: "14px",
                                color: "#4F4949",
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={formData.updateAllBandwidth || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                updateAllBandwidth: e.target.value,
                              })
                            }
                            displayEmpty
                            size="small"
                            sx={{
                              fontSize: "10px",
                              fontFamily: "Poppins",
                              letterSpacing: "-0.5px",
                              padding: "5px",
                              color: "#4F4949",
                            }}
                          >
                            <MenuItem value="" disabled>
                              Select
                            </MenuItem>
                            <MenuItem value="2 Hours">2 Hours</MenuItem>
                            <MenuItem value="4 Hours">4 Hours</MenuItem>
                            <MenuItem value="6 Hours">6 Hours</MenuItem>
                            <MenuItem value="Full Day">Full Day</MenuItem>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <RadioGroup
                            row
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                updateAllWeekend: e.target.value,
                              })
                            }
                          >
                            <FormControlLabel value="Yes" control={<Radio size="small" color=" " />} label="Yes" />
                            <FormControlLabel value="No" control={<Radio size="small" color=" " />} label="No" />
                          </RadioGroup>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            style={{
                              textTransform: "none",
                              padding: "5px",
                              backgroundColor: "#066DD2",
                            }}
                            onClick={() =>
                              updateAllEmployees({
                                availableFrom: formData.availableFromDate,
                                bandwidth: formData.updateAllBandwidth,
                                weekend: formData.updateAllWeekend,
                              })
                            }
                            size="small"
                          >
                            Update All
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody sx={{ borderBottom: "1px solid #EAEAEA" }}>
                      {formData.employees
                        .filter((employee) => employee.name.toLowerCase().includes(formData.searchQuery.toLowerCase()))
                        .slice(
                          formData.page * formData.rowsPerPage,
                          formData.page * formData.rowsPerPage + formData.rowsPerPage,
                        )
                        .map((employee) => {
                          const isExpanded = expandedEmpId === employee.id
                          const hasActiveLearning = employee.total_requests > 0

                          return (
                            <React.Fragment key={employee.uniqueKey}>
                              <TableRow
                                sx={{
                                  "& > *": { borderBottom: isExpanded ? "unset" : undefined },
                                  borderBottom: "1px solid #EAEAEA",
                                }}
                              >
                                <TableCell>
                                  {employee.id}
                                  {hasActiveLearning && (
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        mt: 0.5,
                                        backgroundColor: "#FFFFE6",
                                      }}
                                    >
                                      <IconButton
                                        size="small"
                                        onClick={() => handleToggleEmpExpand(employee.id)}
                                        sx={{ padding: "0", marginRight: "4px" }}
                                      >
                                        {isExpanded ? (
                                          <KeyboardArrowUp fontSize="small" />
                                        ) : (
                                          <KeyboardArrowDown
                                            fontSize="small"
                                            sx={{ border: "1px solid black", borderRadius: "50%" }}
                                          />
                                        )}
                                      </IconButton>
                                      <Typography
                                        variant="caption"
                                        sx={{ color: "#000000", fontWeight: 500, fontSize: "10px !important" }}
                                      >
                                        {employee.total_requests} learning is in progress
                                      </Typography>
                                    </Box>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#4F4949" }}>
                                    <Avatar src={employee.profileImage} sx={{ width: 32, height: 32 }} />
                                    {employee.name}
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <TextField
                                    type="date"
                                    value={employee.availableFrom || ""}
                                    onChange={(e) => updateEmployee(employee.id, "availableFrom", e.target.value)}
                                    size="small"
                                    inputProps={{
                                      min: new Date().toISOString().split("T")[0],
                                    }}
                                    sx={{
                                      fontSize: "10px",
                                      fontFamily: "Poppins",
                                      letterSpacing: "-0.5px",
                                      padding: "5px",
                                      width: "160px",
                                      "& input": { fontSize: "14px", color: "#4F4949" },
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Select
                                    value={employee.bandwidth || ""}
                                    onChange={(e) => updateEmployee(employee.id, "bandwidth", e.target.value)}
                                    size="small"
                                    displayEmpty
                                    sx={{
                                      fontSize: "10px",
                                      fontFamily: "Poppins",
                                      letterSpacing: "-0.5px",
                                      padding: "5px",
                                      color: "#4F4949",
                                    }}
                                  >
                                    <MenuItem value="" disabled>
                                      Select
                                    </MenuItem>
                                    <MenuItem value="2 Hours">2 Hours</MenuItem>
                                    <MenuItem value="4 Hours">4 Hours</MenuItem>
                                    <MenuItem value="6 Hours">6 Hours</MenuItem>
                                    <MenuItem value="Full Day">Full Day</MenuItem>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  <RadioGroup
                                    row
                                    value={employee.weekend || ""}
                                    onChange={(e) => updateEmployee(employee.id, "weekend", e.target.value)}
                                  >
                                    <FormControlLabel
                                      value="Yes"
                                      control={<Radio size="small" color=" " />}
                                      label="Yes"
                                    />
                                    <FormControlLabel
                                      value="No"
                                      control={<Radio size="small" color=" " />}
                                      label="No"
                                    />
                                  </RadioGroup>
                                </TableCell>
                                <TableCell>
                                  <IconButton color="error" onClick={() => removeEmployee(employee.id)} size="small">
                                    <CloseIcon />
                                  </IconButton>
                                </TableCell>
                              </TableRow>

                              {isExpanded && hasActiveLearning && (
                                <TableRow sx={{ backgroundColor: "#FFFFE6" }}>
                                  <TableCell colSpan={6} style={{ padding: 0 }}>
                                    <Box sx={{ padding: "8px 16px 16px 40px" }}>
                                      <Grid container spacing={4} justifyContent="center">
                                        <Grid item xs={2} sx={{ textAlign: "center" }}>
                                          <Typography variant="caption" sx={{ color: "#4F4949" }}>
                                            Req No:
                                          </Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            #{employee.requests?.[0]?.requestid || "231"}
                                          </Typography>
                                        </Grid>
                                        <Grid item xs={2} sx={{ textAlign: "center" }}>
                                          <Typography variant="caption" sx={{ color: "#4F4949" }}>
                                            Project
                                          </Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {employee.requests?.[0]?.project_name || "Staffing Nation"}
                                          </Typography>
                                        </Grid>
                                        <Grid item xs={2} sx={{ textAlign: "center" }}>
                                          <Typography variant="caption" sx={{ color: "#4F4949" }}>
                                            Objective
                                          </Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {employee.requests?.[0]?.training_objective || "Upskilling"}
                                          </Typography>
                                        </Grid>
                                        <Grid item xs={2} sx={{ textAlign: "center" }}>
                                          <Typography variant="caption" sx={{ color: "#4F4949" }}>
                                            Tech Stack
                                          </Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {employee.requests?.[0]?.tech_stacks || "React"}
                                          </Typography>
                                        </Grid>
                                        <Grid item xs={4} sx={{ textAlign: "center" }}>
                                          <Typography variant="caption" sx={{ color: "#4F4949" }}>
                                            Requested on
                                          </Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {employee.requests?.[0]?.createddate
                                              ? new Date(employee.requests[0].createddate).toLocaleDateString("en-US", {
                                                  year: "numeric",
                                                  month: "short",
                                                  day: "numeric",
                                                })
                                              : "Jan 20, 2025"}
                                          </Typography>
                                        </Grid>
                                      </Grid>
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              )}
                            </React.Fragment>
                          )
                        })}
                    </TableBody>
                  </Table>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={formData.employees.length}
                    rowsPerPage={formData.rowsPerPage}
                    page={formData.page}
                    onPageChange={(e, newPage) => setFormData({ ...formData, page: newPage })}
                    onRowsPerPageChange={(e) =>
                      setFormData({
                        ...formData,
                        rowsPerPage: Number.parseInt(e.target.value, 10),
                        page: 0,
                      })
                    }
                  />
                </TableContainer>
              </Grid>
            )}

            {/* No Employees Message */}
            {!formData.showTable && (
              <Grid item size={12}>
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  style={{
                    width: "100%",
                    height: "300px",
                    border: "1px",
                    backgroundColor: "#F5F5F5",
                    marginBottom: "-44px",
                  }}
                >
                  <Typography>
                    <div style={{ fontSize: "14px", color: "#000000", textAlign: "center" }}>No employees added.</div>
                    <div style={{ fontSize: "10px", color: "#000000" }}>Select employees for the learning request.</div>
                  </Typography>
                </Box>
              </Grid>
            )}

            {/* Summary */}
            {formData.showSummary && (
              <Grid item xs={12}>
                <Typography style={{ marginTop: "-30px" }}>
                  Total employees selected: {formData.employees.length}
                  {formData.invalidEmails.length > 0 && <span> (Invalid emails: {formData.invalidEmails.length})</span>}
                </Typography>
              </Grid>
            )}
          </Grid>
          <Box className="buttonGroup  ButtonBox">
            <Button
              variant="outlined"
              style={{
                minWidth: "12px",

                textTransform: "none",
                color: "#1C71FE",
                boxShadow: "none",
                border: "none",
              }}
              onClick={() => navigate("/training-container")} // Add this line
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              style={{
                minWidth: "120px",

                textTransform: "none",
                borderRadius: "10px ",
                backgroundColor: isFormValid ? "#066DD2" : "#BFBFBF", // Change color based on validity
                boxShadow: "none",
                color: isFormValid ? "white" : "#8c8c8c", // Change text color based on validity
              }}
              onClick={handleSubmit}
              disabled={!isFormValid}
            >
              Submit
            </Button>
          </Box>
        </Paper>
      </Paper>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          style: {
            padding: "10px",
            borderRadius: "8px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          },
        }}
      >
        <DialogTitle
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontSize: "24px",
          }}
        >
          <CheckCircleIcon style={{ color: "green", fontSize: "3rem", marginBottom: "10px" }} />
          Request generated successfully with request number :
          <strong style={{ fontSize: "18px", color: "#333" }}>{newRequestId}</strong>.
          <IconButton
            onClick={handleCloseDialog}
            style={{
              position: "absolute",
              right: "10px",
              top: "10px",
              padding: "0",
            }}
          >
            <CloseIcon style={{ fontSize: "1.5rem" }} />
          </IconButton>
        </DialogTitle>
      </Dialog>
    </LocalizationProvider>
  )
}
export default NewTrainingRequest

