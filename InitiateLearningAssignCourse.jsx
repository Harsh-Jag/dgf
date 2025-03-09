// components/CapDevInitiateLearningAssignCourse.jsx
import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Avatar,
  IconButton,
  Pagination,
  PaginationItem,
  CircularProgress,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import { KeyboardArrowDown, KeyboardArrowUp, NavigateBefore, NavigateNext } from "@mui/icons-material"
import { useParams } from "react-router-dom"
import { arrayBufferToBase64 } from "../../utils/ImgConveter"
import AssignCourseModal from "./AssignCourseModal"

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  "& .MuiTableCell-root": {
    padding: "16px",
    textAlign: "center",
    fontFamily: "inherit",
  },
  "& .MuiTableCell-root:first-of-type": {
    paddingRight: "0px !important",
    fontFamily: "inherit",
  },
  "& .MuiTableCell-root:nth-of-type(2)": {
    paddingLeft: "0px !important",
    fontFamily: "inherit",
  },
}))

const HeaderButton = styled(Button)(({ theme }) => ({
  height: "30px",
  fontSize: "10px",
  textTransform: "none",
  fontFamily: "inherit",
  padding: "8px 10px",
  backgroundColor: "#fff",
  color: "#666",
  border: "1px solid #ddd",
  borderRadius: "6px",
  "&:hover": {
    backgroundColor: "#f5f5f5",
  },
}))

const StatusText = styled(Typography)(({ theme }) => ({
  color: "#B33A3A",
  fontWeight: 500,
}))

const ExpandedSection = styled(Box)(({ theme }) => ({
  padding: "0 220px 16px 20px",
}))

