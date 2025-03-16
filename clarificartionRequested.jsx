import React from "react";
import {
  Paper,
  Typography,
  Grid2,
  Divider,
  Pagination,
  Box,
  FormControl,
  TableCell,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  Avatar,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Autocomplete,
  MenuItem,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import CloseIcon from "@mui/icons-material/Close";
import "./ClarificationRequested.css";
import AuthContext from "../Auth/AuthContext";
import formatDate from "../../utils/dateUtils";
import removeHtmlTags from "../../utils/htmlUtils";
import { arrayBufferToBase64 } from "../../utils/ImgConveter";
import { ChatContext } from "../context/ChatContext";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const ClarificationRequested = () => {
  const [learners, setLearners] = useState([]);
  const navigate = useNavigate();
  const { requestid } = useParams();
  const { user } = useContext(AuthContext);
  const [requestDetails, setRequestDetails] = useState(null);
  const { messages, sendMessage, newMessage, setNewMessage } = useContext(ChatContext);
  const [comments, setComments] = useState([]);
  const [userProfiles, setUserProfiles] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [previousEmployeesInDB, setpreviousEmployeesInDB] = useState([]);
  const itemsPerPage = 5;
  const [page, setPage] = useState(1);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);

  const handleClosePopup = () => setPopupOpen(false);
  const handleCloseStatusDialog = () => {
    setStatusDialogOpen(false);
    navigate("/training-container");
  };

  const [formData, setFormData] = useState({
    emails: "",
    employees: [],
    invalidEmails: [],
    showTable: false,
    showSummary: false,
  });

  // Pagination fix: Use formData.employees for total pages calculation
  const totalPages = Math.ceil(formData.employees.length / itemsPerPage);
  const currentItems = formData.employees.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const requestResponse = await fetch(
          `http://localhost:8000/api/training-request/${requestid}`
        );
        const requestdata = await requestResponse.json();
        setRequestDetails(requestdata);

        const learnerResponse = await fetch(
          `http://localhost:8000/api/getEmpNewTrainingRequested/getEmpNewTrainingRequested?requestid=${requestid}`
        );
        const learnerdata = await learnerResponse.json();
        setpreviousEmployeesInDB(learnerdata.employees);

        const updatedLearners = learnerdata.employees.map((learner) => {
          if (learner.profile_image && learner.profile_image.data) {
            const base64Flag = `data:image/jpeg;base64,${arrayBufferToBase64(
              learner.profile_image.data
            )}`;
            return {
              ...learner,
              profile_image: base64Flag,
              availableFrom: learner.availablefrom,
              bandwidth: learner.dailyband,
              weekend: learner.availableonweekend,
            };
          }
          return learner;
        });

        setLearners(updatedLearners);

        const commentsResponse = await fetch(
          `http://localhost:8000/api/comments/${requestid}`
        );
        const commentsdata = await commentsResponse.json();
        setComments(commentsdata);

        const userIds = new Set();
        commentsdata.forEach((comment) => {
          if (comment.created_by) userIds.add(comment.created_by);
        });

        const profiles = {};
        for (const userId of userIds) {
          const userResponse = await fetch(
            `http://localhost:8000/api/getempdetails/getEmpbasedOnId/${userId}`
          );
          const userData = await userResponse.json();
          if (userData && userData.length > 0) {
            if (userData[0]?.profile_image?.data) {
              const base64Image = `data:image/jpeg;base64,${arrayBufferToBase64(
                userData[0].profile_image.data
              )}`;
              userData[0].profile_image = base64Image;
            }
            profiles[userId] = userData[0];
          } else {
            profiles[userId] = {
              emp_name: "Unknown",
              profile_image: "/default-avatar.png",
            };
          }
        }
        setUserProfiles(profiles);

        setFormData((prevFormData) => ({
          ...prevFormData,
          employees: updatedLearners,
          showTable: true,
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [requestid]);

  // Rest of your existing code remains the same...

  const handleSubmit = async () => {
    if (!newMessage.trim()) {
      setPopupOpen(true);
    } else {
      sendMessage(
        newMessage,
        requestDetails?.requestid,
        user.emp_id,
        "Approval Requested"
      );

      try {
        const currentEmployeeIds = formData.employees.map((emp) => emp.emp_id);
        const newEmployees = formData.employees.filter(
          (emp) =>
            !previousEmployeesInDB.some(
              (dbEmp) => dbEmp.emp_id === emp.emp_id
            )
        );
        const employeesToUpdate = formData.employees.filter((emp) =>
          previousEmployeesInDB.some(
            (dbEmp) => dbEmp.emp_id === emp.emp_id && hasChanges(emp, dbEmp)
          )
        );
        const employeesToDelete = previousEmployeesInDB.filter(
          (dbEmp) => !currentEmployeeIds.includes(dbEmp.emp_id)
        );

        await Promise.all([
          ...newEmployees.map((emp) => addEmployeeinDB(emp)),
          ...employeesToUpdate.map((emp) => updateEmployeeinDB(emp)),
          ...employeesToDelete.map((emp) => deleteEmployeeinDB(emp.emp_id)),
        ]);

        setSnackbarMessage("Employee records updated successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);

        setFormData({
          employees: [],
          showTable: false,
          showSummary: false,
          emails: "",
          invalidEmails: [],
        });

        setStatusDialogOpen(true);
      } catch (error) {
        console.error("Error submitting employee data:", error);
        setSnackbarMessage("An error occurred while updating employee records.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } finally {
        handleSubmit.isSubmitting = false;
      }
    }
  };

  return (
    <>
      {/* Existing JSX structure remains the same until comments section */}

      <Box style={{ width: "90%", margin: "auto" }}>
        <FormControl fullWidth style={{ marginBottom: "1rem" }}>
          <Typography style={{ fontSize: "12px", marginTop: "0.5rem", color: "#4F4949" }}>
            Your Comments <span className="required">*</span>
          </Typography>
          <TextField
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            margin="normal"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            InputProps={{
              style: {
                fontSize: "12px",
                backgroundColor: "#ffffff",
                padding: "10px",
                minHeight: "100px",
              },
            }}
          />
        </FormControl>
      </Box>

      <Box display="flex" justifyContent="flex-end" style={{ marginTop: "4rem" }} gap={2}>
        <Button
          variant="outlined"
          style={{
            minWidth: "12px",
            textTransform: "none",
            color: "#1C71FE",
            boxShadow: "none",
            border: "none",
          }}
          onClick={() => navigate("/training-container")}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={!newMessage.trim()}
          style={{
            minWidth: "120px",
            textTransform: "none",
            borderRadius: "10px ",
            backgroundColor: !newMessage.trim() ? "#grey" : "#066DD2",
            boxShadow: "none",
            color: "white",
          }}
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </Box>

      {/* Pagination section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mt: 2,
          alignItems: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Showing {currentItems.length} of {formData.employees.length} records
        </Typography>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, value) => setPage(value)}
          shape="rounded"
          color="primary"
          sx={{
            "& .MuiPaginationItem-root.Mui-selected": {
              color: "red",
              fontWeight: "bold",
              backgroundColor: "transparent",
            },
            "& .MuiPaginationItem-root": {
              margin: "-1px",
            },
          }}
        />
      </Box>

      {/* Rest of the JSX remains the same */}
    </>
  );
};

export default ClarificationRequested;
