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
  MenuItem,
  FormControl,
  Select,
  ButtonGroup,
  Tooltip,
  Snackbar,
  Alert,
  Pagination,
} from "@mui/material"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import {
  Assessment,
  Close,
  Person,
  School,
  Star,
  Comment,
  CalendarMonth,
  PictureAsPdf,
  TableView,
  InsertDriveFile,
  ThumbUp,
  ThumbDown,
  Timeline,
} from "@mui/icons-material"
import axios from "axios"
import { exportData } from "../../utils/manager-export-utils"

// Utility function to format dates
const formatDate = (dateString) => {
  if (!dateString) return "N/A"
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

// Utility function to map enhancement ratings to text
const mapEnhancementRating = (rating) => {
  const ratings = {
    4: "Very Good Enhancement",
    3: "Good enhancement",
    2: "Some enhancement",
    1: "No Enhancement",
  }
  return ratings[rating] || rating
}

// Rating chip component with appropriate colors
const RatingChip = ({ rating }) => {
  const theme = useTheme()
  const colors = {
    4: "#8fd3b6", // Pastel green
    3: "#a6dcef", // Pastel blue
    2: "#ffcb91", // Pastel orange
    1: "#ffb6b9", // Pastel red
  }

  const text = mapEnhancementRating(rating)
  const color = colors[rating] || theme.palette.primary.main

  return (
    <Chip
      label={text}
      sx={{
        backgroundColor: color,
        color: "#333",
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
        <Typography variant="h6">Detailed Manager Feedback</Typography>
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
                  Employee Information
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
                  Skill Demonstration
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Demonstrated Skill
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label={feedback.demonstrate_skill === "yes" ? "Yes" : "No"}
                          sx={{
                            backgroundColor: feedback.demonstrate_skill === "yes" ? "#8fd3b6" : "#ffb6b9",
                            color: "#333",
                            fontWeight: "medium",
                          }}
                        />
                      </Box>
                    </Box>
                  </Grid>
                  {feedback.demonstrate_skill === "yes" && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Skill Demonstration Date
                          </Typography>
                          <Typography variant="body1">{formatDate(feedback.skill_date)}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Enhancement Rating
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <RatingChip rating={feedback.enhancement_rating} />
                          </Box>
                        </Box>
                      </Grid>
                    </>
                  )}
                  {feedback.demonstrate_skill === "no" && (
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Opportunity Date
                        </Typography>
                        <Typography variant="body1">{formatDate(feedback.opportunity_date)}</Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  <Comment sx={{ verticalAlign: "middle", mr: 1 }} />
                  Suggestions & Comments
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Manager Suggestions
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: "background.default" }}>
                    <Typography variant="body1">{feedback.suggestions || "No suggestions provided"}</Typography>
                  </Paper>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="contained" sx={{ bgcolor: "#09459e" }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const ManagerFeedbackDashboard = () => {
  const [feedbackData, setFeedbackData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const theme = useTheme()

  // Date filter states
  const [filterType, setFilterType] = useState("range")
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  // Pagination for feedback table
  const [page, setPage] = useState(1)
  const rowsPerPage = 5

  // Add a state for alerts
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" })

  // Stats for dashboard
  const [dashboardStats, setDashboardStats] = useState({
    totalFeedbacks: 0,
    demonstratedSkill: 0,
    pendingDemonstration: 0,
    avgEnhancementRating: 0,
  })

  useEffect(() => {
    const fetchFeedbackData = async () => {
      try {
        setLoading(true)
        const response = await axios.get("http://localhost:8000/api/manager-feedback")
        setFeedbackData(response.data)
        setFilteredData(response.data) // Initially set filtered data to all data

        // Calculate dashboard stats
        calculateDashboardStats(response.data)

        setLoading(false)
      } catch (err) {
        setError("Failed to fetch manager feedback data")
        setLoading(false)
        console.error("Error fetching manager feedback data:", err)
      }
    }

    fetchFeedbackData()
  }, [])

  // Calculate dashboard statistics
  const calculateDashboardStats = (data) => {
    const totalFeedbacks = data.length
    const demonstratedSkill = data.filter((item) => item.demonstrate_skill === "yes").length
    const pendingDemonstration = totalFeedbacks - demonstratedSkill

    // Calculate average enhancement rating for those who demonstrated skill
    let totalRating = 0
    let ratingCount = 0

    data.forEach((item) => {
      if (item.demonstrate_skill === "yes" && item.enhancement_rating) {
        totalRating += Number.parseInt(item.enhancement_rating)
        ratingCount++
      }
    })

    const avgEnhancementRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 0

    setDashboardStats({
      totalFeedbacks,
      demonstratedSkill,
      pendingDemonstration,
      avgEnhancementRating,
    })
  }

  // Apply date filters
  useEffect(() => {
    if (feedbackData.length === 0) return

    let filtered = [...feedbackData]

    if (filterType === "range" && startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999) // Set to end of day

      filtered = feedbackData.filter((item) => {
        // Filter by skill_date or opportunity_date depending on demonstrate_skill
        let itemDate
        if (item.demonstrate_skill === "yes" && item.skill_date) {
          itemDate = new Date(item.skill_date)
        } else if (item.demonstrate_skill === "no" && item.opportunity_date) {
          itemDate = new Date(item.opportunity_date)
        } else if (item.feedback_submitted_date) {
          itemDate = new Date(item.feedback_submitted_date)
        } else {
          return false // Skip items without relevant dates
        }

        return itemDate >= start && itemDate <= end
      })
    } else if (filterType === "month" && selectedMonth && selectedYear) {
      const month = Number.parseInt(selectedMonth)
      filtered = feedbackData.filter((item) => {
        // Filter by skill_date or opportunity_date depending on demonstrate_skill
        let itemDate
        if (item.demonstrate_skill === "yes" && item.skill_date) {
          itemDate = new Date(item.skill_date)
        } else if (item.demonstrate_skill === "no" && item.opportunity_date) {
          itemDate = new Date(item.opportunity_date)
        } else if (item.feedback_submitted_date) {
          itemDate = new Date(item.feedback_submitted_date)
        } else {
          return false // Skip items without relevant dates
        }

        return itemDate.getMonth() === month - 1 && itemDate.getFullYear() === selectedYear
      })
    }

    setFilteredData(filtered)
    // Update dashboard stats based on filtered data
    calculateDashboardStats(filtered)
    setPage(1) // Reset to first page when filters change
  }, [feedbackData, filterType, startDate, endDate, selectedMonth, selectedYear])

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

  const handleFilterTypeChange = (event) => {
    setFilterType(event.target.value)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  // Download functionality using the export-utils
  const downloadReport = (format) => {
    setLoading(true)

    try {
      // Format data for export
      const exportableData = filteredData.map((item) => ({
        ...item,
        demonstrate_skill: item.demonstrate_skill === "yes" ? "Yes" : "No",
        skill_date: formatDate(item.skill_date),
        opportunity_date: formatDate(item.opportunity_date),
        feedback_submitted_date: formatDate(item.feedback_submitted_date),
        enhancement_rating_text: mapEnhancementRating(item.enhancement_rating),
      }))

      // Use the exportData function from export-utils
      exportData(exportableData, format, "manager_feedback_report")

      setAlert({
        open: true,
        message: `${format.toUpperCase()} report downloaded successfully`,
        severity: "success",
      })
    } catch (error) {
      console.error(`Error downloading ${format} report:`, error)
      setAlert({
        open: true,
        message: `Failed to download ${format} report`,
        severity: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  // Prepare data for charts
  const prepareChartData = () => {
    if (!filteredData.length) return { enhancementRatings: [], demonstrationStatus: [], opportunityTimeline: [] }

    // Count enhancement ratings
    const enhancementCounts = filteredData.reduce((acc, item) => {
      if (item.demonstrate_skill === "yes" && item.enhancement_rating) {
        const rating = item.enhancement_rating
        acc[rating] = (acc[rating] || 0) + 1
      }
      return acc
    }, {})

    // Count demonstration status
    const demonstrationStatus = [
      { name: "Demonstrated", value: filteredData.filter((item) => item.demonstrate_skill === "yes").length },
      { name: "Not Demonstrated", value: filteredData.filter((item) => item.demonstrate_skill === "no").length },
    ]

    // Group opportunity dates by month for timeline
    const opportunityDates = filteredData
      .filter((item) => item.demonstrate_skill === "no" && item.opportunity_date)
      .reduce((acc, item) => {
        const date = new Date(item.opportunity_date)
        const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`
        acc[monthYear] = (acc[monthYear] || 0) + 1
        return acc
      }, {})

    const opportunityTimeline = Object.keys(opportunityDates).map((key) => ({
      month: key,
      count: opportunityDates[key],
    }))

    // Sort timeline by date
    opportunityTimeline.sort((a, b) => {
      const dateA = new Date(a.month)
      const dateB = new Date(b.month)
      return dateA - dateB
    })

    const enhancementRatings = Object.keys(enhancementCounts).map((key) => ({
      name: mapEnhancementRating(key),
      value: enhancementCounts[key],
      rating: key,
    }))

    return { enhancementRatings, demonstrationStatus, opportunityTimeline }
  }

  const { enhancementRatings, demonstrationStatus, opportunityTimeline } = prepareChartData()

  // Get current page of data for the table
  const paginatedData = filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  // Colors for charts
  const COLORS = {
    enhancement: ["#ffa07a", "#ff725e", "#e65c4d", "#cc4a3d"], // Lighter reds/oranges
    demonstration: [ "#7b5ea5",  "#bfa3db","#9b7fc1","#5a3e85"],
    opportunity: "#5a9bd8",
  }

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1.5, boxShadow: 3, bgcolor: "white" }}>
          <Typography variant="body2">{`${payload[0].name}: ${payload[0].value}`}</Typography>
        </Paper>
      )
    }
    return null
  }

  // Generate years for dropdown (last 5 years)
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

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
    <Box sx={{ bgcolor: "#f5f5f5", px: "0px !important" }}>
      <Container maxWidth="xl" sx={{ px: "0 !important", py: "0 !important" }}>
        <Paper
          elevation={0}
          sx={{
            bgcolor: "white",
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
          }}
        >
          {/* Header */}
          <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider", bgcolor: "white" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Assessment sx={{ color: "#09459e", mr: 1 }} />
                <Typography variant="h5" component="h1" sx={{ fontWeight: "bold", color: "#09459e" }}>
                  Manager Feedback Dashboard
                </Typography>
              </Box>
              <ButtonGroup variant="outlined" size="small">
                <Tooltip title="Download Excel">
                  <Button
                    startIcon={<TableView />}
                    onClick={() => downloadReport("xlsx")}
                    sx={{ textTransform: "none" }}
                  >
                    Excel
                  </Button>
                </Tooltip>
                <Tooltip title="Download PDF">
                  <Button
                    startIcon={<PictureAsPdf />}
                    onClick={() => downloadReport("pdf")}
                    sx={{ textTransform: "none" }}
                  >
                    PDF
                  </Button>
                </Tooltip>
                <Tooltip title="Download CSV">
                  <Button
                    startIcon={<InsertDriveFile />}
                    onClick={() => downloadReport("csv")}
                    sx={{ textTransform: "none" }}
                  >
                    CSV
                  </Button>
                </Tooltip>
              </ButtonGroup>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Comprehensive analysis of manager feedback on skill enhancement
            </Typography>
          </Box>

          {/* Date Filter Section */}
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, height: "100%" }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <CalendarMonth sx={{ color: "#09459e", mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: "medium", color: "#09459e" }}>
                  Filter by Date
                </Typography>
              </Box>

              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Filter Type
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select value={filterType} onChange={handleFilterTypeChange}>
                      <MenuItem value="range">Date Range</MenuItem>
                      <MenuItem value="month">Month & Year</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {filterType === "range" ? (
                  <>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        From
                      </Typography>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          value={startDate}
                          onChange={setStartDate}
                          slotProps={{ textField: { fullWidth: true, size: "small" } }}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        To
                      </Typography>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          value={endDate}
                          onChange={setEndDate}
                          slotProps={{ textField: { fullWidth: true, size: "small" } }}
                        />
                      </LocalizationProvider>
                    </Grid>
                  </>
                ) : (
                  <>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Month
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                          <MenuItem value="1">January</MenuItem>
                          <MenuItem value="2">February</MenuItem>
                          <MenuItem value="3">March</MenuItem>
                          <MenuItem value="4">April</MenuItem>
                          <MenuItem value="5">May</MenuItem>
                          <MenuItem value="6">June</MenuItem>
                          <MenuItem value="7">July</MenuItem>
                          <MenuItem value="8">August</MenuItem>
                          <MenuItem value="9">September</MenuItem>
                          <MenuItem value="10">October</MenuItem>
                          <MenuItem value="11">November</MenuItem>
                          <MenuItem value="12">December</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Year
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                          {years.map((year) => (
                            <MenuItem key={year} value={year}>
                              {year}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </>
                )}

                <Grid item xs={12} sm={1}>
                  <Box sx={{ mt: 3 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ height: "30px", bgcolor: "#1976d2", fontSize: "0.7rem" }}
                      onClick={() => {
                        // Reset filters
                        if (filterType === "range") {
                          setStartDate(null)
                          setEndDate(null)
                        } else {
                          setSelectedMonth("")
                          setSelectedYear(new Date().getFullYear())
                        }
                        setFilteredData(feedbackData)
                      }}
                    >
                      Reset
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Summary Cards Section */}
          <Box sx={{ p: 3, bgcolor: "white", borderBottom: 1, borderColor: "divider" }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "medium", color: "#09459e" }}>
              Summary Statistics
            </Typography>

            <Grid container spacing={3}>
              {/* Total Feedback Card */}
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#a6dcef", color: "#333", borderRadius: 2, height: 180 }}>
                  <CardContent>
                    <Typography variant="h6" align="center" gutterBottom>
                      Total Feedback
                    </Typography>
                    <Typography variant="h2" sx={{ fontWeight: "bold", textAlign: "center", mt: 2 }}>
                      {dashboardStats.totalFeedbacks}
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: "center", mt: 1 }}>
                      manager feedback entries
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Demonstrated Skill Card */}
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#8fd3b6", color: "#333", borderRadius: 2, height: 180 }}>
                  <CardContent>
                    <Typography variant="h6" align="center" gutterBottom>
                      Demonstrated Skill
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 2 }}>
                      <ThumbUp sx={{ fontSize: 40, mr: 1 }} />
                      <Typography variant="h2" sx={{ fontWeight: "bold" }}>
                        {dashboardStats.demonstratedSkill}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ textAlign: "center", mt: 1 }}>
                      employees demonstrated skills
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Pending Demonstration Card */}
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#ffb6b9", color: "#333", borderRadius: 2, height: 180 }}>
                  <CardContent>
                    <Typography variant="h6" align="center" gutterBottom>
                      Pending Demonstration
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 2 }}>
                      <ThumbDown sx={{ fontSize: 40, mr: 1 }} />
                      <Typography variant="h2" sx={{ fontWeight: "bold" }}>
                        {dashboardStats.pendingDemonstration}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ textAlign: "center", mt: 1 }}>
                      employees yet to demonstrate
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Average Enhancement Rating Card */}
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#c7ceea", color: "#333", borderRadius: 2, height: 180 }}>
                  <CardContent>
                    <Typography variant="h6" align="center" gutterBottom>
                      Avg. Enhancement Rating
                    </Typography>
                    <Typography variant="h2" sx={{ fontWeight: "bold", textAlign: "center", mt: 2 }}>
                      {dashboardStats.avgEnhancementRating}
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                      {[...Array(4)].map((_, i) => (
                        <Star
                          key={i}
                          sx={{
                            opacity: i < Math.round(Number.parseFloat(dashboardStats.avgEnhancementRating)) ? 1 : 0.5,
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* Charts and Table Section */}
          <Box sx={{ bgcolor: "white" }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                "& .MuiTab-root": { fontWeight: "bold" },
              }}
            >
              <Tab label="Charts & Analytics" />
              <Tab label="Feedback Table" />
            </Tabs>

            {/* Charts View */}
            {activeTab === 0 && (
              <Box sx={{ p: 3 }}>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        height: 350,
                        mb: 2,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Typography variant="subtitle1" align="center" gutterBottom sx={{ mb: 2 }}>
                        Enhancement Rating Distribution
                      </Typography>
                      <Box sx={{ height: 280, display: "flex", justifyContent: "center", flexGrow: 1 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={enhancementRatings}
                              cx="50%"
                              cy="50%"
                              innerRadius={0}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              isAnimationActive={false}
                            >
                              {enhancementRatings.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS.enhancement[index % COLORS.enhancement.length]}
                                />
                              ))}
                            </Pie>
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        height: 350,
                        mb: 2,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Typography variant="subtitle1" align="center" gutterBottom sx={{ mb: 2 }}>
                        Skill Demonstration Status
                      </Typography>
                      <Box sx={{ height: 280, display: "flex", justifyContent: "center", flexGrow: 1 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={demonstrationStatus}
                              cx="50%"
                              cy="50%"
                              innerRadius={0}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              isAnimationActive={false}
                            >
                              {demonstrationStatus.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS.demonstration[index % COLORS.demonstration.length]}
                                />
                              ))}
                            </Pie>
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid item xs={12}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        height: 350,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Typography variant="subtitle1" align="center" gutterBottom sx={{ mb: 2 }}>
                        Upcoming Skill Demonstration Timeline
                      </Typography>
                      <Box sx={{ height: 280, display: "flex", justifyContent: "center", flexGrow: 1 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={opportunityTimeline}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <RechartsTooltip />
                            <Bar dataKey="count" fill={COLORS.opportunity} name="Upcoming Demonstrations" />
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
              <Box sx={{ px: 3, py: 3 }}>
                <Paper elevation={0} sx={{ px: 3, py: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
                    <Timeline sx={{ mr: 1, color: "#09459e" }} />
                    Manager Feedback Records
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Click on "View Details" to see the complete feedback record
                  </Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 440 }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bold", bgcolor: "#09459e", color: "white" }}>
                            Employee
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold", bgcolor: "#09459e", color: "white" }}>
                            Course ID
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold", bgcolor: "#09459e", color: "white" }}>
                            Skill Demonstrated
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold", bgcolor: "#09459e", color: "white" }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: "bold", bgcolor: "#09459e", color: "white" }}>
                            Enhancement
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold", bgcolor: "#09459e", color: "white" }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedData.map((feedback) => (
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
                            <TableCell>{feedback.course_id}</TableCell>
                            <TableCell>
                              <Chip
                                label={feedback.demonstrate_skill === "yes" ? "Yes" : "No"}
                                sx={{
                                  backgroundColor: feedback.demonstrate_skill === "yes" ? "#8fd3b6" : "#ffb6b9",
                                  color: "#333",
                                  fontWeight: "medium",
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              {feedback.demonstrate_skill === "yes"
                                ? formatDate(feedback.skill_date)
                                : formatDate(feedback.opportunity_date)}
                            </TableCell>
                            <TableCell>
                              {feedback.demonstrate_skill === "yes" && feedback.enhancement_rating ? (
                                <RatingChip rating={feedback.enhancement_rating} />
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  N/A
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleOpenDialog(feedback)}
                                sx={{ textTransform: "none", bgcolor: "#09459e" }}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Pagination for feedback table */}
                  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                    <Pagination
                      count={Math.ceil(filteredData.length / rowsPerPage)}
                      page={page}
                      onChange={handleChangePage}
                      color="primary"
                      sx={{
                        "& .MuiPaginationItem-root": {
                          color: "#09459e",
                        },
                        "& .Mui-selected": {
                          backgroundColor: "rgba(9, 69, 158, 0.1) !important",
                        },
                      }}
                    />
                  </Box>
                </Paper>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>

      {/* Detailed Feedback Dialog */}
      <FeedbackDetailDialog open={dialogOpen} handleClose={handleCloseDialog} feedback={selectedFeedback} />

      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={() => setAlert({ ...alert, open: false })} severity={alert.severity} variant="filled">
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default ManagerFeedbackDashboard

