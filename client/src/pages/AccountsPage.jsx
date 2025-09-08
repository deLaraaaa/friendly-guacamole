import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  Switch,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import LockOutlineIcon from "@mui/icons-material/LockOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PersonIcon from "@mui/icons-material/Person";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import userService from "../services/userService";
import AddUserModal from "../components/AddUserModal";
import { ROLE_TRANSLATIONS } from "../constants";

export default function AccountsPage() {
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuUserId, setMenuUserId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const fetchUsers = async () => {
    try {
      const data = await userService.getUsers();
      setUsers(data);
      const currentUser = await userService.getCurrentUser();
      setCurrentUserId(currentUser.id);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleToggleActivation = async (userId, active) => {
    try {
      await userService.toggleUserActivation(userId, active);
      fetchUsers();
    } catch (err) {
      console.error("Error toggling user activation:", err);
    }
  };

  const handleMenuOpen = (e, userId) => {
    setMenuAnchorEl(e.currentTarget);
    setMenuUserId(userId);
  };
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuUserId(null);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Box
      sx={{ height: "100%", display: "flex", flexDirection: "column", p: 3 }}
    >
      <Typography variant="h4" gutterBottom>
        Gerenciar Contas
      </Typography>
      <Typography variant="body1" gutterBottom>
        Aqui você verá a lista de todos os usuários cadastrados.
      </Typography>

      <Box
        sx={{
          flex: 1,
          bgcolor: "background.paper",
          borderRadius: 2,
          p: 3,
          overflow: "hidden",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button
            variant="contained"
            sx={{ backgroundColor: "#1976D2" }}
            onClick={() => setModalOpen(true)}
          >
            Adicionar Usuário
          </Button>
          <AddUserModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onSuccess={fetchUsers}
          />
        </Box>

        <Grid
          container
          spacing={3}
          sx={{ overflowY: "auto", height: "calc(100% - 56px)" }}
        >
          {users.map((user) => (
            <Grid item xs={12} sm={6} md={4} key={user.id}>
              <Card
                sx={{
                  position: "relative",
                  border: 1,
                  borderColor: "grey.300",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    borderColor: "#1976D2",
                    boxShadow: 3,
                  },
                }}
              >
                <CardHeader
                  avatar={
                    <Avatar
                      src={user.avatarUrl || "/default-avatar.png"}
                      alt={user.username}
                    />
                  }
                  action={
                    user.id !== currentUserId && (
                      <IconButton onClick={(e) => handleMenuOpen(e, user.id)}>
                        <MoreVertIcon />
                      </IconButton>
                    )
                  }
                  title={
                    <Typography variant="h6">
                      {user.displayName || user.username}
                    </Typography>
                  }
                  subheader={
                    <Typography variant="caption" color="text.secondary">
                      Último acesso:{" "}
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleString()
                        : "não registrado"}
                    </Typography>
                  }
                />

                <CardContent sx={{ pt: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    color="text.secondary"
                  >
                    <MailOutlineIcon sx={{ fontSize: 18 }} />
                    {user.email}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    color="text.secondary"
                  >
                    <WorkOutlineIcon sx={{ fontSize: 18 }} />
                    {ROLE_TRANSLATIONS[user.role] || user.role}
                  </Typography>
                </CardContent>

                <CardActions
                  sx={{ justifyContent: "space-between", alignItems: "center" }}
                >
                  {user.firstLogin ? (
                    <Chip
                      icon={<MailOutlineIcon style={{ color: "inherit" }} />}
                      label="Aguardando"
                      size="small"
                      sx={{
                        backgroundColor: "#E3F2FD",
                        color: "#1976D2",
                        fontWeight: "bold",
                      }}
                    />
                  ) : user.active ? (
                    <Chip
                      icon={<PersonOutlineIcon style={{ color: "inherit" }} />}
                      label="Ativo"
                      size="small"
                      sx={{
                        backgroundColor: "#E8F5E9",
                        color: "#388E3C",
                        fontWeight: "bold",
                      }}
                    />
                  ) : (
                    <Chip
                      icon={
                        <PersonOffOutlinedIcon style={{ color: "inherit" }} />
                      }
                      label="Inativo"
                      size="small"
                      sx={{
                        backgroundColor: "#FFEBEE",
                        color: "#D32F2F",
                        fontWeight: "bold",
                      }}
                    />
                  )}
                </CardActions>

                <Menu
                  anchorEl={menuAnchorEl}
                  open={menuUserId === user.id}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  {user.active ? (
                    <MenuItem
                      onClick={() => {
                        if (!user.firstLogin) {
                          handleToggleActivation(user.id, false);
                          handleMenuClose();
                        }
                      }}
                      disabled={user.firstLogin}
                    >
                      <LockOutlineIcon fontSize="small" sx={{ mr: 1 }} />
                      Inativar
                    </MenuItem>
                  ) : (
                    <MenuItem
                      onClick={() => {
                        handleToggleActivation(user.id, true);
                        handleMenuClose();
                      }}
                    >
                      <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                      Ativar
                    </MenuItem>
                  )}
                  <MenuItem
                    onClick={() => {
                      userService.deleteUser(user.id).then(fetchUsers);
                      handleMenuClose();
                    }}
                  >
                    <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} />
                    Deletar
                  </MenuItem>
                </Menu>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
