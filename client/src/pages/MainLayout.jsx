import React, { useState, useContext } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  Collapse,
} from "@mui/material";
import {
  HomeFilled as DashboardIcon,
  Store as InventoryIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ExpandLess,
  ExpandMore,
  AccountCircleOutlined,
} from "@mui/icons-material";

const drawerWidth = 240;

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useContext(UserContext);
  const [inventoryOpen, setInventoryOpen] = useState(true);

  const menuItemsTop = [
    {
      text: "Inventário",
      icon: <InventoryIcon />,
      path: "/inventory",
      children: [
        {
          text: "Produtos",
          path: "/inventory",
        },
        {
          text: "Produtos Cadastrados",
          path: "/registered-products",
        },
      ],
    },
  ];

  const menuItemsBottom = [
    {
      text: "Usuários",
      icon: <AccountCircleOutlined />,
      path: "/users",
    },
    {
      text: "Sair",
      icon: <LogoutIcon />,
      action: () => {
        localStorage.removeItem("authToken");
        sessionStorage.removeItem("authToken");
        setUser(null);
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
          {menuItemsTop.map((item) =>
            item.text === "Inventário" ? (
              <React.Fragment key={item.text}>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => {
                    setInventoryOpen((open) => !open);
                    navigate(item.path);
                  }}
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: "rgba(25, 118, 210, 0.08)",
                      color: "primary.main",
                      "& .MuiListItemIcon-root": { color: "primary.main" },
                    },
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                  {inventoryOpen ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={inventoryOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      <ListItemButton
                        key={child.text}
                        sx={{ pl: 4 }}
                        selected={location.pathname === child.path}
                        onClick={() => navigate(child.path)}
                      >
                        <ListItemText
                          primary={child.text}
                          primaryTypographyProps={{ fontSize: "0.92rem" }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </React.Fragment>
            ) : (
              <ListItemButton
                key={item.text}
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "rgba(25, 118, 210, 0.08)",
                    color: "primary.main",
                    "& .MuiListItemIcon-root": { color: "primary.main" },
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            )
          )}
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
