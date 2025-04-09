import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
} from "@mui/material";

function AccountList({ accounts }) {
  if (!accounts || accounts.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary">
        No accounts found.
      </Typography>
    );
  }

  return (
    <Paper
      elevation={2}
      sx={{
        mt: 2,
        maxWidth: 600,
        mx: "auto",
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Account List
        </Typography>
        <List>
          {accounts.map((account, index) => (
            <Box key={account.id || index}>
              <ListItem>
                <ListItemText
                  primary={`${account.username}@${account.namespace}`}
                  secondary={account.role}
                />
              </ListItem>
              {index < accounts.length - 1 && <Divider />}
            </Box>
          ))}
        </List>
      </Box>
    </Paper>
  );
}

export default AccountList;
