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
import { CATEGORY_TRANSLATIONS, formatProductId } from "../constants";
import AddMovementModal from "./AddMovementModal";
import { addMovement } from "../services/inventoryService";

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
      const type = data.type || movementType;
      await addMovement({
        itemId: productId,
        type: type,
        quantity: Number(data.quantity),
        price: data.price,
        offDate: data.offDate || new Date().toISOString().slice(0, 10),
        destination: data.destination,
        invoiceUrl: data.invoiceUrl,
      });

      if (type === "IN") {
        onIncrement(data);
      } else {
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
                padding: "0px 4px",
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
            ID do produto: {formatProductId(productId)}
          </Typography>
        </CardContent>
        <CardActions
          sx={{
            justifyContent: "space-between",
            px: 1,
            pb: 1,
          }}
        >
          <IconButton size="small" onClick={() => handleOpenModal("OUT")}>
            <Remove fontSize="small" />
          </IconButton>
          <Button
            size="small"
            onClick={() => navigate(`/registered-products/${productId}`)}
          >
            Detalhes
          </Button>
          <IconButton size="small" onClick={() => handleOpenModal("IN")}>
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
          movementType === "IN"
            ? ["product", "category", "type"]
            : ["product", "category", "type"]
        }
      />
    </>
  );
}
