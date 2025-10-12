import React, { useState, useEffect } from "react";
import { Box, Button } from "@mui/material";
import Metrics from "../components/Metrics";
import InventoryTable from "../components/InventoryTable";
import InventoryFilters from "../components/InventoryFilters";
import AddMovementModal from "../components/AddMovementModal";
import { addMovement, getStockMovements } from "../services/inventoryService";

const getDefaultDateRange = () => {
  const today = new Date();
  const twoWeeksAgo = new Date(today);
  twoWeeksAgo.setDate(today.getDate() - 7);
  const twoWeeksAhead = new Date(today);
  twoWeeksAhead.setDate(today.getDate() + 7);

  return {
    dataInicio: twoWeeksAgo.toISOString().split("T")[0],
    dataFim: twoWeeksAhead.toISOString().split("T")[0],
  };
};

export default function Inventory() {
  const defaultDates = getDefaultDateRange();
  const [filters, setFilters] = useState({
    dataInicio: defaultDates.dataInicio,
    dataFim: defaultDates.dataFim,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [reload, setReload] = useState(false);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTableData = async () => {
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
    fetchTableData();
  }, [filters, reload]);

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
      <div
        style={{
          backgroundColor: "white",
          padding: "10px 20px 20px",
          marginBottom: "30px",
          borderRadius: "8px",
        }}
      >
        <Metrics refreshTrigger={reload} />
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
