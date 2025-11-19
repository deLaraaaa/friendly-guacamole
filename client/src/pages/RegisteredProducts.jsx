import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  Autocomplete,
  TextField,
  Alert,
} from "@mui/material";
import { getInventoryItems } from "../services/inventoryService";
import ProductCard from "../components/ProductCard";
import AddProductModal from "../components/AddProductModal";

export default function RegisteredProducts() {
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState(null);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const fetchInventoryItems = () => {
    setError(null);
    getInventoryItems()
      .then((data) => {
        const sortedData = [...data].sort((a, b) => {
          const idA = Number(a.id) || a.id;
          const idB = Number(b.id) || b.id;
          return idA - idB;
        });
        setAllItems(sortedData);
        setFilteredItems(sortedData);
      })
      .catch((error) => {
        console.error("Error fetching inventory items:", error);
        setError("Erro ao processar os produtos cadastrados");
      });
  };

  const handleProductAdded = () => {
    fetchInventoryItems();
  };

  const handleUpdate = () => {
    fetchInventoryItems();
  };

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  return (
    <Box
      sx={{
        height: "99vh",
        display: "flex",
        flexDirection: "column",
        p: 3,
        minHeight: 0,
        padding: 0,
      }}
    >
      <Typography variant="h4" gutterBottom>
        Produtos Cadastrados
      </Typography>
      <Typography variant="body1" gutterBottom>
        Aqui você verá a lista de todos os produtos cadastrados.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          bgcolor: "common.white",
          borderRadius: "8px 8px 0 0",
          p: 3,
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Autocomplete
            options={allItems}
            getOptionLabel={(option) => option.name}
            style={{ width: 300 }}
            onChange={(event, newValue) => {
              if (newValue) {
                setFilteredItems([newValue]);
              } else {
                // Manter ordenação por ID ao limpar o filtro
                const sortedItems = [...allItems].sort((a, b) => {
                  const idA = Number(a.id) || a.id;
                  const idB = Number(b.id) || b.id;
                  return idA - idB;
                });
                setFilteredItems(sortedItems);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Buscar Produto"
                variant="outlined"
              />
            )}
          />
          <Button variant="contained" color="primary" onClick={handleOpenModal}>
            Adicionar Produto
          </Button>
        </Box>
        <AddProductModal
          open={modalOpen}
          onClose={handleCloseModal}
          onSuccess={handleProductAdded}
        />

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            pr: 1,
          }}
        >
          <Grid container spacing={3}>
            {filteredItems.map((item) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={item.id}
                sx={{ padding: "5px" }}
              >
                <ProductCard
                  name={item.name}
                  category={item.category}
                  productId={item.id}
                  count={item.quantity}
                  onUpdate={handleUpdate}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
