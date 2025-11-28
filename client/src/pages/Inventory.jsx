import React, { useState, useEffect } from "react";
import { Box, Button, Alert } from "@mui/material";
import Metrics from "../components/Metrics";
import InventoryTable from "../components/InventoryTable";
import InventoryFilters from "../components/InventoryFilters";
import AddMovementModal from "../components/AddMovementModal";
import { addMovement, getStockMovements } from "../services/inventoryService";

const getOneWeekAgo = () => {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date.toISOString().split("T")[0];
};

const getOneWeekAhead = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().split("T")[0];
};

export default function Inventory() {
  const [filters, setFilters] = useState({
    dataInicio: getOneWeekAgo(),
    dataFim: getOneWeekAhead(),
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [reload, setReload] = useState(false);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allItems, setAllItems] = useState([]);
  const [allMovements, setAllMovements] = useState([]);
  const [error, setError] = useState(null);
  const [metricsLoaded, setMetricsLoaded] = useState(false);

  useEffect(() => {
    if (!metricsLoaded) {
      const fetchAllData = async () => {
        try {
          const { movements: allMovementsData, items: allItemsData } =
            await getStockMovements({});
          setAllMovements(allMovementsData);
          setAllItems(allItemsData);
          setMetricsLoaded(true);
        } catch (error) {
          console.error("Failed to fetch all inventory data:", error);
        }
      };
      fetchAllData();
    }
  }, [metricsLoaded]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { movements: movementsData } = await getStockMovements(filters);
        setMovements(movementsData);
      } catch (error) {
        console.error("Failed to fetch inventory data:", error);
        setError("Erro ao processar as movimentações");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, reload]);

  useEffect(() => {
    if (reload) {
      const fetchAllData = async () => {
        try {
          const { movements: allMovementsData, items: allItemsData } =
            await getStockMovements({});
          setAllMovements(allMovementsData);
          setAllItems(allItemsData);
          const { movements: movementsData } = await getStockMovements(filters);
          setMovements(movementsData);
        } catch (error) {
          console.error("Failed to fetch all inventory data:", error);
        }
      };
      fetchAllData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload]);

  const handleAddMovement = async (data) => {
    try {
      await addMovement(data);
      setModalOpen(false);
      setReload((r) => !r);
    } catch (err) {
      alert("Erro ao registrar movimentação: " + err.message);
    }
  };

  return (
    <div style={{ marginRight: "30px" }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
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
          <Box
            mb={3}
            sx={{
              display: "flex",
              justifyContent: "end",
              gap: 2,
            }}
          >
            <InventoryFilters onChange={setFilters} initialFilters={filters} />
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
