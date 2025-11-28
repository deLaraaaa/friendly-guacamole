import React, { useState, useEffect } from "react";
import { Box, Button, TextField, MenuItem, Menu } from "@mui/material";
import { CATEGORY_TRANSLATIONS } from "../constants";

const DISPONIBILIDADES = ["Em Estoque", "Estoque Baixo", "Fora de Estoque"];
const STATUS = ["Entrada", "Saída"];
const CATEGORIAS = [
  "Vegetable",
  "Fruit",
  "Meat",
  "Dairy",
  "Beverage",
  "Condiment",
  "Grain",
  "Frozen",
];

export default function InventoryFilters({ onChange, initialFilters = {} }) {
  const [filters, setFilters] = useState({
    disponibilidade: initialFilters.disponibilidade || "",
    status: initialFilters.status || "",
    dataInicio: initialFilters.dataInicio || "",
    dataFim: initialFilters.dataFim || "",
    categoria: initialFilters.categoria || "",
    produto: initialFilters.produto || "",
  });

  useEffect(() => {
    setFilters({
      disponibilidade: initialFilters.disponibilidade || "",
      status: initialFilters.status || "",
      dataInicio: initialFilters.dataInicio || "",
      dataFim: initialFilters.dataFim || "",
      categoria: initialFilters.categoria || "",
      produto: initialFilters.produto || "",
    });
  }, [initialFilters]);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleFilterClick = (event) => setAnchorEl(event.currentTarget);
  const handleFilterClose = () => setAnchorEl(null);

  const handleChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    if (onChange) onChange(filters);
    handleFilterClose();
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      disponibilidade: "",
      status: "",
      dataInicio: "",
      dataFim: "",
      categoria: "",
      produto: "",
    };
    setFilters(emptyFilters);
    if (onChange) onChange(emptyFilters);
    handleFilterClose();
  };

  return (
    <>
      <Button variant="outlined" color="primary" onClick={handleFilterClick}>
        Filtrar
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleFilterClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ sx: { p: 2, minWidth: 320 } }}
      >
        <Box
          component="form"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <TextField
            select
            label="Disponibilidade"
            value={filters.disponibilidade}
            onChange={(e) => handleChange("disponibilidade", e.target.value)}
            fullWidth
            margin="dense"
          >
            <MenuItem value="">Todas</MenuItem>
            {DISPONIBILIDADES.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Status"
            value={filters.status}
            onChange={(e) => handleChange("status", e.target.value)}
            fullWidth
            margin="dense"
          >
            <MenuItem value="">Todos</MenuItem>
            {STATUS.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Data Inicial (Validade/Saída)"
            type="date"
            value={filters.dataInicio || ""}
            onChange={(e) => handleChange("dataInicio", e.target.value)}
            fullWidth
            margin="dense"
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Data Final (Validade/Saída)"
            type="date"
            value={filters.dataFim || ""}
            onChange={(e) => handleChange("dataFim", e.target.value)}
            fullWidth
            margin="dense"
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            select
            label="Categoria"
            value={filters.categoria}
            onChange={(e) => handleChange("categoria", e.target.value)}
            fullWidth
            margin="dense"
          >
            <MenuItem value="">Todas</MenuItem>
            {CATEGORIAS.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {CATEGORY_TRANSLATIONS[opt] || opt}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Produto"
            value={filters.produto}
            onChange={(e) => handleChange("produto", e.target.value)}
            fullWidth
            margin="dense"
          />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 1,
              mt: 1,
            }}
          >
            <Button onClick={handleClearFilters} color="secondary">
              Limpar
            </Button>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button onClick={handleFilterClose}>Cancelar</Button>
              <Button
                onClick={handleApplyFilters}
                variant="contained"
                color="primary"
              >
                Aplicar
              </Button>
            </Box>
          </Box>
        </Box>
      </Menu>
    </>
  );
}
