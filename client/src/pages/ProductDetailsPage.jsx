import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getInventoryItems } from "../services/inventoryService";
import { CATEGORY_TRANSLATIONS } from "../constants";

export default function ProductDetailsPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
  }, [productId]);

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

  return (
    <Box sx={{ p: 3 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/registered-products")}
        sx={{ mb: 2 }}
      >
        Voltar
      </Button>
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
              {product.id}
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
    </Box>
  );
}
