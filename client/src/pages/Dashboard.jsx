import React, { useContext } from "react";
import { Typography, CircularProgress, Alert, Box } from "@mui/material";
import { UserContext } from "../contexts/UserContext";

export default function Inventory() {
  const { user, loading, error } = useContext(UserContext);

  if (loading)
    return (
      <Box textAlign="center">
        <CircularProgress />
      </Box>
    );
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Bem-vindo, {user.username}!
      </Typography>
      <Typography>Namespace: {user.namespace}</Typography>
      <Typography>Perfil: {user.role}</Typography>
    </>
  );
}
