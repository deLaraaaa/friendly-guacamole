import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  IconButton,
  Typography,
  Box,
  Button,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import { CATEGORY_TRANSLATIONS } from "../constants";
import AddMovementModal from "./AddMovementModal";
import { addStockEntry, addStockExit } from "../services/inventoryService";

export default function ProductCard({
  name,
  category,
  productId,
  count,
  onIncrement = () => {},
  onDecrement = () => {},
  onUpdate = () => {},
}) {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [movementType, setMovementType] = useState("");

  const handleOpenModal = (type) => {
    setMovementType(type);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setMovementType("");
  };

  const handleSubmit = async (data) => {
    try {
      if (movementType === "Entrada") {
        await addStockEntry({
          itemId: productId,
          quantity: Number(data.quantity),
          expirationDate: data.expirationDate || undefined,
          price: data.price || undefined,
        });
        onIncrement(data);
      } else if (movementType === "Saída") {
        await addStockExit({
          itemId: productId,
          quantity: Number(data.quantity),
          destination: "KITCHEN",
          exitType: "USAGE",
          exitDate: data.exitDate || new Date().toISOString().slice(0, 10),
        });
        onDecrement(data);
      }
      onUpdate();
    } catch (err) {
      alert("Erro ao registrar movimentação: " + err.message);
    }
    handleCloseModal();
  };

  return (
    <>
      <Card
        sx={{
          width: 260,
          borderRadius: 2,
          boxShadow: 3,
          position: "relative",
          margin: "auto",
        }}
      >
        <CardHeader
          title={name}
          titleTypographyProps={{ variant: "subtitle1", fontWeight: 600 }}
          action={
            <Box
              sx={{
                bgcolor: "grey.100",
                borderRadius: "4px",
                width: 32,
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="caption">{count}</Typography>
            </Box>
          }
        />
        <CardContent sx={{ pt: 0 }}>
          <Typography variant="body2" color="text.secondary">
            {CATEGORY_TRANSLATIONS[category] || category || "-"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ID do produto: {productId}
          </Typography>
        </CardContent>
        <CardActions sx={{ justifyContent: "space-between", px: 1, pb: 1 }}>
          <IconButton size="small" onClick={() => handleOpenModal("Saída")}>
            <Remove fontSize="small" />
          </IconButton>
          <Button
            size="small"
            onClick={() => navigate(`/registered-products/${productId}`)}
          >
            Detalhes
          </Button>
          <IconButton size="small" onClick={() => handleOpenModal("Entrada")}>
            <Add fontSize="small" />
          </IconButton>
        </CardActions>
      </Card>
      <AddMovementModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        prefilledData={{
          product: { id: productId, name },
          category,
          type: movementType,
        }}
        disableFields={
          movementType === "Entrada"
            ? ["product", "category"]
            : ["product", "category"]
        }
      />
    </>
  );
}
