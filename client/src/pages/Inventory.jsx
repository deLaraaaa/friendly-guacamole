import React, { useContext, useState, useEffect } from "react";
import {
  CircularProgress,
  Alert,
  Box,
  Button,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";
import { UserContext } from "../contexts/UserContext";
import InventoryTable from "../components/InventoryTable";
import { getInventoryItems, getStockExits } from "../services/inventoryService";
import Divider from "@mui/material/Divider";

const DISPONIBILIDADES = ["Em Estoque", "Estoque Baixo", "Fora de Estoque"];
const STATUS = ["Entrada", "Saída"];
const CATEGORIAS = [
  "Vegetable",
  "Fruit",
  "Meat",
  "Dairy",
  "Beverage",
  "Condiment",
  "Grain",
  "Frozen",
];

export default function Inventory() {
  const { loading: userLoading, error: userError } = useContext(UserContext);
  const [metricsData, setMetricsData] = useState({
    totalProducts: 0,
    highestExit: { name: "-", quantity: 0 },
    lowestExit: { name: "-", quantity: 0 },
    lowStock: 0,
    lowStockItems: [],
  });
  const [loading, setLoading] = useState(false);

  // Filtros
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    disponibilidade: "",
    status: "",
    dataInicio: "",
    dataFim: "",
    categoria: "",
    produto: "",
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const [items, exits] = await Promise.all([
          getInventoryItems(),
          getStockExits(),
        ]);

        const totalProducts = items.length;
        const lowStockItems = items.filter(
          (item) => item.quantity > 0 && item.quantity <= 10
        );
        const lowStock = lowStockItems.length;

        let highestExit = { name: "-", quantity: 0 };
        let lowestExit = { name: "-", quantity: Number.MAX_SAFE_INTEGER };

        if (exits.length > 0) {
          const exitsByItem = {};
          exits.forEach((exit) => {
            if (!exitsByItem[exit.itemId]) {
              exitsByItem[exit.itemId] = {
                itemId: exit.itemId,
                quantity: 0,
                name:
                  items.find((item) => item.id === exit.itemId)?.name ||
                  "Unknown",
              };
            }
            exitsByItem[exit.itemId].quantity += exit.quantity;
          });

          const exitItems = Object.values(exitsByItem);
          if (exitItems.length > 0) {
            highestExit = exitItems.reduce(
              (max, item) => (item.quantity > max.quantity ? item : max),
              { quantity: 0 }
            );

            lowestExit = exitItems.reduce(
              (min, item) => (item.quantity < min.quantity ? item : min),
              { quantity: Number.MAX_SAFE_INTEGER }
            );
          }
        }

        setMetricsData({
          totalProducts,
          highestExit: {
            name: highestExit.name,
            quantity: highestExit.quantity,
          },
          lowestExit: {
            name: lowestExit.name,
            quantity:
              lowestExit.quantity === Number.MAX_SAFE_INTEGER
                ? 0
                : lowestExit.quantity,
          },
          lowStock,
          lowStockItems: lowStockItems.map((item) => ({
            name: item.name,
            quantity: item.quantity,
          })),
        });
      } catch (error) {
        console.error("Failed to fetch metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (userLoading || loading) {
    return (
      <Box textAlign="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (userError) {
    return <Alert severity="error">{userError}</Alert>;
  }

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
        <Box mb={4}>
          <Typography variant="h5" fontWeight="600" mb={3}>
            Inventário Geral
          </Typography>

          <Grid
            container
            spacing={3}
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Grid item xs={6} md={3}>
              <Box sx={{ display: "flex", height: "100%" }}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography
                    variant="h5"
                    color="#1976d2"
                    sx={{ fontWeight: 500 }}
                  >
                    Total de Produtos
                  </Typography>
                  <Typography variant="h6" fontWeight="500">
                    {metricsData.totalProducts}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Divider orientation="vertical" flexItem />
            <Grid item xs={6} md={3}>
              <Box sx={{ display: "flex", height: "100%" }}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography
                    variant="h5"
                    color="#ffc107"
                    sx={{ fontWeight: 500 }}
                  >
                    Maior Saída
                  </Typography>
                  <Typography variant="h7" fontWeight="500">
                    {metricsData.highestExit.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {metricsData.highestExit.quantity} unid.
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Divider orientation="vertical" flexItem />
            <Grid item xs={6} md={3}>
              <Box sx={{ display: "flex", height: "100%" }}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography
                    variant="h5"
                    color="#9c27b0"
                    sx={{ fontWeight: 500 }}
                  >
                    Menor Saída
                  </Typography>
                  <Typography variant="h7" fontWeight="500">
                    {metricsData.lowestExit.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {metricsData.lowestExit.quantity} unid.
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Divider orientation="vertical" flexItem />
            <Grid item xs={6} md={3}>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography
                  variant="h5"
                  color="#f44336"
                  sx={{ fontWeight: 500 }}
                >
                  Estoque Baixo
                </Typography>
                {metricsData.lowStockItems.length > 0 && (
                  <Box sx={{ mt: 1, maxHeight: "120px", overflow: "auto" }}>
                    {metricsData.lowStockItems.map((item, index) => (
                      <Typography
                        key={index}
                        variant="caption"
                        display="block"
                        color="text.secondary"
                      >
                        {item.name} ({item.quantity} unid.)
                      </Typography>
                    ))}
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
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
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setFilterOpen(true)}
            >
              Filtrar
            </Button>
            <Button variant="contained" color="primary">
              Adicionar Movimentação
            </Button>
          </Box>
        </div>
        <div>
          <InventoryTable filters={filters} />
        </div>
      </div>
      <Dialog open={filterOpen} onClose={() => setFilterOpen(false)}>
        <DialogTitle>Filtrar Movimentações</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Disponibilidade"
            value={filters.disponibilidade}
            onChange={(e) =>
              setFilters((f) => ({ ...f, disponibilidade: e.target.value }))
            }
            fullWidth
            margin="dense"
          >
            <MenuItem value="">Todas</MenuItem>
            {DISPONIBILIDADES.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Status"
            value={filters.status}
            onChange={(e) =>
              setFilters((f) => ({ ...f, status: e.target.value }))
            }
            fullWidth
            margin="dense"
          >
            <MenuItem value="">Todos</MenuItem>
            {STATUS.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Data Inicial (Validade/Saída)"
            type="date"
            value={filters.dataInicio || ""}
            onChange={(e) =>
              setFilters((f) => ({ ...f, dataInicio: e.target.value }))
            }
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Data Final (Validade/Saída)"
            type="date"
            value={filters.dataFim || ""}
            onChange={(e) =>
              setFilters((f) => ({ ...f, dataFim: e.target.value }))
            }
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            select
            label="Categoria"
            value={filters.categoria}
            onChange={(e) =>
              setFilters((f) => ({ ...f, categoria: e.target.value }))
            }
            fullWidth
            margin="dense"
          >
            <MenuItem value="">Todas</MenuItem>
            {CATEGORIAS.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Produto"
            value={filters.produto}
            onChange={(e) =>
              setFilters((f) => ({ ...f, produto: e.target.value }))
            }
            fullWidth
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterOpen(false)}>Cancelar</Button>
          <Button
            onClick={() => setFilterOpen(false)}
            variant="contained"
            color="primary"
          >
            Aplicar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
