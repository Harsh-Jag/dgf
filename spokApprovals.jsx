import {  useState ,useEffect,useContext} from "react";
import PropTypes from 'prop-types';
import { useNavigate ,useParams } from "react-router-dom";
import { Paper, Typography, Menu,MenuItem,Pagination,IconButton, Grid2, Divider, Box, FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Radio, RadioGroup, FormControlLabel, TextField, Button, Avatar, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import "./SpocApproval.css";
import AuthContext from "../Auth/AuthContext";
import formatDate from "../../utils/dateUtils";
import removeHtmlTags from "../../utils/htmlUtils";
import { arrayBufferToBase64 } from '../../utils/ImgConveter';
import { io } from "socket.io-client";  
import { ChatContext } from '../context/ChatContext'; // Import ChatContext
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
 
const SpocApproval = ({roleId}) => {
const [learners, setLearners] = useState([]);

const [action, setAction] = useState("approve");
const navigate = useNavigate();
const { requestid } = useParams();
const { user } = useContext(AuthContext);
const { messages, sendMessage, newMessage, setNewMessage } = useContext(ChatContext);
const [comments, setComments] = useState([]);
const [userProfiles, setUserProfiles] = useState({});

const [requestDetails, setRequestDetails] = useState(null);
const itemsPerPage = 5;
const [page, setPage] = useState(1);
const [socket, setSocket] = useState(null);
const [sortedLearners, setSortedLearners] = useState(learners); // State to hold sorted learners
const [anchorEl, setAnchorEl] = useState(null); // For menu anchor
const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
const handleClosePopup = () => setPopupOpen(false);

useEffect(() => {
  const fetchData = async () => {
    try {
      // Reset states when fetching new request data
      setComments([]);
      setNewMessage('');
      setRequestDetails(null);
      setLearners([]);
      setUserProfiles({});

      // Fetch request details
      const requestResponse = await fetch(`http://localhost:8000/api/training-request/${requestid}`);
      const requestdata = await requestResponse.json();
      setRequestDetails(requestdata);

      // Fetch learners
      const learnerResponse = await fetch(`http://localhost:8000/api/getEmpNewTrainingRequested/getEmpNewTrainingRequested/?requestid=${requestid}`);
      const learnerdata = await learnerResponse.json();
      const initialLearners = learnerdata.employees || [];
      setLearners(initialLearners);
      setSortedLearners(initialLearners);

      // Fetch comments
      const commentsResponse = await fetch(`http://localhost:8000/api/comments/${requestid}`);
      const commentsdata = await commentsResponse.json();
      setComments(commentsdata);

      // Fetch user profiles for comments
      const userIds = new Set();
      commentsdata.forEach(comment => {
        if (comment.created_by) userIds.add(comment.created_by);
      });

      const profiles = {};
      for (let userId of userIds) {
        const userResponse = await fetch(`http://localhost:8000/api/getempdetails/getEmpbasedOnId/${userId}`);
        const userData = await userResponse.json();
        if (userData && userData.length > 0) {
          if (userData[0]?.profile_image?.data) {
            const base64Image = `data:image/jpeg;base64,${arrayBufferToBase64(userData[0].profile_image.data)}`;
            userData[0].profile_image = base64Image;
          }
          profiles[userId] = userData[0];
        }
      }
      setUserProfiles(profiles);

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  fetchData();
}, [requestid]); // Runs when requestid changes


const totalPages = Math.ceil(learners.length / itemsPerPage);
const currentItems = sortedLearners.slice(
  (page - 1) * itemsPerPage,
  page * itemsPerPage
);

const sortedComments = comments.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
 
useEffect(() => {
  if (Array.isArray(learners)) {
  const updatedLearners = learners.map(learner => {
    if (learner.profile_image && learner.profile_image.data) {
      const base64Flag = `data:image/jpeg;base64,${arrayBufferToBase64(learner.profile_image.data)}`;
      if (learner.profile_image !== base64Flag) {
        return { ...learner, profile_image: base64Flag };
      }
    }
    return learner;
  });
  setLearners(updatedLearners);
}
}, [learners.length]);

useEffect(() => {
  const socketConnection = io("http://localhost:8000");
  setSocket(socketConnection);
 
  return () => {
    socketConnection.disconnect();
  };
}, []);

const handleClick = (event) => {
  setAnchorEl(event.currentTarget);
};
 
const handleClose = () => {
  setAnchorEl(null);
};
 
const handleSort = (order) => {
 
  const sortedData = [...learners].sort((a, b) => {
    const nameA = a.emp_name.toUpperCase(); // Ensure case-insensitive comparison
    const nameB = b.emp_name.toUpperCase();
   
    if (nameA < nameB) return order === 'asc' ? -1 : 1;
    if (nameA > nameB) return order === 'asc' ? 1 : -1;
    return 0;
  });
 
  setSortedLearners(sortedData); // Update the sorted learners state
  // setSortOrder(order); // Store the order (optional for future use)
  handleClose(); // Close the menu after sorting
};

const handleSubmit = async () => {
  if (!newMessage.trim()) {
    setPopupOpen(true);
    return;
  }

  try {
    // Prepare request data
    const requestData = {
      requestId: requestDetails?.requestid,
      status: action,
      roleId: roleId,
      approverId: user.emp_id,
    };

    // Prepare comment data
    const commentdata = {
      requestid: requestDetails?.requestid,
      comment_text: newMessage,
      parent_comment_id: null,
      created_by: user.emp_id,
      requestStatus: "Approval Requested",
    };

    // Step 1: Update request status
    const statusResponse = await fetch("http://localhost:8000/api/request-status/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    });

    if (!statusResponse.ok) {
      console.error("Error in status update:", await statusResponse.json());
      return;
    }

    // Step 2: Add comment
    const commentResponse = await fetch("http://localhost:8000/api/comments/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(commentdata),
    });

    if (!commentResponse.ok) {
      console.error("Error adding comment:", await commentResponse.json());
      return;
    }

    // Step 3: Send email
    await fetch("http://localhost:8000/api/email/approveRejectSuspendClarify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        commentdata,
        action: action,
        requestid: requestDetails?.requestid,
        requestedby: requestDetails?.requestedby,
        requestedbyid: "swaroop.bidkar@harbingergroup.com"
      }),
    });

    // Clear states and refresh data
    setNewMessage('');
    setStatusDialogOpen(true);
    
    // Refresh comments
    const refreshComments = await fetch(`http://localhost:8000/api/comments/${requestid}`);
    const newComments = await refreshComments.json();
    setComments(newComments);

  } catch (error) {
    console.error("Submission error:", error);
  }
};

// Cleanup effect
useEffect(() => {
  return () => {
    setNewMessage('');
    setComments([]);
    setRequestDetails(null);
    setLearners([]);
  };
}, []);
  

const handleCloseStatusDialog = () => {
  setStatusDialogOpen(false);
  navigate("/training-container");
}
 
return (
  <>
    <Box justifyContent="space-between">
      <Typography fullWidth variant="h5" gutterBottom className="mainHeading" style={{ fontWeight: "bold", fontSize: "14px", paddingLeft:"34px" }}>
        Approve Learning Request
      </Typography>
      <Divider style={{ margin: "1rem -20px 1rem 0 "}} />
    </Box>
 
    <Paper elevation={1} className="paper" style={{ height: "100%", width: "96%" }}>
      <div className="inner-container">
        <Box style={{ padding: "10px", marginTop: "1rem" }}>
          <Grid2 container spacing={5}>
            <Grid2 item size={4}>
              <FormControl fullWidth className="form-control" style={{ marginBottom: "1rem" }}>
                <Typography className="typography-label-upper">
                  Request ID/No:
                </Typography>
                <Typography className="typography-value-upper">
                #{requestDetails?.requestid}
                </Typography>
              </FormControl>
            </Grid2>
            <Grid2 item size={4}>
              <FormControl fullWidth className="form-control">
                <Typography className="typography-label-upper">
                  Request By:
                </Typography>
                <Typography className="typography-value-upper">
                {requestDetails?.requestedby}
                </Typography>
              </FormControl>
            </Grid2>
            <Grid2 item size={4}>
              <FormControl fullWidth className="form-control">
                <Typography className="typography-label-upper">
                  Project:
                </Typography>
                <Typography className="typography-value-upper">
                 {requestDetails?.newprospectname || requestDetails?.project}            
                </Typography>
              </FormControl>
            </Grid2>
          </Grid2>
          <Grid2 container spacing={5} style={{ marginTop: "1rem" }}>
            <Grid2 item size={4}>
              <FormControl fullWidth className="form-control">
                <Typography className="typography-label-upper">
                  Service Division:
                </Typography>
                <Typography className="typography-value-upper">
                {requestDetails?.service_division}
                </Typography>
              </FormControl>
            </Grid2>
            <Grid2 item size={4}>
              <FormControl fullWidth className="form-control">
                <Typography className="typography-label-upper">
                  Expected Completion:
                </Typography>
                <Typography className="typography-value-upper">
                  {formatDate(requestDetails?.expecteddeadline)  }                  
                </Typography>
              </FormControl>
            </Grid2>
            <Grid2 item size={4}>
              <FormControl fullWidth className="form-control">
                <Typography className="typography-label-upper">
                  Techstack / Area:
                </Typography>
                <Typography className="typography-value-upper">
                  {requestDetails?.techstack}
                </Typography>
              </FormControl>
            </Grid2>
          </Grid2>
          <Grid2 container spacing={5} style={{ marginTop: "1rem" }}>
<Grid2 item size={4}>
  <FormControl fullWidth className="form-control">
    <Typography className="typography-label-upper">
      Primary Skills :
    </Typography>
    <Typography className="typography-value-upper">
                  {requestDetails?.primarySkills}
                </Typography>
  </FormControl>
</Grid2>
</Grid2>
        </Box>
        <Divider className="divider" style={{ marginTop: "1rem", marginBottom: "1rem" }} />
        <Box>
          <Grid2 container spacing={5} style={{ marginTop: "1rem" }}>
            <Grid2 item size={4}  style={{ maxWidth:"400px"}} >
              <FormControl fullWidth className="form-control">
                <Typography className="typography-label-upper">
                  Other Relevant Information:
                </Typography>
                <Typography className="typography-value-upper">
                 { removeHtmlTags(requestDetails?.otherskill)}
                </Typography>
              </FormControl>
            </Grid2>
            <Grid2 item size={8}>
              <FormControl fullWidth className="form-control" style={{ marginBottom: "1rem", display: "flex" }}>
                <Typography className="typography-label-upper">
                  Completion Criteria:
                </Typography>
                <Typography  className="typography-value-upper"
style={{ fontSize: "12px", display: "flex", alignItems: "center" }}>
  {removeHtmlTags(requestDetails?.suggestedcompletioncriteria)}
  </Typography>
 
              </FormControl>
            </Grid2>
          </Grid2>
          <Grid2 container spacing={5} style={{ marginTop: "1rem" }}>
            <Grid2 item size={12}>
              <FormControl fullWidth className="form-control">
                <Typography className="typography-label-upper">
                Desired Impact:
                </Typography>
                <Typography  className="typography-value-upper"  style={{ fontSize: "12px", display: "flex", alignItems: "center" }}>
                  {removeHtmlTags(requestDetails?.comments)}
                </Typography>
 
 
              </FormControl>
            </Grid2>
          </Grid2>
        </Box>
        <Divider className="divider" style={{ marginTop: "1rem", marginBottom: "1rem" }} />
        <Box>
          <div style={{ maxWidth: "100%", margin: "auto", padding: 20 }}>
            <h2 style={{ fontSize: "12px", marginBottom: "1rem" }}>{learners.length} Learner(s) are allocated to this learning request</h2>
            <TableContainer
              component={Paper}
              style={{ padding: "16px", marginTop: "16px", maxWidth: "97%" ,marginLeft:"-18px"}} elevation={0}
            >
              <Table size="small">
                {learners.length > 0 && (
                  <TableHead sx={{ backgroundColor: "#CCE3FF" }}>
                    <TableRow>
                      <TableCell
                        style={{ padding: "8px", fontWeight: "bold", fontSize: "12px" }}
                      >
                        Employee ID
                      </TableCell>
                      <TableCell style={{ padding: "8px", fontSize: "12px" }}>
<Box display="flex" justifyContent="space-between" alignItems="center">
  <Typography style={{ flex: 1, textAlign: 'center',fontWeight: "550" }}>
    Name
  </Typography>
  <IconButton onClick={handleClick} size="small">
    <MoreVertIcon />
  </IconButton>
</Box>
</TableCell>
                      <TableCell
                        style={{ padding: "8px", fontWeight: "bold", fontSize: "12px" }}
                      >
                        Available From
                      </TableCell>
                      <TableCell
                        style={{ padding: "8px", fontWeight: "bold", fontSize: "12px" }}
                      >
                        Daily Bandwidth
                      </TableCell>
                      <TableCell
                        style={{ padding: "8px", fontWeight: "bold", fontSize: "12px" }}
                      >
                        Available on Weekend?
                      </TableCell>
                    </TableRow>
                  </TableHead>
                )}

<TableBody>
  {currentItems.length > 0 ? (
    currentItems.map((learner) => (
      <TableRow key={learner.emp_id}>
        <TableCell style={{ padding: "8px", fontSize: "12px" }}>
          {learner.emp_id}
        </TableCell>
        <TableCell style={{ padding: "8px", fontSize: "12px" }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar alt="User" src={learner.profile_image} /> {/* Use the base64-encoded image */}
            {learner.emp_name}
          </Box>
        </TableCell>
        <TableCell style={{ padding: "8px", fontSize: "12px" }}>
          {formatDate(learner.availablefrom)}
        </TableCell>
        <TableCell style={{ padding: "8px", fontSize: "12px" }}>
          {learner.dailyband}
        </TableCell>
        <TableCell style={{ padding: "8px", fontSize: "12px" }}>
          {learner.availableonweekend === 1 ? "Yes" : "No"}
        </TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={5} style={{ textAlign: "center" }}>
        No learners found
      </TableCell>
    </TableRow>
  )}
</TableBody>
              </Table>
 
              {/* Menu for sorting */}
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
    >
      <MenuItem onClick={() => handleSort('asc')} sx={{ fontSize: '12px'  }}>Sort Ascending</MenuItem>
      <MenuItem onClick={() => handleSort('desc')}sx={{ fontSize: '12px' }}> Sort Descending</MenuItem>
    </Menu>
 
            </TableContainer>
 
 
            <Box sx={{
  display: "flex",
  justifyContent: "space-between",
  mt: 2,
  alignItems: "center"
}}>
  <Typography variant="body2" color="text.secondary">
    Showing {learners.length === 0 ? 0 : (page - 1) * itemsPerPage + 1}-
    {Math.min(page * itemsPerPage, learners.length)} of {learners.length} records
  </Typography>
  <Pagination
    count={totalPages}
    page={page}
    onChange={(e, value) => setPage(value)}
    shape="rounded"
    color="primary"
    sx={{
      '& .MuiPaginationItem-root.Mui-selected': {
        color: 'red', // Change text color for selected page
        fontWeight: 'bold', // Optional: Change font weight,
        backgroundColor: 'transparent', // Optional: Remove background color
      },
      '& .MuiPaginationItem-root': {
        margin: '-1px', // Reduce the space between page numbers (adjust as necessary)
      },
    }}
  />
</Box>
 
            <Box
              style={{
                backgroundColor: "#F8FBFF",
                padding: "16px",
                borderRadius: "8px",
                marginTop: "1rem",
                marginBottom: "1rem"
              }}
            >
<Box
display="flex"
flexDirection="column"
gap={2}
paddingLeft={5}
style={{ height: '150px', overflowY: 'auto' }} // Add this line
>
{sortedComments.length > 0 ? (
  sortedComments.map((comment) => {
    console.log('Rendering Comment:', comment); // Add this line to log each comment being rendered
    return (
      <div key={comment.comment_id} className="user-profile" style={{ marginBottom: '16px' }}>
        <div className="avatar-name" style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <Avatar
            alt="User"
            src={userProfiles[comment.created_by]?.profile_image || '/default-avatar.png'}
            style={{ marginRight: '8px' }}
          />
          <Typography className="typography-value-upper">
            {userProfiles[comment.created_by]?.emp_name || 'Unknown'}
          </Typography>
        </div>
        <Typography className="typography-value-upper" style={{ marginBottom: '8px' }}>
          {comment.comment_text}
        </Typography>
        <Typography className="typography-label-upper" style={{ fontSize: '0.85rem' }}>
          {new Date(comment.created_date).toLocaleString()}
        </Typography>
      </div>
    );
  })
) : (
  <Typography>No comments available.</Typography>
)}
</Box>
<Typography style={{ fontSize: "12px", marginBottom: "1rem", color: "#4F4949" }}>
  Take action on this training request
</Typography>
              <FormControl component="fieldset" style={{ marginBottom: "1rem" }}>
                {/* Update the RadioGroup with consistent styling */}
<RadioGroup
  row
  value={action}
  onChange={(e) => setAction(e.target.value)}
>
  <FormControlLabel
    value="approve"
    control={<Radio color="primary" />}  // Added color="primary"
    label={
      <Typography style={{ fontSize: "12px", fontWeight: "bold" }}>
        Approve
      </Typography>
    }
  />
  <FormControlLabel
    value="reject"
    control={<Radio color="primary" />}  // Added color="primary"
    label={
      <Typography style={{ fontSize: "12px", fontWeight: "bold" }}>
        Reject
      </Typography>
    }
  />
  {roleId === 4 && (
    <FormControlLabel 
      value="hold" 
      control={<Radio color="primary" />}  // Added color="primary"
      label={<Typography style={{ fontSize: "12px", fontWeight: "bold" }}>Suspend Learning</Typography>} 
    />
  )}
  <FormControlLabel
    value="needClarification"
    control={<Radio color="primary" />}  // Added color="primary"
    label={
      <Typography style={{ fontSize: "12px", fontWeight: "bold" }}>
        Need Clarification
      </Typography>
    }
  />
</RadioGroup>
              </FormControl>
              <FormControl fullWidth style={{ marginBottom: "1rem" }}>
              <Typography style={{ fontSize: "12px", marginTop: "0.5rem", color: "#4F4949", display: 'inline' }}>
  Comments
  <span style={{ color: 'red' }}>*</span>
</Typography>
                <TextField
                  multiline
                  rows={4} // Ensure this is set to 4 rows
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  InputProps={{
                    style: { fontSize: '12px', backgroundColor: '#ffffff', padding: '10px', minHeight: '100px' }, // Set minimum height
                  }}
                />
              </FormControl>
            </Box>
            <Box
              display="flex"
              justifyContent="flex-end"
              style={{ marginTop: "4rem" }}
              gap={2}
            >
              <Button
                variant="outlined"
                style={{ minWidth: "12px", textTransform: 'none', color: '#1C71FE', boxShadow: 'none', border: 'none', }}
                onClick={() => navigate("/training-container")} // Add this line
              >
                Cancel
              </Button>
              <Button
  variant="contained"
  style={{ 
    minWidth: "120px", 
    textTransform: 'none', 
    borderRadius: '10px',
    backgroundColor: !newMessage.trim() ? '#CCCCCC' : '#066DD2',
    color: 'white',
    boxShadow: 'none'
  }}
  onClick={handleSubmit}
  disabled={!newMessage.trim()}
>
  Submit
</Button>
            </Box>
          </div>
        </Box>
      </div>
    </Paper>
    <Dialog
open={statusDialogOpen}
onClose={handleCloseStatusDialog}
maxWidth="xs"
fullWidth
PaperProps={{
  style: {
    padding: "10px",
    borderRadius: "8px",
    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
  },
}}
><DialogTitle
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontSize: "24px",
  }}
>
  <CheckCircleIcon style={{ color: "green", fontSize: "3rem" }} />
  Status updated successfully!
  <IconButton
    onClick={handleCloseStatusDialog}
    style={{
      position: "absolute",
      right: "10px",
      top: "10px",
      padding: "0",
    }}>
       <CloseIcon style={{ fontSize: "1.5rem" }} />
      </IconButton>
      </DialogTitle>
      </Dialog>
      <Dialog open={popupOpen} onClose={handleClosePopup}>
        <DialogTitle>Missing Comments</DialogTitle>
        <DialogContent>Please add comments before submitting.</DialogContent>
        <DialogActions>
          <Button onClick={handleClosePopup} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
  </>
);
};
 
SpocApproval.propTypes = {
  roleId: PropTypes.number.isRequired,
};
 
export default SpocApproval;
 
