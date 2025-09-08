import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";
import userService from "../services/userService";

export default function AddUserModal({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      await userService.createUser(formData);
      setFormData({ username: "", email: "", role: "" });
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error creating user:", err);
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
        />
        <TextField
          label="Email"
          name="email"
          fullWidth
          margin="normal"
          value={formData.email}
          onChange={handleChange}
        />
        <TextField
          label="Role"
          name="role"
          fullWidth
          margin="normal"
          select
          value={formData.role}
          onChange={handleChange}
        >
          <MenuItem value="ADMIN">Admin</MenuItem>
          <MenuItem value="RECEPCIONIST">Recepcionista</MenuItem>
          <MenuItem value="COOKER">Cozinheiro</MenuItem>
          <MenuItem value="FINANCE">Financeiro</MenuItem>
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Criar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
