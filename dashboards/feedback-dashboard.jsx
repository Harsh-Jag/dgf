"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  CircularProgress,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useTheme,
  Tabs,
  Tab,
} from "@mui/material"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Assessment, Close, Person, School, Star, Comment, Lightbulb } from "@mui/icons-material"
import axios from "axios"

// Utility function to map numeric ratings to text
const mapRatingToText = (field, value) => {
  const mappings = {
    instruction_rating: {
      4: "Very Good",
      3: "Good",
      2: "Interesting",
      1: "Average",
    },
    engaged_rating: {
      4: "Very Good",
      3: "Good",
      2: "Interesting",
      1: "Average",
    },
    interactive: {
      2: "Yes",
      1: "No",
    },
    interactive_components: {
      3: "More",
      2: "Less",
      1: "Some",
    },
    engaged_session_rating: {
      4: "Very Good",
      3: "Good",
      2: "Interesting",
      1: "Average",
    },
  }

  return mappings[field]?.[value] || value
}

// Rating chip component with appropriate colors
const RatingChip = ({ rating, field }) => {
  const theme = useTheme()
  const colors = {
    4: theme.palette.success.main,
    3: theme.palette.info.main,
    2: theme.palette.warning.main,
    1: theme.palette.error.main,
  }

  const text = mapRatingToText(field, rating)
  const color = colors[rating] || theme.palette.primary.main

  return (
    <Chip
      label={text}
      sx={{
        backgroundColor: color,
        color: "white",
        fontWeight: "bold",
      }}
    />
  )
}

