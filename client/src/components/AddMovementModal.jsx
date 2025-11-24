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
  { label: "Entrada", value: "IN" },
  { label: "Saída", value: "OUT" },
];

const getMovementValue = (type) => {
  if (!type) return "";
  const movementType = MOVEMENT_TYPES.find(
    (mt) => mt.label === type || mt.value === type
  );
  return movementType ? movementType.value : type;
};

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
  const [form, setForm] = useState({
    product: prefilledData.product || null,
    type: prefilledData.type || "",
    quantity: "",
    price: "",
    offDate: today,
    destination: "KITCHEN",
    invoiceUrl: "",
  });

  useEffect(() => {
    if (open && user) {
      getInventoryItems().then(setProducts).catch(console.error);
    }
  }, [open, user]);

  useEffect(() => {
    if (open) {
      setForm((prev) => ({
        ...prev,
        ...prefilledData,
        type: getMovementValue(prefilledData.type),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleChange = (field, value) => {
    if (field === "offDate" && form.type === "OUT" && value > today) {
      return;
    }
    if (field === "type" && value === "OUT" && form.offDate > today) {
      setForm((prev) => ({ ...prev, [field]: value, offDate: today }));
      return;
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (
      form.product &&
      form.type &&
      form.quantity &&
      Number(form.quantity) > 0 &&
      Number.isInteger(Number(form.quantity))
    ) {
      const payload = {
        itemId: form.product.id,
        type: form.type,
        quantity: parseInt(form.quantity),
        offDate: form.offDate,
      };

      if (form.type === "IN") {
        if (form.price) payload.price = parseFloat(form.price);
        if (form.invoiceUrl) payload.invoiceUrl = form.invoiceUrl;
      }

      if (form.type === "OUT") {
        payload.destination = form.destination;
      }

      onSubmit(payload);
      onClose();
      setForm({
        product: null,
        type: "",
        quantity: "",
        price: "",
        offDate: today,
        destination: "KITCHEN",
        invoiceUrl: "",
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
            if (value) {
              handleChange("category", value.category);
            } else {
              handleChange("category", "");
            }
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
            if (!form.product) {
              handleChange("category", value || "");
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Categoria"
              required
              helperText={
                form.product
                  ? "A categoria está bloqueada para produtos existentes"
                  : ""
              }
            />
          )}
          disabled={disableFields.includes("category") || form.product !== null}
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
          onChange={(e) => {
            const value = e.target.value;
            if (
              value === "" ||
              (Number(value) > 0 && Number.isInteger(Number(value)))
            ) {
              handleChange("quantity", value);
            }
          }}
          slotProps={{ input: { min: 1, step: 1 } }}
          required
          error={
            form.quantity &&
            (Number(form.quantity) <= 0 ||
              !Number.isInteger(Number(form.quantity)))
          }
          helperText={
            form.quantity &&
            (Number(form.quantity) <= 0 ||
              !Number.isInteger(Number(form.quantity)))
              ? "A quantidade deve ser um número inteiro positivo"
              : ""
          }
        />

        {form.type === "IN" && (
          <>
            <TextField
              label="Preço de Compra"
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => handleChange("price", e.target.value)}
            />
            <TextField
              label="URL da Nota Fiscal"
              type="url"
              value={form.invoiceUrl}
              onChange={(e) => handleChange("invoiceUrl", e.target.value)}
            />
          </>
        )}

        {form.type === "OUT" && (
          <TextField
            select
            label="Destino"
            value={form.destination}
            onChange={(e) => handleChange("destination", e.target.value)}
            required
          >
            <MenuItem value="KITCHEN">Cozinha</MenuItem>
            <MenuItem value="DELIVERY">Entrega</MenuItem>
            <MenuItem value="WASTE">Descarte</MenuItem>
            <MenuItem value="OTHER">Outro</MenuItem>
          </TextField>
        )}
        <TextField
          label={form.type === "IN" ? "Data de Validade" : "Data de Saída"}
          type="date"
          value={form.offDate}
          onChange={(e) => {
            const newDate = e.target.value;
            if (form.type === "OUT" && newDate > today) {
              return;
            }
            handleChange("offDate", newDate);
          }}
          InputLabelProps={{ shrink: true }}
          inputProps={{
            max: form.type === "OUT" ? today : undefined,
          }}
          required
        />
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
