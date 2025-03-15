"use client"

import { useState } from "react"
import { IconButton, Popover, Box, Button, Typography, TextField, InputAdornment } from "@mui/material"
import { Calendar, Download } from "lucide-react"
import PropTypes from "prop-types"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { format } from "date-fns"
import "./custom-datepicker.css"
import { Backdrop } from "@mui/material"

function DownloadReport({ onDownload }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(0) // 0 for Single Day, 1 for Range
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
    setCalendarOpen(false)
  }

  const handleDownload = () => {
    if (selectedIndex === 0 && startDate) {
      // For single day, use the same date for start and end
      onDownload(startDate, startDate)
    } else if (startDate && endDate) {
      onDownload(startDate, endDate)
    }
    handleClose()
  }

  // Toggle between Single Day and Range selection
  const handleRangeSelection = (index) => {
    setSelectedIndex(index)
    if (index === 0) {
      setEndDate(null) // Clear end date when switching to single day
    }
  }

  const handleDateChange = (dates) => {
    if (selectedIndex === 0) {
      setStartDate(dates)
      setCalendarOpen(false) // Close calendar after selection for single day
    } else {
      const [start, end] = dates
      setStartDate(start)
      setEndDate(end)
      if (start && end) {
        setCalendarOpen(false) // Close calendar after both dates are selected
      }
    }
  }

  const toggleCalendar = () => {
    setCalendarOpen(!calendarOpen)
  }

  return (
    <div className="inline-flex items-center border no-underline rounded-full p-2 gap-3">
      <IconButton
        onClick={handleClick}
        size="small"
        className="text-gray-600 hover:text-gray-800"
        aria-describedby="date-range-popover"
      >
        <Download size={18} />
      </IconButton>

      <Popover
        id="date-range-popover"
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        PaperProps={{
          style: {
            padding: "16px",
            width: "280px", // Increased width
            maxHeight: calendarOpen ? "500px" : "250px", // Dynamic height based on calendar state
            overflowY: "auto",
          },
        }}
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Box className="p-2">
          <Typography variant="subtitle2" className="mb-4" sx={{ color: "rgba(0, 0, 0, 0.6)", paddingBottom: "10px" }}>
            Select Date Range
          </Typography>

          {/* Toggle Single Day / Range Selection */}
          <div className="flex mb-4" style={{ paddingBottom: "10px" }}>
            {["Single Day", "Range"].map((title, index) => (
              <div
                key={index}
                className="font-normal rounded-lg border border-black cursor-pointer h-6 w-full flex justify-center items-center"
                onClick={() => handleRangeSelection(index)}
                style={{
                  backgroundColor: index === selectedIndex ? "#CFDCFF" : "transparent",
                  color: "black",
                  fontSize: "12px",
                  transition: "background-color 0.3s",
                  cursor: "pointer",
                  marginBottom: "5px",
                }}
              >
                {title}
              </div>
            ))}
          </div>

          {/* Date Input Field */}
          <div className="flex mb-4">
            <TextField
              variant="outlined"
              size="small"
              fullWidth
              value={
                selectedIndex === 0
                  ? startDate
                    ? format(startDate, "dd MMM yyyy")
                    : ""
                  : startDate && endDate
                    ? `${format(startDate, "dd MMM yyyy")} - ${format(endDate, "dd MMM yyyy")}`
                    : startDate
                      ? `${format(startDate, "dd MMM yyyy")} - Select end date`
                      : ""
              }
              onClick={toggleCalendar}
              InputProps={{
                readOnly: true,
                style: {
                  height: "36px",
                  fontSize: "14px",
                },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton edge="end" style={{ padding: "4px" }} onClick={toggleCalendar}>
                      <Calendar size={18} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>

          {/* Inline Calendar */}
          {calendarOpen && (
            <div className="mb-4 calendar-container">
              {selectedIndex === 0 ? (
                <DatePicker
                  selected={startDate}
                  onChange={handleDateChange}
                  inline
                  showDisabledMonthNavigation
                  maxDate={new Date("2025-12-31")}
                  minDate={new Date("2020-01-01")}
                />
              ) : (
                <DatePicker
                  selectsRange
                  startDate={startDate}
                  endDate={endDate}
                  onChange={handleDateChange}
                  inline
                  showDisabledMonthNavigation
                  maxDate={new Date("2025-12-31")}
                  minDate={new Date("2020-01-01")}
                />
              )}
            </div>
          )}

          <Box
            className="mt-4 flex justify-end"
            sx={{ display: "flex", gap: "10px", paddingBottom: "10px", paddingTop: "10px" }}
          >
            <Button
              variant="outlined"
              size="small"
              onClick={handleClose}
              sx={{
                padding: "6px 10px ",
                fontSize: "12px",
                color: "#1976d2",
                borderColor: "#1976d2",
                textTransform: "none",
                fontFamily: "Poppins",
                "&:hover": {
                  backgroundColor: "#e3f2fd",
                  borderColor: "#1976d2",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleDownload}
              disabled={(selectedIndex === 0 && !startDate) || (selectedIndex === 1 && (!startDate || !endDate))}
              sx={{
                padding: "6px 10px",
                fontSize: "12px",
                backgroundColor: "#09459E",
                textTransform: "none",
                fontFamily: "Poppins",
                "&:hover": {
                  backgroundColor: "#1565c0",
                },
              }}
            >
              Download
            </Button>
          </Box>

          {/* Display selected date range */}
          {!calendarOpen && selectedIndex === 0 && startDate && (
            <Typography variant="caption" className="block mt-2 text-gray-600">
              Report period: {format(startDate, "MMMM d, yyyy")}
            </Typography>
          )}
          {!calendarOpen && selectedIndex === 1 && startDate && endDate && (
            <Typography variant="caption" className="block mt-2 text-gray-600">
              Report period: {format(startDate, "MMMM d, yyyy")} - {format(endDate, "MMMM d, yyyy")}
            </Typography>
          )}
        </Box>
      </Popover>
    </div>
  )
}

DownloadReport.propTypes = {
  onDownload: PropTypes.func.isRequired,
}

export default DownloadReport

