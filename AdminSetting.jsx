import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  IconButton,
  Typography,
  Box,
  Pagination,
} from "@mui/material"
import { ArrowForward } from "@mui/icons-material"
import { styled } from "@mui/material/styles"
import axios from "axios"
import UserActionModal from "./UserActionModal"
import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined';

const ArrowForwardDesign = styled(IconButton)(({ theme }) => ({
  width: "22px",
  height: "22px",
  border: "2px solid #000000",
  borderRadius: "50%",
  marginRight: "10px",
  marginLeft: "8px",
  backgroundColor: "rgba(255, 255, 255, 0)",
  "&:hover": {
    backgroundColor: "#d1d1d1",
  },
  "& svg": {
    fontSize: "16px",
    fontWeight: "bold",
  },
}))

const rowsPerPage = 5;

export default function UserTable() {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [actionModalOpen, setActionModalOpen] = useState(false)
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = () => {
    axios
      .get("http://localhost:8000/api/logins")
      .then((response) => {
        const fetchedUsers = response.data.map((user) => ({
          id: user.emp_id,
          name: user.name,
          email: user.email,
          role: user.role_name,
          createdOn: new Date(user.created_on).toLocaleDateString(),
          status: user.status,
          avatar: user.profile_image,
        }))
        setUsers(fetchedUsers)
        setPage(1)
      })
      .catch((error) => {
        console.error("Error fetching users:", error)
      })
  }

  const handleActionClick = (user) => {
    setSelectedUser(user)
    setActionModalOpen(true)
  }

  const handleCloseActionModal = () => {
    setActionModalOpen(false)
    fetchUsers()
  }

  const handlePageChange = (event, newPage) => {
    setPage(newPage)
  }

  const currentUsers = users.slice((page - 1) * rowsPerPage, page * rowsPerPage)
  const startIndex = (page - 1) * rowsPerPage + 1
  const endIndex = Math.min(page * rowsPerPage, users.length)

  return (
    <Box
      sx={{
        backgroundColor: "#FFFFFF",
        borderRadius: "15px",
        opacity: 1,
        padding: 3,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        transition: "min-height 0.3s ease",
      }}
    >
      <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ borderBottom: "2px solid #8FBEF8" }}>
              <TableCell sx={{ fontFamily: "inherit", fontWeight: "bold" }}>User ID</TableCell>
              <TableCell sx={{ fontFamily: "inherit", fontWeight: "bold" }}>Name</TableCell>
              <TableCell sx={{ fontFamily: "inherit", fontWeight: "bold" }}>Email</TableCell>
              <TableCell sx={{ fontFamily: "inherit", fontWeight: "bold" }}>Role</TableCell>
              <TableCell sx={{ fontFamily: "inherit", fontWeight: "bold" }}>Created on</TableCell>
              <TableCell sx={{ fontFamily: "inherit", fontWeight: "bold" }}>Status</TableCell>
              <TableCell sx={{ fontFamily: "inherit", fontWeight: "bold" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentUsers.map((user, index) => (
              <TableRow key={user.id} sx={{ backgroundColor: index % 2 === 0 ? "#F1F2FD" : "white" }}>
                <TableCell sx={{ fontFamily: "inherit" }}>{user.id}</TableCell>
                <TableCell sx={{ fontFamily: "inherit" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar src={user.avatar} sx={{ width: 24, height: 24 }} />
                    <Typography>{user.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ fontFamily: "inherit" }}>{user.email}</TableCell>
                <TableCell sx={{ fontFamily: "inherit" }}>{user.role}</TableCell>
                <TableCell sx={{ fontFamily: "inherit" }}>{user.createdOn}</TableCell>
                <TableCell>
                  <Typography
                    sx={{
                      color: user.status === "active" ? "#2BB381" : user.status === "invited" ? "#B39C2B" : "#AA1700",
                      fontSize: "0.75rem",
                      opacity: 1,
                      fontFamily: "inherit",
                    }}
                  >
                    {user.status}
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontFamily: "inherit" }}>
                  <IconButton onClick={() => handleActionClick(user)}>
                    <ArrowCircleRightOutlinedIcon style={{ height: "20px" }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "inherit" }}>
          {users.length === 0 ? 'No records' : `Showing ${startIndex}-${endIndex} of ${users.length} records`}
        </Typography>
        <Pagination
          count={Math.ceil(users.length / rowsPerPage)}
          page={page}
          onChange={handlePageChange}
          size="small"
          shape="rounded"
        />
      </Box>

      <UserActionModal open={actionModalOpen} onClose={handleCloseActionModal} user={selectedUser} />
    </Box>
  )
}