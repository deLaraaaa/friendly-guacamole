import React, { useState, useEffect, useContext } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { getInventoryItems } from "../services/inventoryService";
import { UserContext } from "../contexts/UserContext";

const MOVEMENT_TYPES = [
  { label: "Entrada", value: "Entrada" },
  { label: "Saída", value: "Saída" },
];

const today = new Date().toISOString().split("T")[0];

export default function AddMovementModal({ open, onClose, onSubmit }) {
  const { user } = useContext(UserContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    product: null,
    type: "",
    quantity: "",
    price: "",
    exitDate: today,
    expirationDate: today,
  });

  useEffect(() => {
    if (open && user) {
      setLoading(true);
      getInventoryItems()
        .then(setProducts)
        .finally(() => setLoading(false));
    }
  }, [open, user]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (form.product && form.type && form.quantity) {
      const payload = {
        product: form.product,
        type: form.type,
        quantity: form.quantity,
      };
      if (form.type === "Entrada") {
        payload.price = parseFloat(form.price);
        payload.expirationDate = form.expirationDate;
      }
      if (form.type === "Saída") {
        payload.exitDate = form.exitDate;
      }
      onSubmit(payload);
      onClose();
      setForm({
        product: null,
        type: "",
        quantity: "",
        price: "",
        expirationDate: "",
        exitDate: "",
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ paddingTop: "10px" }}>Nova Movimentação</DialogTitle>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          mt: 1,
        }}
      >
        <Autocomplete
          options={products}
          getOptionLabel={(option) => option.name || ""}
          loading={loading}
          value={form.product}
          onChange={(_, value) => handleChange("product", value)}
          renderInput={(params) => (
            <TextField {...params} label="Nome do Produto" required />
          )}
        />
        <TextField
          select
          label="Tipo"
          value={form.type}
          onChange={(e) => handleChange("type", e.target.value)}
          required
        >
          {MOVEMENT_TYPES.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Quantidade"
          type="number"
          value={form.quantity}
          onChange={(e) => handleChange("quantity", e.target.value)}
          required
        />
        {form.type === "Entrada" && (
          <>
            <TextField
              label="Preço de Compra"
              type="number"
              value={form.price}
              onChange={(e) => handleChange("price", e.target.value)}
              required
            />
            <TextField
              label="Data de Validade"
              type="date"
              value={form.expirationDate}
              onChange={(e) => handleChange("expirationDate", e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
            />
          </>
        )}
        {form.type === "Saída" && (
          <TextField
            label="Data de Saída"
            type="date"
            value={form.exitDate}
            onChange={(e) => handleChange("exitDate", e.target.value)}
            InputLabelProps={{ shrink: true }}
            required
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
