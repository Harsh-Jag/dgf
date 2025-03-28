"use client"

import { useState, useContext, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  FormControlLabel,
  Switch,
} from "@mui/material"
import AuthContext from "../Auth/AuthContext"
import "./Header.css"
import { toPascalCase } from "../../utils/stringUtils"
import { arrayBufferToBase64 } from "../../utils/ImgConveter"
import axios from "axios"

import NotificationIcon from "../../assets/Notification-icon.svg"
import ArrowDownIcon from "../../assets/arrow-down.svg"

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null)
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [profileImage, setProfileImage] = useState("")
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [showAllNotifications, setShowAllNotifications] = useState(false)
  const location = useLocation() // Get the current location
  useEffect(() => {
    if (user && user.profile_image && user.profile_image.data) {
      const base64Flag = `data:image/jpeg;base64,${arrayBufferToBase64(user.profile_image.data)}`
      setProfileImage(base64Flag)
    }
  }, [user])

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/notifications", {
          params: { empId: user.emp_id, roleId: user.role_id }, // Fetch notifications based on role
        })
        setNotifications(response.data)
        setUnreadCount(response.data.filter((notification) => !notification.is_read).length)
      } catch (err) {
        console.error("Error fetching notifications:", err)
      }
    }

    if (user) {
      fetchNotifications() // Initial fetch

      const intervalId = setInterval(() => {
        fetchNotifications() // Periodic fetch
      }, 30000) // Fetch every 30 seconds

      return () => clearInterval(intervalId) // Cleanup on component unmount
    }
  }, [user])

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget)
  }

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null)
    setShowAllNotifications(false) // Reset to show only the first 5 notifications
  }

  const handleNotificationClick = async (notification) => {
    setSelectedNotification(notification)
    setDialogOpen(true)

    if (!notification.is_read) {
      try {
        await axios.post("http://localhost:8000/api/notifications/mark-as-read", {
          notificationId: notification.id,
          empId: user.emp_id, // Pass empId to mark it as read for the specific user
        })

        // Update the notification state locally, only change the read status for the clicked notification
        setNotifications((prevNotifications) =>
          prevNotifications.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n)),
        )

        // Decrease unread count
        setUnreadCount((prevCount) => prevCount - 1)
      } catch (err) {
        console.error("Error marking notification as read:", err)
      }
    }
  }

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((notification) => !notification.is_read)

      if (unreadNotifications.length > 0) {
        console.log(
          "Marking notifications as read:",
          unreadNotifications.map((n) => n.id),
        )

        const requests = unreadNotifications.map((notification) =>
          axios.post("http://localhost:8000/api/notifications/mark-as-read", {
            notificationId: notification.id,
            empId: user.emp_id,
          }),
        )

        await Promise.all(requests)

        // Update the notification state locally, mark all as read
        setNotifications((prevNotifications) => prevNotifications.map((n) => ({ ...n, is_read: true })))

        // Reset unread count
        setUnreadCount(0)
      }
    } catch (err) {
      console.error("Error marking all notifications as read:", err)
      if (err.response) {
        console.error("Server response:", err.response.data)
      }
    }
  }
  const handleDialogClose = () => {
    setDialogOpen(false)
    setSelectedNotification(null)
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleViewAllClick = () => {
    setShowAllNotifications(true)
  }

  const handleProfileClick = () => {
    navigate("/profile")
    handleMenuClose()
  }

  return (
    <AppBar position="static" className="header">
      <Toolbar>
        <Typography
          variant="h6"
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600,
            color: "#333333",
            marginBottom: "20px",
          }}
        >
          Demand Generation Framework <span style={{ fontSize: "0.8em", color: "#707070" }}>(DGF)</span>
        </Typography>

        {/* Spacer to push items to the right */}
        <div style={{ flexGrow: 1 }} />

        {/* Notification Icon */}
        <IconButton
          color="inherit"
          style={{ marginRight: "30px", marginBottom: "20px" }}
          onClick={handleNotificationMenuOpen}
        >
          <Badge
            badgeContent={unreadCount}
            sx={{
              "& .MuiBadge-badge": {
                backgroundColor: "#FE1F1F",
                color: "white",
                marginTop: "4px",
                marginRight: "-2px",
                width: "18px",
                height: "18px",
                fontSize: "11px",
                borderRadius: "50%",
              },
            }}
          >
            <img
              src={NotificationIcon || "/placeholder.svg"}
              alt="Notification"
              style={{ width: "18px", height: "18px" }}
            />
          </Badge>
        </IconButton>

        {/* Notification Dropdown Menu */}
        <Menu
          anchorEl={notificationAnchorEl}
          open={Boolean(notificationAnchorEl)}
          onClose={handleNotificationMenuClose}
        >
          <div className="notification_wrapper">
            <div className="noti_header">
              <Typography variant="h6">Notifications</Typography>
              {unreadCount > 0 && ( // Only show the toggle and button if there are unread notifications
                <>
                  <div className="unread_only">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showAllNotifications}
                          onChange={() => setShowAllNotifications(!showAllNotifications)}
                          name="unreadOnly"
                          color="primary"
                        />
                      }
                      label="Unread Only"
                    />
                  </div>
                  <Button onClick={handleMarkAllAsRead}>Mark All as Read</Button>
                </>
              )}
            </div>
            <List className="notifs__parent">
              {notifications.length === 0 || unreadCount === 0 ? ( // Show "No new notifications" if no unread notifications
                <ListItem>
                  <ListItemText primary="No new notifications" />
                </ListItem>
              ) : (
                (showAllNotifications
                  ? notifications
                  : notifications.filter((notification) => !notification.is_read).slice(0, 5)
                ).map((notification) => (
                  <div key={notification.id}>
                    <ListItem button onClick={() => handleNotificationClick(notification)}>
                      <ListItemText
                        primary={`Request ID: ${notification.requestid}`}
                        secondary={`Status: ${notification.message}`}
                      />
                      <div
                        title="Click to Mark as Read"
                        className={notification.is_read ? "read_noty" : "unread_noty"}
                      ></div>
                    </ListItem>
                    <Divider />
                  </div>
                ))
              )}
            </List>
            {!showAllNotifications && notifications.length > 3 && unreadCount > 0 && (
              <div className="noty_btn_wrapper">
                <Button className="view_all_btn" role="link" onClick={handleViewAllClick}>
                  View All
                </Button>
              </div>
            )}
          </div>
        </Menu>
        {/* Notification Details Dialog */}
        <Dialog open={dialogOpen} onClose={handleDialogClose}>
          <DialogTitle>Notification Details</DialogTitle>
          <DialogContent>
            {selectedNotification && (
              <>
                <DialogContentText>
                  <strong>Request ID:</strong> {selectedNotification.requestid}
                </DialogContentText>
                <DialogContentText>
                  <strong>Status:</strong> {selectedNotification.message}
                </DialogContentText>
                <DialogContentText>
                  <strong>Modified Date:</strong> {new Date(selectedNotification.modifieddate).toLocaleString()}
                </DialogContentText>
                <DialogContentText>
                  <strong>Requested By:</strong> {selectedNotification.requestedby_name}
                </DialogContentText>
                {selectedNotification.requestonbehalfof_name && (
                  <DialogContentText>
                    <strong>On Behalf Of:</strong> {selectedNotification.requestonbehalfof_name}
                  </DialogContentText>
                )}
                {selectedNotification.approvedby_name && (
                  <DialogContentText>
                    <strong>Approved By:</strong> {selectedNotification.approvedby_name}
                  </DialogContentText>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Profile Image and Dropdown */}
        <div className="profile" onClick={handleMenuOpen}>
          <Avatar alt="User" src={profileImage} style={{ width: "200px", height: 100 }} />{" "}
          {/* Use the base64-encoded image */}
          <Typography variant="body1" style={{ marginLeft: "10px", color: "black" }}>
            {user ? toPascalCase(user.name) : "User"}
          </Typography>
          <img
            src={ArrowDownIcon || "/placeholder.svg"}
            alt="Notification"
            style={{ width: "10px", height: "10px", paddingLeft: "10px", fill: "#707070" }}
          />
        </div>

        {/* Dropdown Menu */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}

export default Header

