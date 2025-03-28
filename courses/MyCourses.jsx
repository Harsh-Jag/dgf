"use client"

import { useState, useEffect, useContext } from "react"
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Box,
  CircularProgress,
  Divider,
  Paper,
  Avatar,
  LinearProgress,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import { School, Schedule, Person, CalendarMonth, Info } from "@mui/icons-material"
import axios from "axios"
import AuthContext from "../Auth/AuthContext"

// Styled components
const MainContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: "16px",
  backgroundColor: "#ffffff",
  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}))

const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.3s, box-shadow 0.3s",
  borderRadius: "12px",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[10],
  },
}))

const CourseTitle = styled(Typography)(({ theme }) => ({
  fontWeight: "bold",
  display: "-webkit-box",
  WebkitLineClamp: 4,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  textOverflow: "ellipsis",
  minHeight: "96px", // Approximately 4 lines of text
  lineHeight: "1.2",
}))

const StatusChip = styled(Chip)(({ theme, status }) => {
  let backgroundColor = "#e0f7fa" // Default light blue pastel

  if (status === "Completed") {
    backgroundColor = "#e8f5e9" // Light green pastel
  } else if (status === "Incomplete") {
    backgroundColor = "#fff8e1" // Light amber pastel
  }

  return {
    backgroundColor,
    color: "rgba(0, 0, 0, 0.87)", // Black text
    fontWeight: "bold",
    "& .MuiChip-label": {
      padding: "0 12px",
    },
  }
})

const InfoItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: theme.spacing(1),
  "& svg": {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
}))

const EmptyState = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  textAlign: "center",
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  marginTop: theme.spacing(4),
}))

// Add this new styled component for the progress bar
const ProgressWrapper = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
}))

const MyCourses = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useContext(AuthContext)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Use the employee ID from the logged-in user or a default for testing
        const employeeId = user?.employee_id || "HS1889"
        const response = await axios.get(`http://localhost:8000/api/employee-courses/${employeeId}`)
        setCourses(response.data.data || [])
        setLoading(false)
      } catch (err) {
        console.error("Error fetching courses:", err)
        setError("Failed to load courses. Please try again later.")
        setLoading(false)
      }
    }

    fetchCourses()
  }, [user])

  // Format date to a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Render loading state
  if (loading) {
    return (
      <Container maxWidth="lg">
        <MainContainer>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress />
          </Box>
        </MainContainer>
      </Container>
    )
  }

  // Render error state
  if (error) {
    return (
      <Container maxWidth="lg">
        <MainContainer>
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={6}>
            <Info color="error" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" color="error" gutterBottom>
              Error Loading Courses
            </Typography>
            <Typography variant="body1">{error}</Typography>
          </Box>
        </MainContainer>
      </Container>
    )
  }

  // Render empty state
  if (courses.length === 0) {
    return (
      <Container maxWidth="lg">
        <MainContainer>
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={6}>
            <School sx={{ fontSize: 60, mb: 2, color: "primary.main" }} />
            <Typography variant="h5" gutterBottom>
              No Courses Assigned
            </Typography>
            <Typography variant="body1">You don't have any courses assigned to you at the moment.</Typography>
          </Box>
        </MainContainer>
      </Container>
    )
  }

  // Render courses
  return (
    <Container maxWidth="lg">
      <MainContainer>
        <Box mb={4}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: "bold" }}>
            My Courses
          </Typography>
          <Divider sx={{ mb: 3, borderColor: "primary.light", borderWidth: 2 }} />
        </Box>

        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid item xs={12} md={6} lg={4} key={course.assignment_id}>
              <StyledCard elevation={3}>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      <School />
                    </Avatar>
                  }
                  title={
                    <CourseTitle variant="h6" component="div">
                      {course.course_name}
                    </CourseTitle>
                  }
                  subheader={course.coursetype_name}
                  sx={{ pb: 1 }}
                />

                <Divider />

                <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                  <Box mb={2}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      dangerouslySetInnerHTML={{ __html: course.course_description }}
                    />
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" fontWeight="medium">
                      Status:
                    </Typography>
                    <StatusChip label={course.status} status={course.status} size="small" />
                  </Box>

                  <ProgressWrapper>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2" fontWeight="medium">
                        Progress:
                      </Typography>
                      <Typography variant="body2">{course.progress}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={course.progress}
                      sx={{
                        height: 8,
                        borderRadius: 5,
                        backgroundColor: "rgba(0, 0, 0, 0.08)",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: course.status === "Completed" ? "success.main" : "primary.main",
                        },
                      }}
                    />
                  </ProgressWrapper>

                  <InfoItem>
                    <Person />
                    <Typography variant="body2">
                      <strong>Mentor:</strong> {course.mentor_name}
                    </Typography>
                  </InfoItem>

                  <InfoItem>
                    <CalendarMonth />
                    <Typography variant="body2">
                      <strong>Assigned:</strong> {formatDate(course.assigned_date)}
                    </Typography>
                  </InfoItem>

                  <InfoItem>
                    <Schedule />
                    <Typography variant="body2">
                      <strong>Due Date:</strong> {formatDate(course.completion_date)}
                    </Typography>
                  </InfoItem>

                  <InfoItem>
                    <Info />
                    <Typography variant="body2">
                      <strong>Learning Type:</strong> {course.learning_type}
                    </Typography>
                  </InfoItem>

                  {course.comments && (
                    <Box mt={2}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Comments:</strong> {course.comments}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      </MainContainer>
    </Container>
  )
}

export default MyCourses

