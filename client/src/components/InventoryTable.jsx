import React, { useState, useEffect, useContext } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Box, CircularProgress, Alert, TablePagination } from "@mui/material";
import { getStockMovements } from "../services/inventoryService";
import { UserContext } from "../contexts/UserContext";

function InventoryTable({ filters = {} }) {
  const { user } = useContext(UserContext);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  useEffect(() => {
    const fetchMovements = async () => {
      setLoading(true);
      try {
        const data = await getStockMovements(filters);
        // Remove items not found (itemName === "Item not found")
        const filteredData = data.filter(
          (item) => item.itemName !== "Item not found"
        );
        setMovements(filteredData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch stock movements:", err);
        setError("Falha ao carregar os movimentos de estoque");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMovements();
    }
  }, [user, filters]);

  const paginatedMovements = movements.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  useEffect(() => {
    setPage(0); // Resetar para a primeira página ao mudar filtros
  }, [filters]);

  if (loading) {
    return (
      <Box textAlign="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <TableContainer sx={{ borderRadius: 0 }} component={Paper} elevation={0}>
      <Table aria-label="movimentos de estoque">
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: "#667085" }}>Produto</TableCell>
            <TableCell sx={{ color: "#667085" }}>Preço de Compra</TableCell>
            <TableCell sx={{ color: "#667085" }}>Quantidade</TableCell>
            <TableCell sx={{ color: "#667085" }}>Categoria</TableCell>
            <TableCell sx={{ color: "#667085" }}>
              Data de Validade/Saída
            </TableCell>
            <TableCell sx={{ color: "#667085" }}>Status</TableCell>
            <TableCell sx={{ color: "#667085" }}>Disponibilidade</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedMovements.length > 0 ? (
            paginatedMovements.map((item) => (
              <TableRow key={`${item.type}-${item.id}`}>
                <TableCell component="th" scope="row">
                  {item.itemName}
                </TableCell>
                <TableCell>{item.price ? "R$ " + item.price : "-"}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.category || "-"}</TableCell>
                <TableCell>{item.expirationDate || item.date || "-"}</TableCell>
                <TableCell
                  sx={{
                    color: item.type === "Entrada" ? "green" : "red",
                    fontWeight: "bold",
                  }}
                >
                  {item.type}
                </TableCell>
                <TableCell
                  sx={{ color: item.availability.color, fontWeight: "bold" }}
                >
                  {item.availability.status}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} align="center">
                Nenhum movimento de estoque encontrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <TablePagination
        sx={{ color: "#667085" }}
        component="div"
        count={movements.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[]}
      />
    </TableContainer>
  );
}

export default InventoryTable;