// Detailed feedback dialog component
const FeedbackDetailDialog = ({ open, handleClose, feedback }) => {
  if (!feedback) return null

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6">Detailed Feedback</Typography>
        <IconButton onClick={handleClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  <Person sx={{ verticalAlign: "middle", mr: 1 }} />
                  Participant Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1">{feedback.emp_name}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Employee ID
                  </Typography>
                  <Typography variant="body1">{feedback.employee_id}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">{feedback.emp_email}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  <School sx={{ verticalAlign: "middle", mr: 1 }} />
                  Course Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Course ID
                  </Typography>
                  <Typography variant="body1">{feedback.course_id}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Training Topic
                  </Typography>
                  <Typography variant="body1">{feedback.training_topic}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Request ID
                  </Typography>
                  <Typography variant="body1">{feedback.reqid}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  <Star sx={{ verticalAlign: "middle", mr: 1 }} />
                  Ratings
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Instruction Rating
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <RatingChip rating={feedback.instruction_rating} field="instruction_rating" />
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Engagement Rating
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <RatingChip rating={feedback.engaged_rating} field="engaged_rating" />
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Program Engaging
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label={mapRatingToText("interactive", feedback.interactive)}
                          color={feedback.interactive === "2" ? "success" : "error"}
                          sx={{ fontWeight: "medium" }}
                        />
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Interaction Level
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label={mapRatingToText("interactive_components", feedback.interactive_components)}
                          color={
                            feedback.interactive_components === "3"
                              ? "success"
                              : feedback.interactive_components === "2"
                                ? "error"
                                : "warning"
                          }
                          sx={{ fontWeight: "medium" }}
                        />
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Overall Experience
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <RatingChip rating={feedback.engaged_session_rating} field="engaged_session_rating" />
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  <Comment sx={{ verticalAlign: "middle", mr: 1 }} />
                  Comments
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Areas for Improvement
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: "background.default" }}>
                    <Typography variant="body1">{feedback.improved_comments || "No comments provided"}</Typography>
                  </Paper>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Other Suggestions
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: "background.default" }}>
                    <Typography variant="body1">{feedback.other_suggestions || "No suggestions provided"}</Typography>
                  </Paper>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const FeedbackDashboard = () => {
  const [feedbackData, setFeedbackData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const theme = useTheme()

  useEffect(() => {
    const fetchFeedbackData = async () => {
      try {
        setLoading(true)
        const response = await axios.get("http://localhost:8000/api/learner-feedback")
        setFeedbackData(response.data)
        setLoading(false)
      } catch (err) {
        setError("Failed to fetch feedback data")
        setLoading(false)
        console.error("Error fetching feedback data:", err)
      }
    }

    fetchFeedbackData()
  }, [])

  const handleOpenDialog = (feedback) => {
    setSelectedFeedback(feedback)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  // Prepare data for charts
  const prepareChartData = () => {
    if (!feedbackData.length)
      return { instructionRatings: [], engagementRatings: [], overallRatings: [], interactionData: [] }

    // Count ratings for instruction
    const instructionCounts = feedbackData.reduce((acc, item) => {
      const rating = item.instruction_rating
      acc[rating] = (acc[rating] || 0) + 1
      return acc
    }, {})

    // Count ratings for engagement
    const engagementCounts = feedbackData.reduce((acc, item) => {
      const rating = item.engaged_rating
      acc[rating] = (acc[rating] || 0) + 1
      return acc
    }, {})

    // Count ratings for overall experience
    const overallCounts = feedbackData.reduce((acc, item) => {
      const rating = item.engaged_session_rating
      acc[rating] = (acc[rating] || 0) + 1
      return acc
    }, {})

    // Count for interaction components
    const interactionCounts = feedbackData.reduce((acc, item) => {
      const rating = item.interactive_components
      const label = mapRatingToText("interactive_components", rating)
      acc[label] = (acc[label] || 0) + 1
      return acc
    }, {})

    // Format data for charts
    const instructionRatings = Object.keys(instructionCounts).map((key) => ({
      name: mapRatingToText("instruction_rating", key),
      value: instructionCounts[key],
      rating: key,
    }))

    const engagementRatings = Object.keys(engagementCounts).map((key) => ({
      name: mapRatingToText("engaged_rating", key),
      value: engagementCounts[key],
      rating: key,
    }))

    const overallRatings = Object.keys(overallCounts).map((key) => ({
      name: mapRatingToText("engaged_session_rating", key),
      value: overallCounts[key],
      rating: key,
    }))

    const interactionData = Object.keys(interactionCounts).map((key) => ({
      name: key,
      value: interactionCounts[key],
    }))

    return { instructionRatings, engagementRatings, overallRatings, interactionData }
  }

  const { instructionRatings, engagementRatings, overallRatings, interactionData } = prepareChartData()

  // Calculate summary statistics
  const calculateSummary = () => {
    if (!feedbackData.length)
      return { totalFeedbacks: 0, avgInstructionRating: 0, avgEngagementRating: 0, avgOverallRating: 0 }

    const totalFeedbacks = feedbackData.length

    const sumInstructionRating = feedbackData.reduce((sum, item) => sum + Number.parseInt(item.instruction_rating), 0)
    const avgInstructionRating = (sumInstructionRating / totalFeedbacks).toFixed(1)

    const sumEngagementRating = feedbackData.reduce((sum, item) => sum + Number.parseInt(item.engaged_rating), 0)
    const avgEngagementRating = (sumEngagementRating / totalFeedbacks).toFixed(1)

    const sumOverallRating = feedbackData.reduce((sum, item) => sum + Number.parseInt(item.engaged_session_rating), 0)
    const avgOverallRating = (sumOverallRating / totalFeedbacks).toFixed(1)

    const engagingYesCount = feedbackData.filter((item) => item.interactive === "2").length
    const engagingPercentage = ((engagingYesCount / totalFeedbacks) * 100).toFixed(0)

    return {
      totalFeedbacks,
      avgInstructionRating,
      avgEngagementRating,
      avgOverallRating,
      engagingPercentage,
    }
  }

  const summary = calculateSummary()

  // Colors for pie charts
  const COLORS = {
    instruction: ["#d32f2f", "#f44336", "#ff5722", "#ff9800"],
    engagement: ["#ff9800", "#f44336"],
    overall: ["#d32f2f"],
    interaction: ["#2196f3", "#64b5f6"],
  }

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1.5, boxShadow: 3 }}>
          <Typography variant="body2">{`${payload[0].name}: ${payload[0].value}`}</Typography>
        </Paper>
      )
    }
    return null
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", py: 3 }}>
      <Container maxWidth="xl">
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
          {/* Left Section - Header and Summary Cards */}
          <Box sx={{ flex: "0 0 300px", display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Header Card */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Assessment sx={{ color: "#1976d2", mr: 1 }} />
                <Typography variant="h5" component="h1" sx={{ fontWeight: "bold", color: "#1976d2" }}>
                  Learning Feedback Dashboard
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Comprehensive analysis of participant feedback for training sessions
              </Typography>
            </Paper>

            {/* Summary Cards */}
            <Card sx={{ bgcolor: "#1976d2", color: "white", borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Feedbacks
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: "bold", textAlign: "center" }}>
                  {summary.totalFeedbacks}
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ bgcolor: "#2e7d32", color: "white", borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Avg. Instruction Rating
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: "bold", textAlign: "center" }}>
                  {summary.avgInstructionRating}
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                  {[...Array(4)].map((_, i) => (
                    <Star
                      key={i}
                      sx={{ opacity: i < Math.round(Number.parseFloat(summary.avgInstructionRating)) ? 1 : 0.5 }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ bgcolor: "#0288d1", color: "white", borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Avg. Engagement Rating
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: "bold", textAlign: "center" }}>
                  {summary.avgEngagementRating}
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                  {[...Array(4)].map((_, i) => (
                    <Star
                      key={i}
                      sx={{ opacity: i < Math.round(Number.parseFloat(summary.avgEngagementRating)) ? 1 : 0.5 }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ bgcolor: "#ed6c02", color: "white", borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Program Engaging
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: "bold", textAlign: "center" }}>
                  {summary.engagingPercentage}%
                </Typography>
                <Typography variant="body2" sx={{ textAlign: "center", mt: 1 }}>
                  of participants found the program engaging
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Right Section - Tabs and Content */}
          <Box sx={{ flex: 1 }}>
            <Paper elevation={0} sx={{ borderRadius: 2, overflow: "hidden" }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{
                  bgcolor: "white",
                  "& .MuiTab-root": { fontWeight: "bold" },
                }}
              >
                <Tab label="Charts & Analytics" />
                <Tab label="Feedback Table" />
              </Tabs>

              {/* Charts View */}
              {activeTab === 0 && (
                <Box sx={{ p: 2, bgcolor: "white" }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Paper elevation={0} sx={{ p: 2, height: "100%", borderRadius: 2, border: "1px solid #e0e0e0" }}>
                        <Typography variant="subtitle1" align="center" gutterBottom>
                          Instruction Rating Distribution
                        </Typography>
                        <Box sx={{ height: 250, display: "flex", justifyContent: "center" }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={instructionRatings}
                                cx="50%"
                                cy="50%"
                                innerRadius={0}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              >
                                {instructionRatings.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS.instruction[index % COLORS.instruction.length]}
                                  />
                                ))}
                              </Pie>
                              <Legend layout="vertical" verticalAlign="bottom" align="center" />
                            </PieChart>
                          </ResponsiveContainer>
                        </Box>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Paper elevation={0} sx={{ p: 2, height: "100%", borderRadius: 2, border: "1px solid #e0e0e0" }}>
                        <Typography variant="subtitle1" align="center" gutterBottom>
                          Engagement Distribution
                        </Typography>
                        <Box sx={{ height: 250, display: "flex", justifyContent: "center" }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={engagementRatings}
                                cx="50%"
                                cy="50%"
                                innerRadius={0}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              >
                                {engagementRatings.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS.engagement[index % COLORS.engagement.length]}
                                  />
                                ))}
                              </Pie>
                              <Legend layout="vertical" verticalAlign="bottom" align="center" />
                            </PieChart>
                          </ResponsiveContainer>
                        </Box>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Paper elevation={0} sx={{ p: 2, height: "100%", borderRadius: 2, border: "1px solid #e0e0e0" }}>
                        <Typography variant="subtitle1" align="center" gutterBottom>
                          Overall Experience Rating
                        </Typography>
                        <Box sx={{ height: 250, display: "flex", justifyContent: "center" }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={overallRatings}
                                cx="50%"
                                cy="50%"
                                innerRadius={0}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              >
                                {overallRatings.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS.overall[index % COLORS.overall.length]} />
                                ))}
                              </Pie>
                              <Legend layout="vertical" verticalAlign="bottom" align="center" />
                            </PieChart>
                          </ResponsiveContainer>
                        </Box>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Paper elevation={0} sx={{ p: 2, height: "100%", borderRadius: 2, border: "1px solid #e0e0e0" }}>
                        <Typography variant="subtitle1" align="center" gutterBottom>
                          Interaction Level Distribution
                        </Typography>
                        <Box sx={{ height: 250, display: "flex", justifyContent: "center" }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={interactionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip content={<CustomTooltip />} />
                              <Bar dataKey="value" name="Count" fill={COLORS.interaction[0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Table View */}
              {activeTab === 1 && (
                <Box sx={{ p: 2, bgcolor: "white" }}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid #e0e0e0" }}>
                    <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
                      <Lightbulb sx={{ mr: 1, color: theme.palette.primary.main }} />
                      Feedback Records
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Click on "View Details" to see the complete feedback record
                    </Typography>
                    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 440 }}>
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: "bold", bgcolor: theme.palette.primary.main, color: "white" }}>
                              Employee
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold", bgcolor: theme.palette.primary.main, color: "white" }}>
                              Training Topic
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold", bgcolor: theme.palette.primary.main, color: "white" }}>
                              Instruction
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold", bgcolor: theme.palette.primary.main, color: "white" }}>
                              Engagement
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold", bgcolor: theme.palette.primary.main, color: "white" }}>
                              Overall
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold", bgcolor: theme.palette.primary.main, color: "white" }}>
                              Actions
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {feedbackData.map((feedback) => (
                            <TableRow key={feedback.id} hover>
                              <TableCell>
                                <Box sx={{ display: "flex", flexDirection: "column" }}>
                                  <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                                    {feedback.emp_name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {feedback.employee_id}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>{feedback.training_topic}</TableCell>
                              <TableCell>
                                <RatingChip rating={feedback.instruction_rating} field="instruction_rating" />
                              </TableCell>
                              <TableCell>
                                <RatingChip rating={feedback.engaged_rating} field="engaged_rating" />
                              </TableCell>
                              <TableCell>
                                <RatingChip rating={feedback.engaged_session_rating} field="engaged_session_rating" />
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => handleOpenDialog(feedback)}
                                  sx={{ textTransform: "none" }}
                                >
                                  View Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Box>
              )}
            </Paper>
          </Box>
        </Box>
      </Container>

      {/* Detailed Feedback Dialog */}
      <FeedbackDetailDialog open={dialogOpen} handleClose={handleCloseDialog} feedback={selectedFeedback} />
    </Box>
  )
}

export default FeedbackDashboard

