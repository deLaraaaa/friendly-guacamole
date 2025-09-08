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
} from "@mui/material";
import { getInventoryItems } from "../services/inventoryService";
import { UserContext } from "../contexts/UserContext";
import { CATEGORY_TRANSLATIONS } from "../constants";

const MOVEMENT_TYPES = [
  { label: "Entrada", value: "Entrada" },
  { label: "Saída", value: "Saída" },
];

const today = new Date().toISOString().split("T")[0];

export default function AddMovementModal({
  open,
  onClose,
  onSubmit,
  prefilledData = {},
  disableFields = [],
}) {
  const { user } = useContext(UserContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    product: prefilledData.product || null,
    type: prefilledData.type || "",
    quantity: "",
    price: "",
    exitDate: today,
    expirationDate: "",
  });

  useEffect(() => {
    if (open && user) {
      setLoading(true);
      getInventoryItems()
        .then(setProducts)
        .finally(() => setLoading(false));
    }
  }, [open, user]);

  useEffect(() => {
    if (open) {
      setForm((prev) => ({
        ...prev,
        ...prefilledData,
      }));
    }
  }, [open, prefilledData]);

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
        exitDate: today,
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
          getOptionLabel={(option) => option.name}
          value={form.product}
          onChange={(_, value) => {
            handleChange("product", value);
            handleChange("category", value ? value.category : "");
          }}
          renderInput={(params) => (
            <TextField
              sx={{ marginTop: "10px" }}
              {...params}
              label="Nome do Produto"
              required
            />
          )}
          disabled={disableFields.includes("product")}
        />
        <Autocomplete
          options={products
            .map((p) => p.category)
            .filter((v, i, a) => v && a.indexOf(v) === i)}
          getOptionLabel={(option) => CATEGORY_TRANSLATIONS[option] || option}
          value={form.product ? form.product.category : form.category || ""}
          onChange={(_, value) => {
            handleChange("category", value || "");
          }}
          renderInput={(params) => (
            <TextField {...params} label="Categoria" required />
          )}
          disabled={disableFields.includes("category")}
        />
        <TextField
          select
          label="Tipo"
          value={form.type}
          onChange={(e) => handleChange("type", e.target.value)}
          disabled={disableFields.includes("type")}
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
        {form.type === "Entrada" && !disableFields.includes("price") && (
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
            />
          </>
        )}
        {form.type === "Saída" && !disableFields.includes("exitDate") && (
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
