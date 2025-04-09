import { useState } from "react";
import { Button, Box, CircularProgress, Typography } from "@mui/material";
import AccountList from "./AccountList";

function AccountsManager() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3001/api/accounts");

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      setAccounts(data);
    } catch (err) {
      console.error("Error fetching accounts:", err);
      setError(err.message || "Failed to fetch accounts");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Button
        variant="contained"
        onClick={fetchAccounts}
        color="primary"
        disabled={loading}
      >
        {loading ? "Loading..." : "Show Accounts"}
      </Button>

      {loading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 2,
          }}
        >
          <CircularProgress size={24} />
        </Box>
      )}

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          Error: {error}
        </Typography>
      )}

      {accounts.length > 0 && <AccountList accounts={accounts} />}
    </Box>
  );
}

export default AccountsManager;
