import React, { useState, useEffect } from "react";
import { Box, Button } from "@mui/material";
import Metrics from "../components/Metrics";
import InventoryTable from "../components/InventoryTable";
import InventoryFilters from "../components/InventoryFilters";
import AddMovementModal from "../components/AddMovementModal";
import {
  addStockEntry,
  addStockExit,
  getStockMovements,
} from "../services/inventoryService";

export default function Inventory() {
  const [filters, setFilters] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [reload, setReload] = useState(false);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allItems, setAllItems] = useState([]);
  const [allMovements, setAllMovements] = useState([]);

  useEffect(() => {
    // Buscar todos os dados ao montar o componente
    const fetchAllData = async () => {
      try {
        const { movements: allMovementsData, items: allItemsData } =
          await getStockMovements({});
        setAllMovements(allMovementsData);
        setAllItems(allItemsData);
      } catch (error) {
        console.error("Failed to fetch all inventory data:", error);
      }
    };
    fetchAllData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { movements: movementsData } = await getStockMovements(filters);
        setMovements(movementsData);
      } catch (error) {
        console.error("Failed to fetch inventory data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters, reload]);

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
        <Metrics items={allItems} movements={allMovements} loading={loading} />
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
          <InventoryTable movements={movements} loading={loading} />
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
