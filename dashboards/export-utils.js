import { jsPDF } from "jspdf"
import "jspdf-autotable"
import XLSX from "xlsx-js-style"

/**
 * Utility functions for exporting data to different formats
 */

// Format date for display
const formatDate = (date) => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Map numeric ratings to text
 * @param {string} field - The field name
 * @param {string|number} value - The rating value
 * @returns {string} - The text representation of the rating
 */
const mapRatingToText = (field, value) => {
  const mappings = {
    instruction_rating: {
      4: "Very Good",
      3: "Good",
      2: "Interesting",
      1: "Average",
    },
    engaged_rating: {
      4: "Totally Engaged",
      3: "Very Engaged",
      2: "Engaged",
      1: "Somewhat Engaged",
    },
    interactive: {
      2: "Yes",
      1: "No",
    },
    interactive_components: {
      4: "Very Interactive",
      3: "Interactive",
      2: "Somewhat Interactive",
      1: "Less Interactive",
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

/**
 * Format feedback data for export
 * @param {Array} data - The feedback data to format
 * @returns {Array} - Formatted data for export
 */
const formatFeedbackData = (data) => {
  return data.map((item) => ({
    "Employee ID": item.employee_id || "",
    "Employee Name": item.emp_name || "",
    "Employee Email": item.emp_email || "",
    "Course ID": item.course_id || "",
    "Training Topic": item.training_topic || "",
    "Request ID": item.reqid || "",
    "Instruction Rating": mapRatingToText("instruction_rating", item.instruction_rating) || "",
    "Engagement Rating": mapRatingToText("engaged_rating", item.engaged_rating) || "",
    "Program Engaging": mapRatingToText("interactive", item.interactive) || "",
    "Interaction Level": mapRatingToText("interactive_components", item.interactive_components) || "",
    "Overall Experience": mapRatingToText("engaged_session_rating", item.engaged_session_rating) || "",
    "Areas for Improvement": item.improved_comments || "",
    "Other Suggestions": item.other_suggestions || "",
    "Date Submitted": formatDate(item.created_at || item.date || new Date()),
  }))
}

/**
 * Add header to PDF document
 * @param {jsPDF} doc - The PDF document
 */
const addReportHeader = (doc) => {
  doc.setFontSize(18)
  doc.setTextColor(9, 69, 158)
  doc.setFont("helvetica", "bold")
  doc.text("Learning Feedback Report", 14, 22)
  
  doc.setFontSize(11)
  doc.setTextColor(100)
  doc.setFont("helvetica", "normal")
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)
}

/**
 * Export data to PDF format
 * @param {Array} data - The data to export
 * @param {string} fileName - The name of the file to download
 */
export const exportToPDF = (data, fileName = "feedback_report") => {
  if (!data || data.length === 0) {
    console.error("No data to export")
    return
  }

  const formattedData = formatFeedbackData(data)
  const doc = new jsPDF("landscape", "pt", "a4")

  // Add Header
  addReportHeader(doc)

  // Main Ratings Table
  const mainColumns = [
    { header: "Employee", dataKey: "Employee Name" },
    { header: "Training Topic", dataKey: "Training Topic" },
    { header: "Instruction", dataKey: "Instruction Rating" },
    { header: "Engagement", dataKey: "Engagement Rating" },
    { header: "Overall", dataKey: "Overall Experience" },
    { header: "Interactive", dataKey: "Interaction Level" },
  ]

  doc.autoTable({
    startY: 60,
    head: [mainColumns.map(col => col.header)],
    body: formattedData.map(item => mainColumns.map(col => item[col.dataKey])),
    theme: "grid",
    styles: {
      fontSize: 10,
      cellPadding: 6,
      halign: "center",
      valign: "middle"
    },
    headStyles: {
      fillColor: [9, 69, 158],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 11
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: {
      0: { halign: "left", cellWidth: 120 },
      1: { cellWidth: 150 },
    },
    margin: { top: 60 }
  })

  // Comments Table
  const commentColumns = [
    { header: "Employee", dataKey: "Employee Name" },
    { header: "Improvement Areas", dataKey: "Areas for Improvement" },
    { header: "Suggestions", dataKey: "Other Suggestions" }
  ]

  doc.addPage("landscape")
  addReportHeader(doc)
  
  doc.autoTable({
    startY: 60,
    head: [commentColumns.map(col => col.header)],
    body: formattedData.map(item => commentColumns.map(col => item[col.dataKey])),
    styles: {
      fontSize: 10,
      cellPadding: 6,
      halign: "left"
    },
    headStyles: {
      fillColor: [9, 69, 158],
      textColor: 255,
      fontStyle: "bold"
    },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { cellWidth: 200 },
      2: { cellWidth: 200 }
    }
  })

  // Add footer with page numbers
  const pageCount = doc.getNumberOfPages()
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width - 70,
      doc.internal.pageSize.height - 20
    )
  }

  doc.save(`${fileName}_${new Date().toISOString().split("T")[0]}.pdf`)
}

