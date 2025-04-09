import "./App.css";
import { Box, Typography } from "@mui/material";
import AccountsManager from "./components/AccountsManager";

function App() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Água Doce
      </Typography>

      <AccountsManager />
    </Box>
  );
}

export default App;
