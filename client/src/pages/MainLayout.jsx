// src/components/MainLayout.jsx
import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
} from "@mui/material";
import {
  HomeFilled as DashboardIcon,
  Store as InventoryIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";

const drawerWidth = 240;

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItemsTop = [
    {
      text: "Dashboard",
      icon: <DashboardIcon />,
      path: "/dashboard",
    },
    {
      text: "Inventário",
      icon: <InventoryIcon />,
      path: "/inventory",
    },
    {
      text: "Relatório",
      icon: <AssessmentIcon />,
      path: "/report",
    },
  ];

  const menuItemsBottom = [
    {
      text: "Configurações",
      icon: <SettingsIcon />,
      path: "/configurations",
    },
    {
      text: "Sair",
      icon: <LogoutIcon />,
      action: () => {
        localStorage.removeItem("authToken");
        sessionStorage.removeItem("authToken");
        navigate("/login");
      },
    },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <Drawer
        variant="permanent"
        sx={{
          marginRight: "30px",
          width: drawerWidth,
          flexShrink: 0,
          ["& .MuiDrawer-paper"]: {
            width: drawerWidth,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {/* Logo no topo */}
        <Box sx={{ p: 2, textAlign: "center" }}>
          <img
            src="client/src/assets/logo.svg"
            alt="Logo"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </Box>

        {/* Menu principal */}
        <List>
          {menuItemsTop.map(({ text, icon, path }) => (
            <ListItemButton
              key={text}
              selected={location.pathname === path}
              onClick={() => navigate(path)}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "rgba(25, 118, 210, 0.08)",
                  color: "primary.main",
                  "& .MuiListItemIcon-root": { color: "primary.main" },
                },
              }}
            >
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          ))}
        </List>

        <Box sx={{ flexGrow: 1 }} />
        <Divider />

        {/* Menu inferior */}
        <List>
          {menuItemsBottom.map(({ text, icon, path, action }) => (
            <ListItemButton
              key={text}
              selected={path && location.pathname === path}
              onClick={action ?? (() => navigate(path))}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "rgba(25, 118, 210, 0.08)",
                  color: "primary.main",
                  "& .MuiListItemIcon-root": { color: "primary.main" },
                },
              }}
            >
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: `${drawerWidth}px`,
          margin: 0,
          padding: 0,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
