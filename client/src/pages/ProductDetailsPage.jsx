import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import {
  getInventoryItems,
  updateInventoryItem,
} from "../services/inventoryService";
import { CATEGORY_TRANSLATIONS, formatProductId } from "../constants";
import { UserContext } from "../contexts/UserContext";

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

export default function ProductDetailsPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", category: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  const fetchProduct = () => {
    getInventoryItems({ id: productId })
      .then((data) => {
        if (data && data.length > 0) {
          setProduct(data[0]);
        } else {
          setError("Produto não encontrado.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching product details:", err);
        setError("Falha ao carregar os detalhes do produto.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const handleOpenEditModal = () => {
    setEditForm({
      name: product.name,
      category: product.category,
    });
    setEditModalOpen(true);
    setEditError("");
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditError("");
  };

  const handleEditSubmit = async () => {
    if (!editForm.name || !editForm.category) {
      setEditError("Nome e categoria são obrigatórios");
      return;
    }

    setEditLoading(true);
    setEditError("");
    try {
      await updateInventoryItem({
        itemId: productId,
        name: editForm.name,
        category: editForm.category,
      });
      setEditModalOpen(false);
      fetchProduct();
    } catch (err) {
      setEditError(err.message || "Erro ao atualizar produto");
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/registered-products")}
          sx={{ mb: 2 }}
        >
          Voltar
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const isAdmin = user?.role === "ADMIN";

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/registered-products")}
        >
          Voltar
        </Button>
        {isAdmin && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={handleOpenEditModal}
          >
            Editar
          </Button>
        )}
      </Box>
      <Paper elevation={3} sx={{ p: 4, maxWidth: "800px", margin: "auto" }}>
        <Typography variant="h5" component="h1" gutterBottom>
          {product.name}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          Visão Geral
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ width: 300, flexShrink: 0 }}
            >
              Nome do Produto
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {product.name}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ width: 300, flexShrink: 0 }}
            >
              ID do Produto
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {formatProductId(product.id)}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ width: 300, flexShrink: 0 }}
            >
              Categoria do Produto
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {CATEGORY_TRANSLATIONS[product.category] || product.category}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ width: 300, flexShrink: 0 }}
            >
              Quantidade em Estoque
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {product.quantity}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Dialog
        open={editModalOpen}
        onClose={handleCloseEditModal}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Editar Produto</DialogTitle>
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
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
              required
              fullWidth
            />
            <Autocomplete
              options={CATEGORIES.map((category) => ({
                label: CATEGORY_TRANSLATIONS[category] || category,
                value: category,
              }))}
              value={
                editForm.category
                  ? {
                      label:
                        CATEGORY_TRANSLATIONS[editForm.category] ||
                        editForm.category,
                      value: editForm.category,
                    }
                  : null
              }
              onChange={(_, option) =>
                setEditForm({ ...editForm, category: option?.value || "" })
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
            {editError && <Alert severity="error">{editError}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal} disabled={editLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            color="primary"
            disabled={!editForm.name || !editForm.category || editLoading}
          >
            {editLoading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
