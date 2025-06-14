import React, { useState } from "react";
import { Box, Button } from "@mui/material";
import Metrics from "../components/Metrics";
import InventoryTable from "../components/InventoryTable";
import InventoryFilters from "../components/InventoryFilters";
import AddMovementModal from "../components/AddMovementModal";
import { addStockEntry, addStockExit } from "../services/inventoryService";

export default function Inventory() {
  const [filters, setFilters] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [reload, setReload] = useState(false);

  const handleAddMovement = async (data) => {
    try {
      if (data.type === "Entrada") {
        await addStockEntry({
          itemId: data.product.id,
          quantity: Number(data.quantity),
          expirationDate: data.expirationDate || undefined,
          price: data.price || undefined,
        });
      } else if (data.type === "Saída") {
        await addStockExit({
          itemId: data.product.id,
          quantity: Number(data.quantity),
          destination: "KITCHEN",
          exitType: "USAGE",
          exitDate:
            data.expirationDate || new Date().toISOString().slice(0, 10),
        });
      }
      setModalOpen(false);
      setReload((r) => !r);
    } catch (err) {
      alert("Erro ao registrar movimentação: " + err.message);
    }
  };

  return (
    <div style={{ marginRight: "30px" }}>
      <div
        style={{
          backgroundColor: "white",
          padding: "10px 20px 20px",
          marginBottom: "30px",
          borderRadius: "8px",
        }}
      >
        <Metrics />
      </div>
      <div style={{ width: "100%" }}>
        <div
          style={{
            backgroundColor: "white",
            padding: "30px 30px 1px 0",
            borderRadius: "8px 8px 0 0",
          }}
        >
          <Box mb={3} sx={{ display: "flex", justifyContent: "end", gap: 2 }}>
            <InventoryFilters onChange={setFilters} />
            <Button
              variant="contained"
              color="primary"
              onClick={() => setModalOpen(true)}
            >
              Adicionar Movimentação
            </Button>
          </Box>
        </div>
        <div>
          <InventoryTable filters={filters} reload={reload} />
        </div>
      </div>
      <AddMovementModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddMovement}
      />
    </div>
  );
}
