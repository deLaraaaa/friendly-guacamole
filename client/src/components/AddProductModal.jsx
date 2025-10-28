import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Box,
  Alert,
} from "@mui/material";
import { addInventoryItem, addMovement } from "../services/inventoryService";
import Autocomplete from "@mui/material/Autocomplete";
import { CATEGORY_TRANSLATIONS } from "../constants";

const CATEGORIES = [
  "Vegetable",
  "Fruit",
  "Meat",
  "Dairy",
  "Beverage",
  "Condiment",
  "Grain",
  "Frozen",
];

export default function AddProductModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    category: "",
    quantity: "",
    price: "",
    expirationDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const item = await addInventoryItem({
        name: form.name,
        category: form.category,
        quantity: 0,
        expirationDate: form.expirationDate || undefined,
      });

      await addMovement({
        itemId: item.id,
        quantity: Number(form.quantity),
        price: form.price ? Number(form.price) : undefined,
        expirationDate: form.expirationDate || undefined,
      });

      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
      setForm({
        name: "",
        category: "",
        quantity: "",
        price: "",
        expirationDate: "",
      });
    } catch (err) {
      setError(err.message || "Erro ao adicionar produto");
      setLoading(false);
    }
  };

  const isValid =
    form.name &&
    form.category &&
    form.quantity &&
    !isNaN(Number(form.quantity)) &&
    Number(form.quantity) > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Adicionar Produto</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            mt: 1,
          }}
        >
          <TextField
            label="Nome"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
            fullWidth
          />
          <Autocomplete
            options={CATEGORIES.map((category) => ({
              label: CATEGORY_TRANSLATIONS[category] || category,
              value: category,
            }))}
            value={
              form.category
                ? {
                    label:
                      CATEGORY_TRANSLATIONS[form.category] || form.category,
                    value: form.category,
                  }
                : null
            }
            onChange={(_, option) =>
              handleChange("category", option?.value || "")
            }
            getOptionLabel={(option) =>
              typeof option === "string" ? option : option.label
            }
            isOptionEqualToValue={(option, value) =>
              option.value === value.value
            }
            renderInput={(params) => (
              <TextField {...params} label="Categoria" required fullWidth />
            )}
            freeSolo
          />
          <TextField
            label="Quantidade"
            type="number"
            value={form.quantity}
            onChange={(e) => handleChange("quantity", e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Preço de Compra"
            type="number"
            value={form.price}
            onChange={(e) => handleChange("price", e.target.value)}
            fullWidth
          />
          <TextField
            label="Data de Validade"
            type="date"
            value={form.expirationDate}
            onChange={(e) => handleChange("expirationDate", e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={!isValid || loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          Adicionar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
