import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Button } from "@mui/material";
import { getInventoryItems } from "../services/inventoryService";
import ProductCard from "../components/ProductCard";

export default function RegisteredProducts() {
  const [inventoryItems, setInventoryItems] = useState([]);

  useEffect(() => {
    getInventoryItems()
      .then((data) => setInventoryItems(data))
      .catch((error) =>
        console.error("Error fetching inventory items:", error)
      );
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

      {/* White panel */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          bgcolor: "common.white",
          borderRadius: "8px 8px 0 0",
          p: 3,
          overflow: "hidden", // hide any accidental overflow at this level
          minHeight: 0, // <-- critical so child flex can scroll instead of growing
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button variant="contained" color="primary">
            Adicionar Produto
          </Button>
        </Box>

        {/* Only *this* area ever scrolls, and only vertically */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            // optional: add a tiny right padding so cards don't butt up against hidden scrollbar
            pr: 1,
          }}
        >
          <Grid container spacing={3}>
            {inventoryItems.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <ProductCard
                  name={item.name}
                  category={item.category}
                  productId={item.id}
                  count={item.quantity}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
