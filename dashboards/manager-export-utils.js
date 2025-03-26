import * as XLSX from "xlsx-js-style"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable" // Import the autoTable function directly

export const exportData = (data, format, filename) => {
  if (format === "xlsx") {
    exportToExcel(data, filename)
  } else if (format === "csv") {
    exportToCsv(data, filename)
  } else if (format === "pdf") {
    exportToPdf(data, filename)
  } else {
    console.error("Unsupported format:", format)
  }
}

const exportToExcel = (data, filename) => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()

  // ========== Add Styling ==========
  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "09459E" } }, // Company blue
    border: {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } }
    },
    alignment: { horizontal: "center" }
  }

  // Add styles to headers
  const range = XLSX.utils.decode_range(worksheet["!ref"])
  for(let col = range.s.c; col <= range.e.c; col++) {
    const cell = XLSX.utils.encode_cell({ r: 0, c: col })
    worksheet[cell].s = headerStyle
  }

  // Add borders to all cells
  for(let row = 1; row <= range.e.r; row++) {
    for(let col = range.s.c; col <= range.e.c; col++) {
      const cell = XLSX.utils.encode_cell({ r: row, c: col })
      worksheet[cell].s = {
        border: {
          top: { style: "thin", color: { rgb: "D3D3D3" } },
          bottom: { style: "thin", color: { rgb: "D3D3D3" } },
          left: { style: "thin", color: { rgb: "D3D3D3" } },
          right: { style: "thin", color: { rgb: "D3D3D3" } }
        },
        alignment: { vertical: "center" }
      }
    }
  }

  // Conditional formatting for enhancement ratings
  const ratingColumn = "F" // Assuming enhancement_rating is column F
  worksheet["!conditionalFormats"] = [{
    ref: `${ratingColumn}2:${ratingColumn}${range.e.r + 1}`,
    rules: [
      {
        type: "cell",
        operator: "equal",
        value: 4,
        style: { font: { color: { rgb: "228B22" } } } // Forest green
      },
      {
        type: "cell",
        operator: "equal",
        value: 3,
        style: { font: { color: { rgb: "FFD700" } } } // Gold
      },
      {
        type: "cell",
        operator: "equal",
        value: 2,
        style: { font: { color: { rgb: "FFA500" } } } // Orange
      },
      {
        type: "cell",
        operator: "equal",
        value: 1,
        style: { font: { color: { rgb: "FF0000" } } } // Red
      }
    ]
  }]

  // Set column widths
  worksheet["!cols"] = [
    { wch: 25 }, // emp_name
    { wch: 15 }, // employee_id
    { wch: 15 }, // course_id
    { wch: 20 }, // demonstrate_skill
    { wch: 15 }, // date
    { wch: 22 }, // enhancement_rating
    { wch: 35 }, // email
    { wch: 40 }  // suggestions
  ]

  // Freeze header row
  worksheet["!views"] = [{ state: "frozen", ySplit: 1 }]

  XLSX.utils.book_append_sheet(workbook, worksheet, "Feedback")
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}


const downloadCSV = (csv, filename) => {
  const csvFile = new Blob([csv], { type: "text/csv" })
  const downloadLink = document.createElement("a")

  downloadLink.download = filename
  downloadLink.href = window.URL.createObjectURL(csvFile)
  downloadLink.style.display = "none"
  document.body.appendChild(downloadLink)
  downloadLink.click()
  document.body.removeChild(downloadLink)
}


const formatDate = (dateString) => {
  if (!dateString) return "N/A"
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

const exportToPdf = (data, filename) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4"
  })

  // Define columns explicitly for better control
  const columns = [
    { header: "Emp Name", dataKey: "emp_name" },
    { header: "Emp ID", dataKey: "employee_id" },
    { header: "Course ID", dataKey: "course_id" },
    { header: "Skill Demonstrated", dataKey: "demonstrate_skill" },
    { header: "Date", dataKey: "date" },
    { header: "Enhancement Rating", dataKey: "enhancement_rating_text" },
    { header: "Email", dataKey: "emp_email" },
    { header: "Suggestions", dataKey: "suggestions" }
  ]

  // Transform data for PDF
  const mappedData = data.map(item => ({
    emp_name: item.emp_name,
    employee_id: item.employee_id,
    course_id: item.course_id,
    demonstrate_skill: item.demonstrate_skill === "yes" ? "Yes" : "No",
    date: item.demonstrate_skill === "yes" 
      ? formatDate(item.skill_date) 
      : formatDate(item.opportunity_date),
    enhancement_rating_text: item.enhancement_rating_text,
    emp_email: item.emp_email,
    suggestions: item.suggestions || "N/A"
  }))

  autoTable(doc, {
    columns,
    body: mappedData,
    margin: { top: 20 },
    styles: {
      fontSize: 10,
      cellPadding: 2,
      overflow: "linebreak"
    },
    headerStyles: {
      fillColor: "#09459e",
      textColor: "white",
      fontSize: 11,
      fontStyle: "bold"
    },
    alternateRowStyles: {
      fillColor: "#f5f5f5"
    },
    columnStyles: {
      suggestions: { cellWidth: 40 },
      emp_email: { cellWidth: 45 }
    },
    theme: "grid",
    tableWidth: "wrap",
    horizontalPageBreak: true,
    horizontalPageBreakRepeat: 0
  })

  doc.save(`${filename}.pdf`)
}