/**
 * Export data to Excel format with styling
 * @param {Array} data - The data to export
 * @param {string} fileName - The name of the file to download
 */
export const exportToExcel = (data, fileName = "feedback_report") => {
  if (!data || data.length === 0) {
    console.error("No data to export")
    return
  }

  const formattedData = formatFeedbackData(data)
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(formattedData)

  // Define styles
  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { patternType: "solid", fgColor: { rgb: "09459E" } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } }
    }
  }

  const goodRatingStyle = {
    fill: { patternType: "solid", fgColor: { rgb: "D5E8D4" } } // Light green
  }

  const badRatingStyle = {
    fill: { patternType: "solid", fgColor: { rgb: "F8CECC" } } // Light red
  }

  // Apply header styles
  const range = XLSX.utils.decode_range(ws['!ref'])
  for(let C = range.s.c; C <= range.e.c; C++) {
    const cell = XLSX.utils.encode_cell({ c: C, r: 0 })
    if (!ws[cell]) ws[cell] = {}
    ws[cell].s = headerStyle
  }

  // Apply conditional formatting to rating columns
  const ratingColumns = {
    "Instruction Rating": "G",
    "Engagement Rating": "H",
    "Overall Experience": "K"
  }

  Object.entries(ratingColumns).forEach(([colName, colLetter]) => {
    const colIndex = XLSX.utils.decode_col(colLetter)
    for(let R = 1; R <= formattedData.length; R++) {
      const cell = XLSX.utils.encode_cell({ c: colIndex, r: R })
      if (ws[cell]) {
        const ratingText = ws[cell].v
        if (ratingText.includes("Very Good") || ratingText.includes("Totally Engaged")) {
          ws[cell].s = goodRatingStyle
        } else if (ratingText.includes("Average") || ratingText.includes("Somewhat")) {
          ws[cell].s = badRatingStyle
        }
      }
    }
  })

  // Set column widths
  ws['!cols'] = [
    { wch: 15 }, // Employee ID
    { wch: 25 }, // Employee Name
    { wch: 25 }, // Employee Email
    { wch: 15 }, // Course ID
    { wch: 25 }, // Training Topic
    { wch: 15 }, // Request ID
    { wch: 15 }, // Instruction Rating
    { wch: 15 }, // Engagement Rating
    { wch: 15 }, // Program Engaging
    { wch: 20 }, // Interaction Level
    { wch: 20 }, // Overall Experience
    { wch: 30 }, // Areas for Improvement
    { wch: 30 }, // Other Suggestions
    { wch: 15 }  // Date Submitted
  ]

  // Freeze header row
  ws['!freeze'] = { xSplit: 0, ySplit: 1 }

  XLSX.utils.book_append_sheet(wb, ws, "Feedback Data")
  XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().split("T")[0]}.xlsx`)
}

/**
 * Export data to CSV format
 * @param {Array} data - The data to export
 * @param {string} fileName - The name of the file to download
 */
export const exportToCSV = (data, fileName = "feedback_report") => {
  if (!data || data.length === 0) {
    console.error("No data to export")
    return
  }

  const formattedData = formatFeedbackData(data)
  const headers = Object.keys(formattedData[0])

  // Create CSV content with BOM for UTF-8
  let csvContent = "\uFEFF" + headers.join(",") + "\n"

  formattedData.forEach((item) => {
    const row = headers.map(header => {
      let value = item[header] || ""
      // Escape quotes and wrap in quotes if value contains commas or quotes
      if (typeof value === 'string') {
        value = value.replace(/"/g, '""')
        if (value.includes(",") || value.includes('"') || value.includes("\n")) {
          value = `"${value}"`
        }
      }
      return value
    }).join(",")
    csvContent += row + "\n"
  })

  // Create download link
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `${fileName}_${new Date().toISOString().split("T")[0]}.csv`)
  link.style.visibility = "hidden"

  // Trigger download
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Export data to the specified format
 * @param {Array} data - The data to export
 * @param {string} format - The format to export to (xlsx, csv, pdf)
 * @param {string} fileName - The name of the file to download
 */
export const exportData = (data, format, fileName = "feedback_report") => {
  try {
    switch (format.toLowerCase()) {
      case "xlsx":
        exportToExcel(data, fileName)
        break
      case "csv":
        exportToCSV(data, fileName)
        break
      case "pdf":
        exportToPDF(data, fileName)
        break
      default:
        console.error(`Unsupported export format: ${format}`)
        throw new Error(`Unsupported export format: ${format}`)
    }
  } catch (error) {
    console.error(`Error exporting ${format}:`, error)
    throw error
  }
}
