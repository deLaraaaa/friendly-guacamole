import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  Grid,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import { getMetrics } from "../services/inventoryService";

let metricsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000;

export default function Metrics({
  loading: externalLoading = false,
  refreshTrigger = 0,
}) {
  const [metricsData, setMetricsData] = useState({
    totalProducts: 0,
    highestExit: {
      name: "-",
      quantity: 0,
    },
    lowestExit: {
      name: "-",
      quantity: 0,
    },
    lowStock: 0,
    lowStockItems: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      const now = Date.now();
      if (
        metricsCache &&
        cacheTimestamp &&
        now - cacheTimestamp < CACHE_DURATION
      ) {
        setMetricsData(metricsCache);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await getMetrics();
        setMetricsData(data);

        metricsCache = data;
        cacheTimestamp = now;
      } catch (err) {
        console.error("Failed to fetch metrics:", err);
        setError("Erro ao carregar métricas");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [refreshTrigger]);

  if (loading || externalLoading) {
    return (
      <Box textAlign="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box mb={4}>
      <Typography
        variant="h5"
        fontWeight="600"
        mb={3}
        sx={{ marginBottom: "20px" }}
      >
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
          <Box
            sx={{
              display: "flex",
              height: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography variant="h5" color="#1976d2" sx={{ fontWeight: 500 }}>
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
          <Box
            sx={{
              display: "flex",
              height: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography variant="h5" color="#ffc107" sx={{ fontWeight: 500 }}>
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
              <Typography variant="h5" color="#9c27b0" sx={{ fontWeight: 500 }}>
                Menor Saída
              </Typography>
              <Typography variant="h7" fontWeight="500">
                {metricsData.lowestExit.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {metricsData.lowestExit.quantity} unid. saídas
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Divider orientation="vertical" flexItem />
        <Grid item xs={6} md={3}>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography variant="h5" color="#f44336" sx={{ fontWeight: 500 }}>
              Estoque Baixo
            </Typography>
            {metricsData.lowStockItems.length > 0 && (
              <Box
                sx={{
                  mt: 1,
                  maxHeight: "120px",
                  overflow: "auto",
                }}
              >
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
  );
}

Metrics.propTypes = {
  loading: PropTypes.bool,
  refreshTrigger: PropTypes.number,
};
