"use client"

import { useState } from "react"
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  Pagination,
} from "@mui/material"
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { Download, Refresh, CalendarMonth } from "@mui/icons-material"

const statusFilters = [
  { value: "all", label: "All" },
  { value: "Completed", label: "Completed" },
  { value: "In Progress", label: "In Progress" },
  { value: "Learning Suspended", label: "Suspended" },
  { value: "Completed with Delay", label: "Delayed" },
  { value: "Incomplete", label: "Incomplete" },
  { value: "Rejected", label: "Rejected" },
]

const getStatusColor = (status) => {
  switch (status) {
    case "Completed":
      return "#4CAF50"
    case "In Progress":
      return "#FFC107"
    case "Learning Suspended":
      return "#F44336"
    case "Completed with Delay":
      return "#9C27B0"
    case "Incomplete":
      return "#FF5722"
    case "Rejected":
      return "#E91E63"
    default:
      return "#757575"
  }
}

const rowsPerPage = 5

const DownloadReport = () => {
  const [fromDate, setFromDate] = useState(null)
  const [toDate, setToDate] = useState(null)
  const [reportData, setReportData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [page, setPage] = useState(1)

  const handleViewReport = async () => {
    if (!fromDate || !toDate) {
      setError("Please select both start and end dates")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const from = fromDate.toISOString().split("T")[0]
      const to = toDate.toISOString().split("T")[0]

      const response = await fetch(
        `http://localhost:8000/api/report/data?fromDate=${from}&toDate=${to}&status=${selectedStatus}`,
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Failed to fetch report data")
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || "Invalid response from server")
      }

      setReportData(data.data || [])
      setPage(1)
    } catch (err) {
      console.error("Error:", err)
      setError(err.message || "Failed to load report")
      setReportData([])
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    const from = fromDate?.toISOString().split("T")[0] || ""
    const to = toDate?.toISOString().split("T")[0] || ""
    window.location.href = `http://localhost:8000/api/export-excel?fromDate=${from}&toDate=${to}&status=${selectedStatus}`
  }

  const handleStatusFilter = (event, newStatus) => {
    if (newStatus !== null) {
      setSelectedStatus(newStatus)
    }
  }

  const handleClearFilters = () => {
    setFromDate(null)
    setToDate(null)
    setSelectedStatus("all")
    setReportData([])
    setError(null)
  }

  const handlePageChange = (event, newPage) => {
    setPage(newPage)
  }

  // Calculate pagination values
  const startIndex = reportData.length === 0 ? 0 : (page - 1) * rowsPerPage + 1
  const endIndex = Math.min(page * rowsPerPage, reportData.length)

  // Get current page data
  const paginatedData = reportData.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  return (
    <Paper elevation={3} sx={{ p: 4, m: 2, bgcolor: "background.paper" }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          mb: 3,
          fontWeight: "600",
          color: "primary.main",
          textAlign: "left",
        }}
      >
        Training Program Report
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Stack spacing={3} sx={{ mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              gap: 3,
              flexWrap: "wrap",
            }}
          >
            {/* Improved date picker styling */}
            <Box sx={{ flex: 1, minWidth: 180, maxWidth: 220 }}>
              <Typography variant="body2" sx={{ mb: 0.5, color: "#4F4949", fontWeight: 500 }}>
                Start Date
              </Typography>
              <DatePicker
                value={fromDate}
                onChange={setFromDate}
                format="MM/dd/yyyy"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    // InputProps: {
                    //   startAdornment: <CalendarMonth sx={{ color: "primary.main", fontSize: 18, mr: 0.5 }} />,
                    // },
                    sx: {
                      "& .MuiInputBase-root": {
                        height: 36,
                        fontSize: "0.875rem",
                      },
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "rgba(0, 0, 0, 0.23)",
                          borderRadius: "4px",
                        },
                        "&:hover fieldset": {
                          borderColor: "primary.main",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "primary.main",
                        },
                      },
                    },
                  },
                  desktopPaper: {
                    sx: {
                      "& .MuiPickersDay-root": {
                        fontSize: "0.8rem",
                        width: 32,
                        height: 32,
                      },
                      "& .MuiDayCalendar-header": {
                        "& .MuiTypography-root": {
                          fontSize: "0.75rem",
                        },
                      },
                      "& .MuiPickersCalendarHeader-label": {
                        fontSize: "0.9rem",
                      },
                    },
                  },
                }}
              />
            </Box>

            <Box sx={{ flex: 1, minWidth: 180, maxWidth: 220 }}>
              <Typography variant="body2" sx={{ mb: 0.5, color: "#4F4949", fontWeight: 500 }}>
                End Date
              </Typography>
              <DatePicker
                value={toDate}
                onChange={setToDate}
                minDate={fromDate}
                format="MM/dd/yyyy"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    // InputProps: {
                    //   startAdornment: <CalendarMonth sx={{ color: "primary.main", fontSize: 18, mr: 0.5 }} />,
                    // },
                    sx: {
                      "& .MuiInputBase-root": {
                        height: 36,
                        fontSize: "0.875rem",
                      },
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "rgba(0, 0, 0, 0.23)",
                          borderRadius: "4px",
                        },
                        "&:hover fieldset": {
                          borderColor: "primary.main",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "primary.main",
                        },
                      },
                    },
                  },
                  desktopPaper: {
                    sx: {
                      "& .MuiPickersDay-root": {
                        fontSize: "0.8rem",
                        width: 32,
                        height: 32,
                      },
                      "& .MuiDayCalendar-header": {
                        "& .MuiTypography-root": {
                          fontSize: "0.75rem",
                        },
                      },
                      "& .MuiPickersCalendarHeader-label": {
                        fontSize: "0.9rem",
                      },
                    },
                  },
                }}
              />
            </Box>
          </Box>

          <ToggleButtonGroup
            value={selectedStatus}
            exclusive
            onChange={handleStatusFilter}
            size="small"
            sx={{
              flexWrap: "wrap",
              gap: 1,
              "& .MuiToggleButton-root": {
                px: 1.5,
                py: 0.5,
                fontSize: "0.8125rem",
                borderRadius: "4px !important",
                border: "1px solid",
                borderColor: "divider",
                textTransform: "none",
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": { bgcolor: "primary.dark" },
                },
              },
            }}
          >
            {statusFilters.map((filter) => (
              <ToggleButton key={filter.value} value={filter.value} disabled={loading}>
                {filter.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>
      </LocalizationProvider>

      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Button
          variant="contained"
          onClick={handleViewReport}
          disabled={!fromDate || !toDate || loading}
          startIcon={<Refresh />}
          size="small"
          sx={{
            px: 3,
            textTransform: "none",
            fontWeight: "500",
          }}
        >
          {loading ? "Loading..." : "Generate Report"}
        </Button>

        <Button
          variant="outlined"
          onClick={handleExport}
          disabled={reportData.length === 0 || loading}
          startIcon={<Download />}
          size="small"
          sx={{
            px: 3,
            textTransform: "none",
            fontWeight: "500",
          }}
        >
          Export to Excel
        </Button>

        <Button
          variant="text"
          onClick={handleClearFilters}
          disabled={loading}
          size="small"
          sx={{
            textTransform: "none",
            fontWeight: "500",
          }}
        >
          Clear Filters
        </Button>
      </Stack>

      {reportData.length > 0 && (
        <div>
          <TableContainer
            component={Paper}
            sx={{
              maxHeight: 500,
              border: "1px solid",
              borderColor: "divider",
              mb: 2,
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow sx={{ borderBottom: "2px solid #8FBEF8" }}>
                  <TableCell sx={{ fontWeight: "600", backgroundColor: "white" }}>Request ID</TableCell>
                  <TableCell sx={{ fontWeight: "600", backgroundColor: "white" }}>Project</TableCell>
                  <TableCell sx={{ fontWeight: "600", backgroundColor: "white" }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: "600", backgroundColor: "white" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: "600", backgroundColor: "white" }}>Assigned Date</TableCell>
                  <TableCell sx={{ fontWeight: "600", backgroundColor: "white" }}>Progress</TableCell>
                  <TableCell sx={{ fontWeight: "600", backgroundColor: "white" }}>Course Type</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((row, index) => (
                    <TableRow
                      key={`row-${row.RequestID}-${index}`}
                      hover
                      sx={{ backgroundColor: index % 2 === 0 ? "#F1F2FD" : "white" }}
                    >
                      <TableCell>{row.RequestID}</TableCell>
                      <TableCell>{row.ProjectName}</TableCell>
                      <TableCell>{row.EmployeeName}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            color: getStatusColor(row.CourseStatus),
                            fontWeight: "500",
                          }}
                        >
                          {row.CourseStatus}
                        </Box>
                      </TableCell>
                      <TableCell>{row.AssignedDate}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Box
                            sx={{
                              width: "100%",
                              bgcolor: "divider",
                              borderRadius: 2,
                              overflow: "hidden",
                            }}
                          >
                            <Box
                              sx={{
                                width: `${row.Progress}%`,
                                height: 6,
                                bgcolor:
                                  row.Progress >= 80
                                    ? "success.main"
                                    : row.Progress >= 50
                                      ? "warning.main"
                                      : "error.main",
                                transition: "width 0.3s",
                              }}
                            />
                          </Box>
                          <span>{row.Progress}%</span>
                        </Box>
                      </TableCell>
                      <TableCell>{row.CourseType}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      No records to display for this page
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "inherit" }}>
              {reportData.length === 0
                ? "No records"
                : `Showing ${startIndex}-${endIndex} of ${reportData.length} records`}
            </Typography>
            <Pagination
              count={Math.ceil(reportData.length / rowsPerPage)}
              page={page}
              onChange={handlePageChange}
              size="small"
              shape="rounded"
              sx={{
                "& .MuiPaginationItem-root": {
                  fontWeight: 500,
                  "&.Mui-selected": {
                    backgroundColor: "primary.main",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "primary.dark",
                    },
                  },
                },
              }}
            />
          </Box>
        </div>
      )}
    </Paper>
  )
}

export default DownloadReport

