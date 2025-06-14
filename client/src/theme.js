import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: { fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif", },
  palette: {
    primary: { main: "#1e88e5" },
    secondary: {
      main: "#43a047",
      dark: "#2e7031",
      light: "#68b36b",
    },
    error: { main: "#d32f2f" },
    warning: { main: "#ffa000" },
    info: { main: "#0288d1" },
    success: { main: "#388e3c" },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
    text: {
      primary: "#212121",
      secondary: "#757575",
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1600, // changed from 1200 to 1450
      xl: 1800,
    },
  },
});

export default theme;
