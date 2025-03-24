// excelExportController

const excelExportService = require('../services/excelExportService');
const fs = require('fs');
const path = require('path');

const exportExcel = (req, res) => {
  try {
    const { fromDate, toDate, status } = req.query;

    // Validate required parameters
    if (!fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        error: 'Both fromDate and toDate parameters are required'
      });
    }

    // Validate date format (basic check)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(fromDate) || !dateRegex.test(toDate)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    excelExportService.exportToExcel(
      fromDate,
      toDate,
      status || 'all', // Default to 'all' if status not provided
      (err, result) => {
        if (err) {
          console.error('Export error:', err);
          return res.status(500).json({
            success: false,
            error: 'Failed to generate report',
            details: err.message
          });
        }

        // Set download headers
        res.download(result.filePath, 'training_report.xlsx', (downloadError) => {
          if (downloadError) {
            console.error('Download failed:', downloadError);
            return res.status(500).json({
              success: false,
              error: 'File download failed'
            });
          }

          // Cleanup: Delete file after download
          try {
            if (fs.existsSync(result.filePath)) {
              fs.unlinkSync(result.filePath);
              console.log('Temporary file cleaned:', result.filePath);
            }
          } catch (cleanupError) {
            console.error('File cleanup error:', cleanupError);
          }
        });
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
};

const getReportData = async (req, res) => {
  try {
    const { fromDate, toDate, status } = req.query;

    // Validation (same as exportExcel)
    if (!fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        error: 'Both fromDate and toDate parameters are required'
      });
    }

    // Get data from service
    excelExportService.getReportData(fromDate, toDate, status || 'all', (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch report data',
          details: err.message
        });
      }

      res.json({
        success: true,
        count: results.length,
        data: results
      });
    });

  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
};

module.exports = {
  exportExcel,
  getReportData
};
