import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import userService from "../services/userService";

export default function AddUserModal({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      await userService.createUser(formData);
      setFormData({
        username: "",
        email: "",
        role: "",
      });
      setLoading(false);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error creating user:", err);
      setError(err.message || "Erro ao criar usuário");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Adicionar Usuário</DialogTitle>
      <DialogContent>
        <TextField
          label="Nome de Usuário"
          name="username"
          fullWidth
          margin="normal"
          value={formData.username}
          onChange={handleChange}
          disabled={loading}
        />
        <TextField
          label="Email"
          name="email"
          fullWidth
          margin="normal"
          value={formData.email}
          onChange={handleChange}
          disabled={loading}
        />
        <TextField
          label="Role"
          name="role"
          fullWidth
          margin="normal"
          select
          value={formData.role}
          onChange={handleChange}
          disabled={loading}
        >
          <MenuItem value="ADMIN">Administrador</MenuItem>
          <MenuItem value="RECEPCIONIST">Recepcionista</MenuItem>
          <MenuItem value="COOKER">Cozinheiro</MenuItem>
          <MenuItem value="FINANCE">Financeiro</MenuItem>
        </TextField>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            loading || !formData.username || !formData.email || !formData.role
          }
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? "Criando..." : "Criar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