function Row({ row, isExpanded, isSelected, onToggleExpand, onSelect, onAssignCourse }) {
  const rowBackgroundColor = isExpanded ? "#F1F2FD" : "white"
  // Determine if the employee has active learning based on request_org_level
  const hasActiveLearning = row.request_org_level === 1 ? row.total_requests > 0 : row.total_primary_skills > 0

  return (
    <>
      <TableRow
        sx={{
          "& > *": { borderBottom: "none" },
          backgroundColor: rowBackgroundColor,
        }}
      >
        <TableCell padding="checkbox">
          {hasActiveLearning && (
            <IconButton onClick={() => onToggleExpand(row.emp_id)}>
              {isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          )}
        </TableCell>
        <TableCell padding="checkbox">
          <Checkbox checked={isSelected} onChange={onSelect} color="primary" />
        </TableCell>
        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar alt={row.emp_name} src={row.profile_image} />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography>{row.emp_name}</Typography>
              {hasActiveLearning && (
                <Typography
                  variant="caption"
                  sx={{
                    backgroundColor: "#FFF3E0",
                    color: "#EF6C00",
                    borderRadius: "4px",
                    padding: "2px 8px",
                    fontSize: "0.75rem",
                  }}
                >
                  {row.request_org_level === 1 ? row.total_requests : row.total_primary_skills} Learning
                  {(row.request_org_level === 1 ? row.total_requests : row.total_primary_skills) !== 1 ? "s" : ""} in
                  Progress
                </Typography>
              )}
            </Box>
          </Box>
        </TableCell>
        <TableCell align="center">{row.courses_assigned}</TableCell>
        <TableCell align="center">{new Date(row.availablefrom).toLocaleDateString()}</TableCell>
        <TableCell align="center">{row.dailyband}</TableCell>
        <TableCell align="center">{row.availableonweekend === 1 ? "Yes" : "No"}</TableCell>
        <TableCell align="center">
          <StatusText>Initiate Learning</StatusText>
        </TableCell>
        <TableCell align="center">
          <HeaderButton onClick={onAssignCourse}>Assign Course</HeaderButton>
        </TableCell>
      </TableRow>
      {isExpanded && hasActiveLearning && (
        <TableRow sx={{ backgroundColor: "#F1F2FD" }}>
          <TableCell colSpan={9} padding="0">
            <ExpandedSection>
              <Table size="small" aria-label="details">
                <TableHead>
                  <TableRow>
                    <TableCell>Req No:</TableCell>
                    <TableCell>Project</TableCell>
                    <TableCell>Objective</TableCell>
                    <TableCell>Tech Stack</TableCell>
                    <TableCell>Requested on</TableCell>
                    <TableCell>Assigned by</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.requests?.map((request, index) => (
                    <TableRow key={index}>
                      <TableCell>#{request.requestid}</TableCell>
                      <TableCell>{request.project_name}</TableCell>
                      <TableCell>{request.training_objective}</TableCell>
                      <TableCell>{request.tech_stacks}</TableCell>
                      <TableCell>
                        {new Date(request.createddate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell>{request.requested_by || "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ExpandedSection>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

function CourseTracker() {
  const [expandedId, setExpandedId] = useState(null)
  const [page, setPage] = useState(1)
  const [learners, setLearners] = useState([])
  const [selectedEmployees, setSelectedEmployees] = useState([])
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [requestOrgLevel, setRequestOrgLevel] = useState(0)
  const { requestId } = useParams()
  const rowsPerPage = 5
  const totalRecords = 15

  useEffect(() => {
    const fetchLearners = async () => {
      try {
        setLoading(true)
        // Fetch employees for the training request
        const response = await fetch(
          `http://localhost:8000/api/getEmpNewTrainingRequested/getEmpNewTrainingRequested/?requestid=${requestId}`,
        )
        const data = await response.json()

        // Set the request_org_level from the response
        if (data && data.length > 0 && "request_org_level" in data) {
          setRequestOrgLevel(data.request_org_level)
        }

        // Process each employee to get their learning details
        const learnersWithDetails = await Promise.all(
          data.employees
            ? data.employees.map(async (learner) => {
                try {
                  // Choose API endpoint based on request_org_level
                  const apiEndpoint =
                    data.request_org_level === 1
                      ? `http://localhost:8000/api/orgLevelLearners/getOrgLevelLearnerData/${learner.emp_id}`
                      : `http://localhost:8000/api/learners/getLearners/${learner.emp_id}`

                  const detailsResponse = await fetch(apiEndpoint)
                  const detailsData = await detailsResponse.json()

                  return {
                    ...learner,
                    profile_image: learner.profile_image?.data
                      ? `data:image/jpeg;base64,${arrayBufferToBase64(learner.profile_image.data)}`
                      : null,
                    requests: detailsData.requests || [],
                    total_requests: detailsData.total_requests || 0,
                    total_primary_skills: detailsData.total_primary_skills || 0,
                    request_org_level: data.request_org_level,
                  }
                } catch (error) {
                  console.error(`Error fetching details for ${learner.emp_id}:`, error)
                  return {
                    ...learner,
                    request_org_level: data.request_org_level,
                  }
                }
              })
            : [],
        )

        setLearners(learnersWithDetails)
      } catch (error) {
        console.error("Error fetching learners:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLearners()
  }, [requestId])

  const handleToggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const handleSelectEmployee = (empId) => {
    setSelectedEmployees((prev) => (prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]))
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  return (
    <Box
      sx={{
        backgroundColor: "#FFFFFF",
        borderRadius: "16px",
        padding: 3,
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
        position: "relative",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          Assign Courses & Track the Learning Progress
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <HeaderButton>Send Reminder</HeaderButton>
          <HeaderButton onClick={() => setShowAssignModal(true)} disabled={selectedEmployees.length === 0}>
            Assign Course
          </HeaderButton>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <StyledTableContainer component={Paper}>
            <Table aria-label="collapsible table">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#FAFAFA" }}>
                  <TableCell width="48px" />
                  <TableCell padding="checkbox" width="48px" />
                  <TableCell>Name</TableCell>
                  <TableCell align="center">Courses Assigned</TableCell>
                  <TableCell align="center">Available From</TableCell>
                  <TableCell align="center">Daily Bandwidth</TableCell>
                  <TableCell align="center">Weekend Availability</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {learners.map((row) => (
                  <Row
                    key={row.emp_id}
                    row={row}
                    isExpanded={expandedId === row.emp_id}
                    isSelected={selectedEmployees.includes(row.emp_id)}
                    onToggleExpand={handleToggleExpand}
                    onSelect={() => handleSelectEmployee(row.emp_id)}
                    onAssignCourse={() => {
                      setSelectedEmployees([row.emp_id])
                      setShowAssignModal(true)
                    }}
                  />
                ))}
              </TableBody>
            </Table>
          </StyledTableContainer>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2, px: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Showing {Math.min(learners.length, rowsPerPage)} of {learners.length} records
            </Typography>
            <Pagination
              count={Math.ceil(learners.length / rowsPerPage)}
              page={page}
              onChange={handleChangePage}
              renderItem={(item) => (
                <PaginationItem slots={{ previous: NavigateBefore, next: NavigateNext }} {...item} />
              )}
            />
          </Box>
        </>
      )}

      <AssignCourseModal
        open={showAssignModal}
        onClose={() => {
          setShowAssignModal(false)
          setSelectedEmployees([])
        }}
        employeeIds={selectedEmployees}
        requestId={requestId}
        requestOrgLevel={requestOrgLevel}
      />
    </Box>
  )
}

export default CourseTracker

