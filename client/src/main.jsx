import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "@mui/material";
import theme from "./theme.js";

createRoot(document.getElementById("root")).render(
  <ThemeProvider theme={theme}>
    <StrictMode>
      <App />
    </StrictMode>
  </ThemeProvider>
);
